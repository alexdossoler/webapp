import crypto from "crypto";

const SECRET = process.env.FILE_UPLOAD_SECRET!;
if (!SECRET) throw new Error("Missing FILE_UPLOAD_SECRET");

export type SignedPayload = {
  filename: string;
  expires: number; // epoch seconds
};

/**
 * Create a token for a given filename with a TTL (seconds).
 */
export function createToken(filename: string, ttlSeconds = 300): string {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${filename}|${expires}`;
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}|${signature}`).toString("base64url");
}

/**
 * Verify token and return payload.
 */
export function verifyToken(token: string): SignedPayload {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf-8");
  } catch (e) {
    throw new Error("Malformed token");
  }
  const parts = decoded.split("|");
  if (parts.length !== 3) throw new Error("Invalid token format");
  const [filename, expiresStr, signature] = parts;
  const expires = parseInt(expiresStr, 10);
  if (isNaN(expires)) throw new Error("Invalid expiry");

  const expectedSig = crypto
    .createHmac("sha256", SECRET)
    .update(`${filename}|${expires}`)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    throw new Error("Signature mismatch");
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > expires) throw new Error("Token expired");

  return { filename, expires };
}

/**
 * Generate a unique filename with timestamp and random suffix
 */
export function generateSecureFilename(originalName: string): string {
  const ext = originalName.split('.').pop() || '';
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  return `${timestamp}_${random}.${ext}`;
}

/**
 * Validate filename for security (no path traversal, etc.)
 */
export function validateFilename(filename: string): boolean {
  if (!filename || filename.includes("..") || filename.startsWith("/") || filename.includes("\\")) {
    return false;
  }
  // Only allow alphanumeric, dots, dashes, underscores
  return /^[a-zA-Z0-9._-]+$/.test(filename);
}
