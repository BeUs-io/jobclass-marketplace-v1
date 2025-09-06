import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface FileUploadResponse {
  success: boolean;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  thumbnailUrl?: string;
}

export interface FileUploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  response?: FileUploadResponse;
}

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  maxFiles?: number;
  minImageWidth?: number;
  minImageHeight?: number;
  maxImageWidth?: number;
  maxImageHeight?: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000/api';
  private uploadProgress = new Subject<FileUploadProgress>();
  public uploadProgress$ = this.uploadProgress.asObservable();

  // Default file validation settings
  private defaultImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  private defaultDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed'
  ];

  private defaultMaxSize = 10 * 1024 * 1024; // 10MB
  private defaultImageMaxSize = 5 * 1024 * 1024; // 5MB
  private defaultDocumentMaxSize = 20 * 1024 * 1024; // 20MB

  constructor(private http: HttpClient) {}

  /**
   * Upload a single file
   */
  uploadFile(file: File, endpoint: string = '/upload', validationOptions?: FileValidationOptions): Observable<FileUploadResponse> {
    // Validate file
    const validation = this.validateFile(file, validationOptions);
    if (!validation.isValid) {
      return throwError(() => new Error(validation.error));
    }

    const formData = new FormData();
    formData.append('file', file, file.name);

    // Add metadata
    formData.append('fileType', file.type);
    formData.append('fileSize', file.size.toString());
    formData.append('uploadedAt', new Date().toISOString());

    return this.http.post<FileUploadResponse>(`${this.apiUrl}${endpoint}`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event, file)),
      catchError(error => this.handleError(error, file))
    );
  }

  /**
   * Upload multiple files
   */
  uploadMultipleFiles(files: File[], endpoint: string = '/upload/multiple', validationOptions?: FileValidationOptions): Observable<FileUploadResponse[]> {
    // Validate number of files
    if (validationOptions?.maxFiles && files.length > validationOptions.maxFiles) {
      return throwError(() => new Error(`Maximum ${validationOptions.maxFiles} files allowed`));
    }

    const formData = new FormData();
    const validFiles: File[] = [];

    // Validate each file
    for (const file of files) {
      const validation = this.validateFile(file, validationOptions);
      if (!validation.isValid) {
        this.uploadProgress.next({
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: validation.error
        });
      } else {
        validFiles.push(file);
        formData.append('files', file, file.name);
      }
    }

    if (validFiles.length === 0) {
      return throwError(() => new Error('No valid files to upload'));
    }

    return this.http.post<FileUploadResponse[]>(`${this.apiUrl}${endpoint}`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getMultipleEventMessage(event, validFiles)),
      catchError(error => this.handleMultipleError(error, validFiles))
    );
  }

  /**
   * Upload image with preview and compression
   */
  uploadImage(file: File, options?: {
    compress?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    generateThumbnail?: boolean;
    thumbnailSize?: number;
  }): Observable<FileUploadResponse> {
    return new Observable(observer => {
      // Validate image file
      const validation = this.validateFile(file, {
        allowedTypes: this.defaultImageTypes,
        maxSize: this.defaultImageMaxSize
      });

      if (!validation.isValid) {
        observer.error(new Error(validation.error));
        return;
      }

      // Process image if compression is requested
      if (options?.compress) {
        this.compressImage(file, options).then(compressedFile => {
          this.uploadFile(compressedFile, '/upload/image').subscribe({
            next: response => observer.next(response),
            error: error => observer.error(error),
            complete: () => observer.complete()
          });
        }).catch(error => observer.error(error));
      } else {
        this.uploadFile(file, '/upload/image').subscribe({
          next: response => observer.next(response),
          error: error => observer.error(error),
          complete: () => observer.complete()
        });
      }
    });
  }

  /**
   * Upload document
   */
  uploadDocument(file: File): Observable<FileUploadResponse> {
    const validation = this.validateFile(file, {
      allowedTypes: this.defaultDocumentTypes,
      maxSize: this.defaultDocumentMaxSize
    });

    if (!validation.isValid) {
      return throwError(() => new Error(validation.error));
    }

    return this.uploadFile(file, '/upload/document');
  }

  /**
   * Upload with chunking for large files
   */
  uploadLargeFile(file: File, chunkSize: number = 1024 * 1024): Observable<FileUploadResponse> {
    const totalChunks = Math.ceil(file.size / chunkSize);
    const chunks: Blob[] = [];

    // Create chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      chunks.push(file.slice(start, end));
    }

    return new Observable(observer => {
      this.uploadChunks(chunks, file.name, 0, totalChunks).subscribe({
        next: response => observer.next(response),
        error: error => observer.error(error),
        complete: () => observer.complete()
      });
    });
  }

  /**
   * Delete uploaded file
   */
  deleteFile(fileUrl: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/upload/delete`, {
      params: { fileUrl }
    });
  }

  /**
   * Get file preview URL
   */
  getFilePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File is not an image'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File, options?: FileValidationOptions): { isValid: boolean; error?: string } {
    // Check file size
    const maxSize = options?.maxSize || this.defaultMaxSize;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${this.formatFileSize(maxSize)}`
      };
    }

    // Check file type
    if (options?.allowedTypes) {
      if (!options.allowedTypes.includes(file.type)) {
        return {
          isValid: false,
          error: `File type ${file.type} is not allowed`
        };
      }
    }

    // For images, check dimensions if specified
    if (file.type.startsWith('image/') && (options?.minImageWidth || options?.minImageHeight || options?.maxImageWidth || options?.maxImageHeight)) {
      // This would need to be async to load image and check dimensions
      // For now, we'll skip this validation
    }

    return { isValid: true };
  }

  /**
   * Compress image
   */
  private compressImage(file: File, options: any): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event: any) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          if (options.maxWidth && width > options.maxWidth) {
            height = (options.maxWidth / width) * height;
            width = options.maxWidth;
          }

          if (options.maxHeight && height > options.maxHeight) {
            width = (options.maxHeight / height) * width;
            height = options.maxHeight;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, file.type, options.quality || 0.8);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  /**
   * Upload chunks recursively
   */
  private uploadChunks(chunks: Blob[], fileName: string, currentChunk: number, totalChunks: number): Observable<FileUploadResponse> {
    if (currentChunk >= totalChunks) {
      // All chunks uploaded, finalize
      return this.finalizeChunkedUpload(fileName);
    }

    const formData = new FormData();
    formData.append('chunk', chunks[currentChunk]);
    formData.append('fileName', fileName);
    formData.append('chunkIndex', currentChunk.toString());
    formData.append('totalChunks', totalChunks.toString());

    return new Observable(observer => {
      this.http.post(`${this.apiUrl}/upload/chunk`, formData).subscribe({
        next: () => {
          // Upload next chunk
          this.uploadProgress.next({
            fileName,
            progress: ((currentChunk + 1) / totalChunks) * 100,
            status: 'uploading'
          });

          this.uploadChunks(chunks, fileName, currentChunk + 1, totalChunks).subscribe({
            next: response => observer.next(response),
            error: error => observer.error(error),
            complete: () => observer.complete()
          });
        },
        error: error => observer.error(error)
      });
    });
  }

  /**
   * Finalize chunked upload
   */
  private finalizeChunkedUpload(fileName: string): Observable<FileUploadResponse> {
    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload/finalize`, {
      fileName
    });
  }

  /**
   * Handle upload progress events
   */
  private getEventMessage(event: HttpEvent<any>, file: File): any {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        const percentDone = event.total ? Math.round(100 * event.loaded / event.total) : 0;
        this.uploadProgress.next({
          fileName: file.name,
          progress: percentDone,
          status: 'uploading'
        });
        break;
      case HttpEventType.Response:
        this.uploadProgress.next({
          fileName: file.name,
          progress: 100,
          status: 'completed',
          response: event.body
        });
        return event.body;
    }
  }

  /**
   * Handle multiple file upload progress
   */
  private getMultipleEventMessage(event: HttpEvent<any>, files: File[]): any {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        const percentDone = event.total ? Math.round(100 * event.loaded / event.total) : 0;
        files.forEach(file => {
          this.uploadProgress.next({
            fileName: file.name,
            progress: percentDone,
            status: 'uploading'
          });
        });
        break;
      case HttpEventType.Response:
        files.forEach((file, index) => {
          this.uploadProgress.next({
            fileName: file.name,
            progress: 100,
            status: 'completed',
            response: event.body[index]
          });
        });
        return event.body;
    }
  }

  /**
   * Handle upload errors
   */
  private handleError(error: any, file: File): Observable<never> {
    let errorMessage = 'File upload failed';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else if (error.status === 413) {
      errorMessage = 'File is too large';
    } else if (error.status === 415) {
      errorMessage = 'File type not supported';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    this.uploadProgress.next({
      fileName: file.name,
      progress: 0,
      status: 'error',
      error: errorMessage
    });

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Handle multiple file upload errors
   */
  private handleMultipleError(error: any, files: File[]): Observable<never> {
    files.forEach(file => {
      this.uploadProgress.next({
        fileName: file.name,
        progress: 0,
        status: 'error',
        error: 'Upload failed'
      });
    });

    return throwError(() => error);
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get file extension
   */
  getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Check if file is image
   */
  isImage(file: File): boolean {
    return this.defaultImageTypes.includes(file.type);
  }

  /**
   * Check if file is document
   */
  isDocument(file: File): boolean {
    return this.defaultDocumentTypes.includes(file.type);
  }
}
