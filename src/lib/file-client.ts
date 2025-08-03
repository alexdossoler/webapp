/**
 * Client-side utilities for secure file operations
 */

export interface FileUploadResult {
  success: boolean;
  filename?: string;
  originalName?: string;
  size?: number;
  type?: string;
  error?: string;
}

/**
 * Upload a file using presigned URL
 */
export async function uploadFile(file: File): Promise<FileUploadResult> {
  try {
    // Get presigned upload URL
    const urlResponse = await fetch(`/api/files/upload-url?filename=${encodeURIComponent(file.name)}`);
    
    if (!urlResponse.ok) {
      const error = await urlResponse.json();
      return { success: false, error: error.error || 'Failed to get upload URL' };
    }
    
    const { uploadUrl, secureFilename, originalFilename } = await urlResponse.json();
    
    // Upload the file
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.json();
      return { success: false, error: error.error || 'Upload failed' };
    }

    const result = await uploadResponse.json();
    
    return {
      success: true,
      filename: secureFilename,
      originalName: originalFilename,
      size: result.size,
      type: result.type
    };

  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
}

/**
 * Get a download URL for a file
 */
export async function getDownloadUrl(filename: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/files/download-url?filename=${encodeURIComponent(filename)}`);
    
    if (!response.ok) {
      console.error('Failed to get download URL');
      return null;
    }
    
    const { downloadUrl } = await response.json();
    return downloadUrl;

  } catch (error) {
    console.error('Download URL error:', error);
    return null;
  }
}

/**
 * Download a file and trigger browser download
 */
export async function downloadFile(filename: string, displayName?: string): Promise<boolean> {
  try {
    const downloadUrl = await getDownloadUrl(filename);
    if (!downloadUrl) return false;

    const response = await fetch(downloadUrl);
    if (!response.ok) return false;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = displayName || filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;

  } catch (error) {
    console.error('Download error:', error);
    return false;
  }
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File, 
  maxSize = 10 * 1024 * 1024, 
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: `File size too large. Maximum ${Math.round(maxSize / 1024 / 1024)}MB allowed.` 
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: `File type ${file.type} not supported. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
