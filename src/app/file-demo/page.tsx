'use client';

import EnhancedFileUploader from '@/components/EnhancedFileUploader';
import SecureFileUpload from '@/components/SecureFileUpload';

export default function FileDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            File Upload Demo
          </h1>
          <p className="text-gray-600">
            Demonstration of secure file upload capabilities with progress tracking
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Enhanced Uploader with Progress */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Enhanced Uploader (with Progress)
            </h2>
            <EnhancedFileUploader />
          </div>

          {/* Original Secure Uploader */}
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Drag & Drop Uploader
            </h2>
            <SecureFileUpload 
              onFilesChange={(files: any[]) => {
                console.log('Files uploaded:', files);
              }} 
            />
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            File Upload System Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Security Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• HMAC-signed presigned URLs</li>
                <li>• File type validation via magic numbers</li>
                <li>• Secure filename generation</li>
                <li>• Token-based access control</li>
                <li>• Directory traversal protection</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">User Experience</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time upload progress</li>
                <li>• Drag and drop support</li>
                <li>• File preview capabilities</li>
                <li>• Error handling and retry logic</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-900 mb-2">API Endpoints</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div><code>GET /api/files/upload-url</code> - Get presigned upload URL</div>
              <div><code>PUT /api/files/upload</code> - Upload file with token</div>
              <div><code>GET /api/files/download-url</code> - Get presigned download URL</div>
              <div><code>GET /api/files/download</code> - Download file with token</div>
            </div>
          </div>
        </div>

        {/* Back to Main App */}
        <div className="text-center mt-8">
          <a 
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            ← Back to Intake Form
          </a>
          <a 
            href="/admin"
            className="inline-block ml-4 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Admin Dashboard →
          </a>
        </div>
      </div>
    </div>
  );
}
