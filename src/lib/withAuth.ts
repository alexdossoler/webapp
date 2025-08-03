import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./auth";

export type AuthenticatedRequest = NextRequest & {
  user: {
    id: string;
    role: string;
    email?: string;
    name?: string;
  };
};

/**
 * HOC for protecting API routes with authentication
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredRole?: string
) {
  return async (req: NextRequest) => {
    try {
      const auth = req.headers.get("authorization");
      
      if (!auth || !auth.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Missing or invalid Authorization header" },
          { status: 401 }
        );
      }

      const token = auth.slice(7);
      const payload = verifyToken(token);

      if (requiredRole && payload.role !== requiredRole) {
        return NextResponse.json(
          { error: "Forbidden: insufficient permissions" },
          { status: 403 }
        );
      }

      // Attach user data to request
      (req as any).user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
        name: payload.name,
      };

      return handler(req as AuthenticatedRequest);
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  };
}

/**
 * Extract user from authenticated request
 */
export function getUser(req: AuthenticatedRequest) {
  return req.user;
}
