import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

export type JwtPayload = {
  sub: string; // user id
  role: string;
  email?: string;
  name?: string;
};

/**
 * Sign a JWT token
 */
export function signToken(payload: JwtPayload, opts?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d",
    ...(opts || {}),
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random string for JWT secret
 */
export function generateSecret(): string {
  return require('crypto').randomBytes(48).toString('hex');
}
