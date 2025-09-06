import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadService, FileUploadResponse, FileUploadProgress, FileValidationOptions } from '../../services/file-upload.service';
import { Subscription } from 'rxjs';

interface UploadedFile extends FileUploadResponse {
  id: string;
  localUrl?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() multiple: boolean = false;
  @Input() accept: string = '*/*';
  @Input() maxSize: number = 10 * 1024 * 1024; // 10MB default
  @Input() maxFiles: number = 10;
  @Input() uploadType: 'image' | 'document' | 'any' = 'any';
  @Input() autoUpload: boolean = true;
  @Input() showPreview: boolean = true;
  @Input() compressImages: boolean = false;
  @Input() imageMaxWidth: number = 1920;
  @Input() imageMaxHeight: number = 1080;
  @Input() imageQuality: number = 0.8;

  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() uploadComplete = new EventEmitter<FileUploadResponse[]>();
  @Output() uploadError = new EventEmitter<string>();
  @Output() fileRemoved = new EventEmitter<string>();

  selectedFiles: File[] = [];
  uploadedFiles: UploadedFile[] = [];
  uploadProgress: Map<string, FileUploadProgress> = new Map();
  isDragOver: boolean = false;
  isUploading: boolean = false;

  private uploadSubscription?: Subscription;
  private progressSubscription?: Subscription;

  constructor(private fileUploadService: FileUploadService) {}

  ngOnInit(): void {
    // Subscribe to upload progress
    this.progressSubscription = this.fileUploadService.uploadProgress$.subscribe(
      progress => {
        this.uploadProgress.set(progress.fileName, progress);
        this.checkUploadComplete();
      }
    );

    // Set accept attribute based on upload type
    if (this.uploadType === 'image') {
      this.accept = 'image/*';
    } else if (this.uploadType === 'document') {
      this.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar';
    }
  }

