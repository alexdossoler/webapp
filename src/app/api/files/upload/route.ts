import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/file-sign";
import path from "path";
import fs from "fs/promises";

const BASE = process.env.FILE_UPLOAD_BASE_DIR || "./uploads";

function safePath(filename: string) {
  // ensure no directory traversal
  return path.join(BASE, path.basename(filename));
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  
  if (!token) {
    return NextResponse.json({ error: "missing token" }, { status: 400 });
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 401 });
  }

  const dest = safePath(payload.filename);
  await fs.mkdir(path.dirname(dest), { recursive: true });

  try {
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Basic file type validation by checking file signature
    const fileSignature = buffer.slice(0, 4).toString('hex');
    const allowedSignatures = {
      'ffd8ffe0': 'jpg',  // JPEG
      'ffd8ffe1': 'jpg',  // JPEG
      'ffd8ffe2': 'jpg',  // JPEG
      '89504e47': 'png',  // PNG
      '47494638': 'gif',  // GIF
      '52494646': 'webp', // WEBP (starts with RIFF)
      '25504446': 'pdf',  // PDF
    };

    const detectedType = allowedSignatures[fileSignature.toLowerCase() as keyof typeof allowedSignatures];
    if (!detectedType) {
      return NextResponse.json({ error: "unsupported file type" }, { status: 400 });
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return NextResponse.json({ error: "file too large" }, { status: 400 });
    }

    await fs.writeFile(dest, buffer);
    
    return NextResponse.json({ 
      success: true, 
      filename: payload.filename,
      size: buffer.length,
      type: detectedType
    });

  } catch (e) {
    console.error("File upload error:", e);
    return NextResponse.json({ error: "failed to write file" }, { status: 500 });
  }
}
