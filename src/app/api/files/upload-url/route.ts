import { NextRequest, NextResponse } from "next/server";
import { createToken, validateFilename, generateSecureFilename } from "@/lib/file-sign";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const originalFilename = searchParams.get("filename");
  
  if (!originalFilename) {
    return NextResponse.json({ error: "filename required" }, { status: 400 });
  }

  // Generate a secure filename to prevent conflicts and path traversal
  const secureFilename = generateSecureFilename(originalFilename);
  
  if (!validateFilename(secureFilename)) {
    return NextResponse.json({ error: "invalid filename" }, { status: 400 });
  }

  const token = createToken(secureFilename, 300); // 5 minutes
  const uploadUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/files/upload?token=${encodeURIComponent(
    token
  )}`;

  return NextResponse.json({ 
    uploadUrl, 
    method: "PUT", 
    expiresIn: 300,
    secureFilename,
    originalFilename
  });
}