  ngOnDestroy(): void {
    this.uploadSubscription?.unsubscribe();
    this.progressSubscription?.unsubscribe();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private async handleFiles(files: File[]): Promise<void> {
    // Filter and validate files
    const validFiles = files.filter(file => this.validateFile(file));

    if (validFiles.length === 0) {
      return;
    }

    // Check max files limit
    if (this.selectedFiles.length + validFiles.length > this.maxFiles) {
      this.uploadError.emit(`Maximum ${this.maxFiles} files allowed`);
      return;
    }

    // Add files to selected files
    this.selectedFiles.push(...validFiles);
    this.filesSelected.emit(this.selectedFiles);

    // Generate previews for images
    if (this.showPreview) {
      for (const file of validFiles) {
        if (this.fileUploadService.isImage(file)) {
          try {
            const preview = await this.fileUploadService.getFilePreview(file);
            const uploadedFile: UploadedFile = {
              id: this.generateId(),
              success: false,
              fileUrl: '',
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              uploadedAt: new Date(),
              localUrl: preview
            };
            this.uploadedFiles.push(uploadedFile);
          } catch (error) {
            console.error('Error generating preview:', error);
          }
        }
      }
    }

    // Auto upload if enabled
    if (this.autoUpload) {
      this.uploadFiles(validFiles);
    }
  }

  private validateFile(file: File): boolean {
    // Check file size
    if (file.size > this.maxSize) {
      this.uploadError.emit(`${file.name} exceeds maximum size of ${this.fileUploadService.formatFileSize(this.maxSize)}`);
      return false;
    }

    // Check file type
    if (this.uploadType === 'image' && !this.fileUploadService.isImage(file)) {
      this.uploadError.emit(`${file.name} is not a valid image file`);
      return false;
    }

    if (this.uploadType === 'document' && !this.fileUploadService.isDocument(file)) {
      this.uploadError.emit(`${file.name} is not a valid document file`);
      return false;
    }

    return true;
  }

  uploadFiles(files?: File[]): void {
    const filesToUpload = files || this.selectedFiles;

    if (filesToUpload.length === 0) {
      return;
    }

    this.isUploading = true;

    // Initialize progress for each file
    filesToUpload.forEach(file => {
      this.uploadProgress.set(file.name, {
        fileName: file.name,
        progress: 0,
        status: 'pending'
      });
    });

    // Upload based on type and settings
    if (this.uploadType === 'image' && this.compressImages) {
      // Upload images with compression
      filesToUpload.forEach(file => {
        this.uploadSubscription = this.fileUploadService.uploadImage(file, {
          compress: true,
          maxWidth: this.imageMaxWidth,
          maxHeight: this.imageMaxHeight,
          quality: this.imageQuality
        }).subscribe({
          next: (response) => this.handleUploadSuccess(response, file),
          error: (error) => this.handleUploadError(error, file)
        });
      });
    } else if (filesToUpload.length === 1) {
      // Upload single file
      const file = filesToUpload[0];
      this.uploadSubscription = this.fileUploadService.uploadFile(file).subscribe({
        next: (response) => this.handleUploadSuccess(response, file),
        error: (error) => this.handleUploadError(error, file)
      });
    } else {
      // Upload multiple files
      this.uploadSubscription = this.fileUploadService.uploadMultipleFiles(filesToUpload).subscribe({
        next: (responses) => {
          responses.forEach((response, index) => {
            this.handleUploadSuccess(response, filesToUpload[index]);
          });
        },
        error: (error) => {
          filesToUpload.forEach(file => {
            this.handleUploadError(error, file);
          });
        }
      });
    }
  }

  private handleUploadSuccess(response: FileUploadResponse, file: File): void {
    // Update uploaded file with response
    const uploadedFile = this.uploadedFiles.find(f => f.fileName === file.name);
    if (uploadedFile) {
      Object.assign(uploadedFile, response);
    } else {
      this.uploadedFiles.push({
        ...response,
        id: this.generateId()
      });
    }

    // Update progress
    this.uploadProgress.set(file.name, {
      fileName: file.name,
      progress: 100,
      status: 'completed',
      response
    });
  }

  private handleUploadError(error: any, file: File): void {
    const errorMessage = error.message || 'Upload failed';

    // Update progress
    this.uploadProgress.set(file.name, {
      fileName: file.name,
      progress: 0,
      status: 'error',
      error: errorMessage
    });

    this.uploadError.emit(`${file.name}: ${errorMessage}`);
  }

  private checkUploadComplete(): void {
    const allUploads = Array.from(this.uploadProgress.values());
    const completedUploads = allUploads.filter(u => u.status === 'completed');

    if (completedUploads.length === this.selectedFiles.length && this.selectedFiles.length > 0) {
      this.isUploading = false;
      const responses = completedUploads
        .map(u => u.response)
        .filter(r => r !== undefined) as FileUploadResponse[];
      this.uploadComplete.emit(responses);
    }
  }

  removeFile(fileId: string): void {
    // Remove from uploaded files
    const fileIndex = this.uploadedFiles.findIndex(f => f.id === fileId);
    if (fileIndex > -1) {
      const file = this.uploadedFiles[fileIndex];
      this.uploadedFiles.splice(fileIndex, 1);

      // Remove from selected files
      const selectedIndex = this.selectedFiles.findIndex(f => f.name === file.fileName);
      if (selectedIndex > -1) {
        this.selectedFiles.splice(selectedIndex, 1);
      }

      // Remove progress
      this.uploadProgress.delete(file.fileName);

      // Emit event
      this.fileRemoved.emit(file.fileUrl);

      // Delete from server if uploaded
      if (file.fileUrl) {
        this.fileUploadService.deleteFile(file.fileUrl).subscribe();
      }
    }
  }

  retryUpload(fileName: string): void {
    const file = this.selectedFiles.find(f => f.name === fileName);
    if (file) {
      this.uploadFiles([file]);
    }
  }

  clearAll(): void {
    // Delete all uploaded files from server
    this.uploadedFiles.forEach(file => {
      if (file.fileUrl) {
        this.fileUploadService.deleteFile(file.fileUrl).subscribe();
      }
    });

    // Clear local state
    this.selectedFiles = [];
    this.uploadedFiles = [];
    this.uploadProgress.clear();

    // Reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  openFileDialog(): void {
    this.fileInput.nativeElement.click();
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return 'fa-file-image';
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fa-file-excel';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fa-file-powerpoint';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'fa-file-archive';
    if (fileType.includes('text')) return 'fa-file-alt';
    return 'fa-file';
  }

  getProgressColor(progress: FileUploadProgress): string {
    if (progress.status === 'error') return '#e74c3c';
    if (progress.status === 'completed') return '#27ae60';
    if (progress.status === 'uploading') return '#3498db';
    return '#95a5a6';
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
