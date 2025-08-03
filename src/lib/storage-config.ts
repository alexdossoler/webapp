/**
 * File Upload Security & Storage Configuration Guide
 * 
 * This file explains how to configure secure file uploads for your intake form.
 * You can easily switch between local filesystem and MinIO (S3-compatible) storage.
 */

export const SECURITY_FEATURES = {
  // ✅ File Type Validation
  // - Only allows image files (JPEG, PNG, WebP)
  // - Validates both MIME type AND file content using file-type detection
  // - Rejects executables, scripts, and potentially dangerous files
  
  // ✅ Size Constraints
  // - 5MB per file (adjustable in file-upload.ts)
  // - 30MB total per submission (prevents abuse)
  // - Maximum 6 files per submission
  
  // ✅ Content Sanitization
  // - All images are processed through Sharp
  // - EXIF metadata stripped (removes location data, camera info)
  // - Auto-rotation based on EXIF orientation
  // - Automatic resizing to max 2048px (prevents huge files)
  // - Thumbnail generation (300px) for previews
  
  // ✅ Secure File Handling
  // - Randomized UUIDs for filenames (prevents guessing)
  // - No user-provided filenames in storage
  // - Files stored outside web root (not directly accessible)
  // - Controlled access via API routes with validation
  
  // ✅ Storage Security
  // - Local: Files stored in uploads/ directory with restricted access
  // - MinIO: Private bucket with signed URL access
  // - No direct file system access from web
} as const;

export const STORAGE_OPTIONS = {
  // Option 1: Local Filesystem (Default)
  // Pros: Simple, no external dependencies, full control
  // Cons: Harder to scale, manual backups
  local: {
    setup: [
      "1. Files stored in ./uploads/intake/ directory",
      "2. Thumbnails in ./uploads/intake/thumbs/",
      "3. Served via /api/uploads/[filename] route",
      "4. Automatic directory creation",
      "5. Cache headers for performance"
    ],
    envVars: {
      STORAGE_TYPE: "local"
    }
  },

  // Option 2: MinIO (S3-Compatible)
  // Pros: Object storage, versioning, easier backups, can scale to multiple servers
  // Cons: Additional service to run, slightly more complex
  minio: {
    setup: [
      "1. Install MinIO: docker run -p 9000:9000 -p 9001:9001 minio/minio server /data --console-address :9001",
      "2. Create bucket 'intake-uploads' in MinIO console",
      "3. Set bucket to private (default)",
      "4. Files served via signed URLs (1 hour expiry)",
      "5. Automatic cleanup possible with bucket policies"
    ],
    envVars: {
      STORAGE_TYPE: "minio",
      MINIO_ENDPOINT: "http://localhost:9000",
      MINIO_ACCESS_KEY: "your_access_key", 
      MINIO_SECRET_KEY: "your_secret_key",
      MINIO_BUCKET: "intake-uploads",
      MINIO_REGION: "us-east-1"
    }
  }
} as const;

export const CONFIGURATION_GUIDE = {
  // Quick Start: Local Storage (No setup required)
  quickStart: {
    steps: [
      "1. No environment variables needed",
      "2. Files automatically stored in ./uploads/intake/",
      "3. Ready to use immediately"
    ]
  },

  // Production: MinIO Setup
  production: {
    steps: [
      "1. Deploy MinIO server or use AWS S3",
      "2. Create bucket for uploads",
      "3. Set environment variables in .env.local",
      "4. Restart application"
    ],
    benefits: [
      "✅ Better for multiple server instances", 
      "✅ Built-in versioning and backup options",
      "✅ Signed URLs for secure access",
      "✅ Can set automatic cleanup policies"
    ]
  },

  // Security Recommendations
  security: {
    server: [
      "🔒 Run uploads directory outside web root",
      "🔒 Set proper file permissions (no execute)",
      "🔒 Enable virus scanning with ClamAV (optional)",
      "🔒 Set up log monitoring for upload patterns",
      "🔒 Rate limit upload endpoints",
      "🔒 Regular cleanup of orphaned files"
    ],
    application: [
      "🔒 Validate files on both client and server",
      "🔒 Never trust client-provided filenames",
      "🔒 Process images to strip metadata",
      "🔒 Generate unique IDs for all uploads",
      "🔒 Implement file retention policies",
      "🔒 Monitor disk usage and set alerts"
    ]
  }
} as const;

// Example: Switching to MinIO
export const SWITCH_TO_MINIO_EXAMPLE = `
// 1. Add to .env.local:
STORAGE_TYPE=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=intake-uploads

// 2. Start MinIO (Docker):
docker run -p 9000:9000 -p 9001:9001 \\
  minio/minio server /data --console-address :9001

// 3. Create bucket via MinIO console at http://localhost:9001

// 4. Restart your Next.js application

// That's it! Files now stored in MinIO with signed URL access.
`;

// Example: Production AWS S3 Setup
export const AWS_S3_EXAMPLE = `
// For production with AWS S3:
STORAGE_TYPE=minio
MINIO_ENDPOINT=https://s3.amazonaws.com
MINIO_ACCESS_KEY=your_aws_access_key
MINIO_SECRET_KEY=your_aws_secret_key
MINIO_BUCKET=your-bucket-name
MINIO_REGION=us-east-1

// Note: The S3 client is compatible with AWS S3
// Just point the endpoint to s3.amazonaws.com
`;
