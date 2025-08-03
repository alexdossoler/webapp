import { NextRequest, NextResponse } from "next/server";
import { createToken, validateFilename } from "@/lib/file-sign";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = searchParams.get("filename");
  
  if (!filename) {
    return NextResponse.json({ error: "filename required" }, { status: 400 });
  }
  
  if (!validateFilename(filename)) {
    return NextResponse.json({ error: "invalid filename" }, { status: 400 });
  }

  const token = createToken(filename, 300); // 5 minutes for download
  const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/files/download?token=${encodeURIComponent(
    token
  )}`;

  return NextResponse.json({ 
    downloadUrl, 
    expiresIn: 300,
    filename
  });
}
