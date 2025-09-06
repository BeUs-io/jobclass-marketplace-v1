# JobClass Marketplace V1

A comprehensive freelance marketplace platform built with Angular, featuring advanced order management and file upload capabilities.

## 🚀 Features Implemented

### 1. Freelancer Manage Orders
- **Order Dashboard**: Complete overview of all freelancer orders
- **Order Statistics**: Track total orders, earnings, completion rate, and ratings
- **Order Management**: Accept, deliver, or cancel orders
- **Messaging System**: Built-in communication with clients
- **Delivery Tracking**: Monitor delivery deadlines and days remaining
- **Revision Management**: Handle revision requests from clients
- **File Attachments**: Manage project files and deliverables

### 2. Freelancer Create Service
- **Multi-Step Form**: 5-step wizard for service creation
  - Basic Information (title, category, tags)
  - Service Description (details, requirements)
  - Pricing & Packages (Basic/Standard/Premium)
  - Gallery & Portfolio (images, videos, portfolio links)
  - Review & Publish
- **Package System**: Three-tier pricing structure
- **Extra Services**: Add-on services for additional fees
- **Image Gallery**: Upload and manage service images
- **FAQs Section**: Add frequently asked questions
- **SEO Settings**: Optimize service for search engines
- **Draft Saving**: Save progress and continue later

### 3. Client Manage Orders
- **Order Tracking**: Monitor all placed orders
- **Order Timeline**: Visual timeline of order progress
- **Deliverables Management**: Download delivered files
- **Review System**: Rate and review completed orders
- **Revision Requests**: Request changes within revision limits
- **Dispute Resolution**: Dispute orders with support team
- **Payment Status**: Track payment and refund status
- **Reorder Feature**: Quickly reorder previous services

### 4. File Upload System
- **Drag & Drop**: Intuitive drag-and-drop interface
- **Multiple File Support**: Upload multiple files simultaneously
- **Image Compression**: Automatic image optimization
- **Chunked Uploads**: Handle large files with chunked uploading
- **Progress Tracking**: Real-time upload progress indicators
- **File Preview**: Preview images before upload
- **File Validation**: Type and size validation
- **Error Handling**: Comprehensive error messages and retry options

## 📁 Project Structure

```
jobclass-angular/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── file-upload/          # Reusable file upload component
│   │   │   └── file-upload-example/  # Usage examples
│   │   ├── pages/
│   │   │   └── marketplace/
│   │   │       ├── manage-orders/    # Freelancer order management
│   │   │       ├── create-service/   # Service creation wizard
│   │   │       └── client-manage-orders/ # Client order management
│   │   ├── services/
│   │   │   └── file-upload.service.ts # File upload service
│   │   └── environments/
│   │       └── environment.ts        # Environment configuration
│   └── ...
└── ...
```

## 🛠️ Technologies Used

- **Frontend Framework**: Angular 15+
- **Component Architecture**: Standalone Components
- **Forms**: Reactive Forms with validation
- **Styling**: Custom CSS with responsive design
- **File Handling**: HTML5 File API
- **HTTP Client**: Angular HttpClient
- **RxJS**: Reactive programming with Observables

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Angular CLI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BeUs-io/jobclass-marketplace-v1.git
cd jobclass-marketplace-v1
```

2. Navigate to the Angular project:
```bash
cd jobclass-angular
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
ng serve
```

5. Open your browser and navigate to:
```
http://localhost:4200
```

## 📝 API Integration

The application is designed to work with a backend API. Update the `environment.ts` file with your API endpoints:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://your-api-url/api',
  // ... other configuration
};
```

## 🎨 Component Usage

### File Upload Component

```html
<app-file-upload
  [multiple]="true"
  [uploadType]="'image'"
  [maxSize]="5242880"
  [compressImages]="true"
  (uploadComplete)="onUploadComplete($event)"
  (uploadError)="onUploadError($event)"
></app-file-upload>
```

### Properties
- `multiple`: Allow multiple file selection
- `uploadType`: 'image' | 'document' | 'any'
- `maxSize`: Maximum file size in bytes
- `maxFiles`: Maximum number of files
- `autoUpload`: Auto-upload on selection
- `showPreview`: Show image previews
- `compressImages`: Enable image compression
- `imageMaxWidth`: Maximum image width
- `imageMaxHeight`: Maximum image height
- `imageQuality`: Compression quality (0-1)

### Events
- `filesSelected`: Emitted when files are selected
- `uploadComplete`: Emitted when upload completes
- `uploadError`: Emitted on upload error
- `fileRemoved`: Emitted when file is removed

## 🔒 Security Considerations

- Implement proper authentication and authorization
- Validate file types and sizes on the server
- Scan uploaded files for malware
- Use secure file storage (AWS S3, Google Cloud Storage)
- Implement rate limiting for uploads
- Sanitize file names and paths

## 📈 Future Enhancements

- [ ] Real-time notifications using WebSockets
- [ ] Video file processing and thumbnails
- [ ] Document preview functionality
- [ ] Integration with cloud storage services
- [ ] Advanced image editing tools
- [ ] Bulk file operations
- [ ] File versioning system
- [ ] Collaborative file sharing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📧 Contact

For questions or support, please contact: support@beus.io

## 🙏 Acknowledgments

- Angular Team for the excellent framework
- Font Awesome for icons
- The open-source community

---

**Note**: This is a frontend implementation. A backend API is required for full functionality including:
- User authentication
- File storage
- Database operations
- Payment processing
- Email notifications
