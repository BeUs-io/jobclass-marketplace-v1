export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxDocumentSize: 20 * 1024 * 1024, // 20MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    allowedDocumentTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip'
    ],
    chunkSize: 1024 * 1024, // 1MB chunks for large files
    compressionQuality: 0.8,
    thumbnailSize: 200
  },
  firebase: {
    apiKey: 'your-firebase-api-key',
    authDomain: 'your-firebase-auth-domain',
    projectId: 'your-firebase-project-id',
    storageBucket: 'your-firebase-storage-bucket',
    messagingSenderId: 'your-firebase-messaging-sender-id',
    appId: 'your-firebase-app-id'
  },
  stripe: {
    publishableKey: 'your-stripe-publishable-key'
  },
  cloudinary: {
    cloudName: 'your-cloudinary-cloud-name',
    uploadPreset: 'your-cloudinary-upload-preset'
  }
};
