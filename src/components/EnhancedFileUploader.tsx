'use client';

import { useState } from "react";

export default function EnhancedFileUploader() {
  const [selected, setSelected] = useState<File | null>(null);
  const [secureName, setSecureName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSecureName("");
    setDownloadUrl("");
    setProgress(0);
    const file = e.target.files?.[0];
    if (file) {
      setSelected(file);
    }
  };

  const uploadWithProgress = (file: File, uploadUrl: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(e.loaded / e.total);
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
  };

  const handleUpload = async () => {
    if (!selected) return;
    setError(null);
    setUploading(true);
    setProgress(0);
    
    try {
      // Step 1: get upload URL
      const resp = await fetch(
        `/api/files/upload-url?filename=${encodeURIComponent(selected.name)}`
      );
      if (!resp.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, secureFilename } = await resp.json();

      // Step 2: upload with progress
      await uploadWithProgress(selected, uploadUrl);
      setSecureName(secureFilename);

      // Step 3: get download link
      const dlResp = await fetch(
        `/api/files/download-url?filename=${encodeURIComponent(secureFilename)}`
      );
      if (!dlResp.ok) throw new Error("Failed to get download URL");
      const { downloadUrl: dl } = await dlResp.json();
      setDownloadUrl(dl);
      setProgress(1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadClick = async () => {
    if (!secureName) return;
    try {
      const resp = await fetch(
        `/api/files/download-url?filename=${encodeURIComponent(secureName)}`
      );
      if (!resp.ok) throw new Error("Failed to get download URL");
      const { downloadUrl } = await resp.json();
      
      const fileRes = await fetch(downloadUrl);
      if (!fileRes.ok) throw new Error("Download failed");
      const blob = await fileRes.blob();
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = secureName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="max-w-md space-y-4 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Enhanced File Upload</h2>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Choose file to upload
        </label>
        <input 
          type="file" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {selected && (
        <div className="p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-700">
            <strong>Selected:</strong> {selected.name}
          </div>
          <div className="text-xs text-gray-500">
            Size: {Math.round(selected.size / 1024)} KB
          </div>
          
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>

          {uploading && progress > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {Math.round(progress * 100)}% uploaded
              </div>
            </div>
          )}
        </div>
      )}

      {secureName && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <div className="text-sm text-green-800">
            <strong>✓ Upload successful!</strong>
          </div>
          <div className="text-xs text-green-600 mt-1">
            Stored as: <code className="bg-green-100 px-1 rounded">{secureName}</code>
          </div>
          
          {downloadUrl && (
            <div className="mt-3 space-x-2">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Preview/View
              </a>
              <button
                onClick={handleDownloadClick}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Download
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-sm text-red-800">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}
    </div>
  );
}
