import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { FileUploadResponse } from '../../services/file-upload.service';

@Component({
  selector: 'app-file-upload-example',
  standalone: true,
  imports: [CommonModule, FileUploadComponent],
  template: `
    <div class="upload-examples">
      <h1>File Upload Examples</h1>

      <!-- Example 1: Single Image Upload with Compression -->
      <div class="example-section">
        <h2>Profile Picture Upload</h2>
        <p>Single image upload with compression and preview</p>
        <app-file-upload
          [multiple]="false"
          [uploadType]="'image'"
          [maxSize]="5242880"
          [compressImages]="true"
          [imageMaxWidth]="800"
          [imageMaxHeight]="800"
          [imageQuality]="0.8"
          (uploadComplete)="onProfileImageUploaded($event)"
          (uploadError)="onUploadError($event)"
        ></app-file-upload>
      </div>

      <!-- Example 2: Multiple Document Upload -->
      <div class="example-section">
        <h2>Document Attachments</h2>
        <p>Multiple document upload (PDF, Word, Excel, etc.)</p>
        <app-file-upload
          [multiple]="true"
          [uploadType]="'document'"
          [maxSize]="20971520"
          [maxFiles]="5"
          [autoUpload]="false"
          [showPreview]="false"
          (uploadComplete)="onDocumentsUploaded($event)"
          (uploadError)="onUploadError($event)"
        ></app-file-upload>
      </div>

      <!-- Example 3: Portfolio Gallery -->
      <div class="example-section">
        <h2>Portfolio Gallery</h2>
        <p>Multiple image upload with previews</p>
        <app-file-upload
          [multiple]="true"
          [uploadType]="'image'"
          [maxSize]="10485760"
          [maxFiles]="10"
          [compressImages]="true"
          [imageMaxWidth]="1920"
          [imageMaxHeight]="1080"
          [imageQuality]="0.9"
          (uploadComplete)="onGalleryUploaded($event)"
          (uploadError)="onUploadError($event)"
        ></app-file-upload>
      </div>

      <!-- Example 4: Any File Type -->
      <div class="example-section">
        <h2>General File Upload</h2>
        <p>Accept any file type with manual upload trigger</p>
        <app-file-upload
          [multiple]="true"
          [uploadType]="'any'"
          [maxSize]="52428800"
          [maxFiles]="3"
          [autoUpload]="false"
          [showPreview]="true"
          (filesSelected)="onFilesSelected($event)"
          (uploadComplete)="onGeneralFilesUploaded($event)"
          (uploadError)="onUploadError($event)"
          (fileRemoved)="onFileRemoved($event)"
        ></app-file-upload>
      </div>

      <!-- Upload Results -->
      <div class="upload-results" *ngIf="uploadedFiles.length > 0">
        <h3>Uploaded Files:</h3>
        <ul>
          <li *ngFor="let file of uploadedFiles">
            <strong>{{ file.fileName }}</strong> -
            <a [href]="file.fileUrl" target="_blank">View</a>
            <span class="file-meta">
              ({{ formatFileSize(file.fileSize) }},
              Uploaded: {{ file.uploadedAt | date:'short' }})
            </span>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .upload-examples {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    h1 {
      color: #2d3748;
      margin-bottom: 2rem;
      text-align: center;
    }

    .example-section {
      margin-bottom: 3rem;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .example-section h2 {
      color: #4a5568;
      margin-bottom: 0.5rem;
    }

    .example-section p {
      color: #718096;
      margin-bottom: 1.5rem;
    }

    .upload-results {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f7fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .upload-results h3 {
      color: #2d3748;
      margin-bottom: 1rem;
    }

    .upload-results ul {
      list-style: none;
      padding: 0;
    }

    .upload-results li {
      padding: 0.75rem;
      background: white;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    .upload-results a {
      color: #4299e1;
      text-decoration: none;
      margin: 0 0.5rem;
    }

    .upload-results a:hover {
      text-decoration: underline;
    }

    .file-meta {
      color: #718096;
      font-size: 0.875rem;
    }
  `]
})
export class FileUploadExampleComponent {
  uploadedFiles: FileUploadResponse[] = [];

  onProfileImageUploaded(files: FileUploadResponse[]): void {
    console.log('Profile image uploaded:', files);
    this.uploadedFiles.push(...files);
    // Handle profile image upload
    // Update user profile with new image URL
  }

  onDocumentsUploaded(files: FileUploadResponse[]): void {
    console.log('Documents uploaded:', files);
    this.uploadedFiles.push(...files);
    // Handle document uploads
    // Save document references to database
  }

  onGalleryUploaded(files: FileUploadResponse[]): void {
    console.log('Gallery images uploaded:', files);
    this.uploadedFiles.push(...files);
    // Handle gallery uploads
    // Update portfolio gallery
  }

  onGeneralFilesUploaded(files: FileUploadResponse[]): void {
    console.log('General files uploaded:', files);
    this.uploadedFiles.push(...files);
    // Handle general file uploads
  }

  onFilesSelected(files: File[]): void {
    console.log('Files selected:', files);
    // Handle file selection before upload
    // Can perform additional validation here
  }

  onFileRemoved(fileUrl: string): void {
    console.log('File removed:', fileUrl);
    // Handle file removal
    // Update database to remove file reference
    this.uploadedFiles = this.uploadedFiles.filter(f => f.fileUrl !== fileUrl);
  }

  onUploadError(error: string): void {
    console.error('Upload error:', error);
    // Handle upload errors
    // Show error notification to user
    alert(`Upload Error: ${error}`);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
