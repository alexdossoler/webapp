import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";

async function handleGET(req: NextRequest) {
  // The user is already attached to req by withAuth middleware
  const user = (req as any).user;
  
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export async function GET(req: NextRequest) {
  return withAuth(handleGET)(req);
}
