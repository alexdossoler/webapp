'use client';

import { useState } from 'react';
import SecureFileUpload from '@/components/SecureFileUpload';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  downloadUrl?: string;
}

export default function TestUploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    console.log('Files updated:', newFiles);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Secure File Upload Test</h1>
            <p className="mt-2 text-gray-600">
              Test the new presigned URL-based file upload system. No AWS required!
            </p>
          </div>

          <div className="space-y-6">
            <SecureFileUpload
              onFilesChange={handleFilesChange}
              maxFiles={5}
              maxSize={10 * 1024 * 1024} // 10MB
              acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']}
            />

            {files.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Results</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(files, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Files are uploaded using HMAC-signed presigned URLs</li>
                <li>• No AWS/S3 dependencies - completely self-hosted</li>
                <li>• Files are stored securely in local filesystem</li>
                <li>• Download URLs are also presigned and time-limited</li>
                <li>• File validation happens both client and server-side</li>
                <li>• Unique filenames prevent conflicts and security issues</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                ← Back to Intake Form
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Admin Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
