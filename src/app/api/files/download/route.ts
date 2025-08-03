import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/file-sign";
import path from "path";
import fs from "fs";

const BASE = process.env.FILE_UPLOAD_BASE_DIR || "./uploads";

function safePath(filename: string) {
  return path.join(BASE, path.basename(filename));
}

export async function GET(req: NextRequest) {
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

  const filePath = safePath(payload.filename);
  
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "file not found" }, { status: 404 });
  }

  try {
    const stats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);
    
    // Determine content type based on file extension
    const ext = path.extname(payload.filename).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json',
    };
    
    const contentType = contentTypes[ext as keyof typeof contentTypes] || 'application/octet-stream';

    return new NextResponse(fileStream as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Content-Disposition": `inline; filename="${path.basename(payload.filename)}"`,
        "Cache-Control": "private, max-age=300", // 5 minutes cache
      },
    });

  } catch (e) {
    console.error("File download error:", e);
    return NextResponse.json({ error: "failed to read file" }, { status: 500 });
  }
}
