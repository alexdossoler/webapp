# Frontend Integration Guide

This document provides ready-to-use code snippets and components for integrating with the secure file upload system.

## 🚀 Quick Start

### 1. Basic File Upload Helper

```typescript
// src/lib/file-helpers.ts
export async function uploadFile(file: File) {
  const resp = await fetch(`/api/files/upload-url?filename=${encodeURIComponent(file.name)}`);
  if (!resp.ok) throw new Error('Failed to get upload URL');
  const { uploadUrl, secureFilename } = await resp.json();
  
  const put = await fetch(uploadUrl, { method: 'PUT', body: file });
  if (!put.ok) throw new Error('Upload failed');
  
  return { secureFilename, uploadResult: await put.json() };
}

export async function downloadFile(filename: string) {
  const resp = await fetch(`/api/files/download-url?filename=${encodeURIComponent(filename)}`);
  if (!resp.ok) throw new Error('Failed to get download URL');
  const { downloadUrl } = await resp.json();
  
  const res = await fetch(downloadUrl);
  if (!res.ok) throw new Error('Download failed');
  return await res.blob();
}
```

### 2. Upload with Progress Tracking

```typescript
function uploadWithProgress(
  file: File, 
  uploadUrl: string, 
  onProgress: (progress: number) => void
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(e.loaded / e.total);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed: ${xhr.responseText}`));
      }
    };
    
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(file);
  });
}
```

### 3. React Hook for File Operations

```typescript
// src/hooks/useFileUpload.ts
import { useState, useCallback } from 'react';

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Get upload URL
      const resp = await fetch(
        `/api/files/upload-url?filename=${encodeURIComponent(file.name)}`
      );
      if (!resp.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, secureFilename } = await resp.json();

      // Upload with progress
      await uploadWithProgress(file, uploadUrl, setProgress);
      
      return { secureFilename };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, progress, error };
}
```

## 🎯 Complete React Components

### Enhanced File Uploader Component

See `src/components/EnhancedFileUploader.tsx` for a complete implementation with:
- Progress tracking
- Error handling
- Download capabilities
- Responsive design

### Usage in Your Components

```tsx
import EnhancedFileUploader from '@/components/EnhancedFileUploader';

export function MyComponent() {
  return (
    <div>
      <h2>Upload Files</h2>
      <EnhancedFileUploader />
    </div>
  );
}
```

## 🔧 Integration with Forms

### Adding File Upload to Existing Forms

```tsx
import { useFileUpload } from '@/hooks/useFileUpload';

export function ContactForm() {
  const { upload, uploading, progress } = useFileUpload();
  const [attachments, setAttachments] = useState<string[]>([]);

  const handleFileUpload = async (file: File) => {
    try {
      const { secureFilename } = await upload(file);
      setAttachments(prev => [...prev, secureFilename]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    // Include attachments in form submission
    formData.append('attachments', JSON.stringify(attachments));
    
    // Submit form...
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      
      <div>
        <label>Attachments</label>
        <input 
          type="file" 
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
        />
        {uploading && <div>Upload progress: {Math.round(progress * 100)}%</div>}
      </div>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 🛡️ Security Best Practices

### 1. File Validation

```typescript
function validateFile(file: File): boolean {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large. Maximum size is 10MB.');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not allowed.');
  }

  return true;
}
```

### 2. Error Handling with Retry

```typescript
async function uploadWithRetry(file: File, maxRetries = 3) {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFile(file);
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors
      if (lastError.message.includes('400') || lastError.message.includes('401')) {
        throw lastError;
      }
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }
  
  throw lastError!;
}
```

## 📱 Mobile Considerations

### Touch-Friendly File Picker

```tsx
export function MobileFileUpload() {
  return (
    <div className="relative">
      <input
        type="file"
        accept="image/*"
        capture="environment" // Use camera on mobile
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
      />
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <div className="text-lg">📸 Take Photo or Choose File</div>
        <div className="text-sm text-gray-500 mt-2">
          Tap to select from gallery or take a photo
        </div>
      </div>
    </div>
  );
}
```

## 🔗 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/files/upload-url?filename=...` | Get presigned upload URL |
| PUT | `/api/files/upload?token=...` | Upload file with token |
| GET | `/api/files/download-url?filename=...` | Get presigned download URL |
| GET | `/api/files/download?token=...` | Download file with token |

### Response Formats

**Upload URL Response:**
```json
{
  "uploadUrl": "PUT /api/files/upload?token=...",
  "secureFilename": "1234567890_abc123.jpg",
  "method": "PUT",
  "originalFilename": "photo.jpg"
}
```

**Download URL Response:**
```json
{
  "downloadUrl": "GET /api/files/download?token=...",
  "filename": "1234567890_abc123.jpg"
}
```

## 🚀 Demo Pages

Visit these pages to see the file upload system in action:

- **File Demo**: `/file-demo` - Interactive demo of all upload features
- **Test Upload**: `/test-upload` - Simple upload testing page
- **Main Form**: `/` - Full intake form with file uploads
- **Admin Dashboard**: `/admin` - View uploaded files in admin interface

## 🔧 Environment Variables

Make sure these are set in your `.env` file:

```env
# Required for file upload system
FILE_UPLOAD_SECRET="your-secure-secret"
FILE_UPLOAD_BASE_DIR="./uploads"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional
MAX_FILE_SIZE=10485760  # 10MB
```

## 📝 TypeScript Types

```typescript
// File upload response types
export interface UploadUrlResponse {
  uploadUrl: string;
  secureFilename: string;
  method: string;
  originalFilename: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  filename: string;
}

export interface FileUploadResult {
  secureFilename: string;
  uploadResult: any;
}
```

---

This integration guide provides everything needed to implement secure file uploads in your application. All components are production-ready and follow security best practices.
