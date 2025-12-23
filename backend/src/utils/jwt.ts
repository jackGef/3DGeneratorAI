import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-super-secret-refresh-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  roles: string[];
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function getRefreshTokenExpiry(): Date {
  const expiresIn = REFRESH_TOKEN_EXPIRES_IN;
  const now = new Date();
  
  // Parse duration string (e.g., "7d", "30d", "1h")
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    // Default to 7 days if parsing fails
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  const [, amount, unit] = match;
  const value = parseInt(amount);
  
  switch (unit) {
    case 'd': // days
      return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
    case 'h': // hours
      return new Date(now.getTime() + value * 60 * 60 * 1000);
    case 'm': // minutes
      return new Date(now.getTime() + value * 60 * 1000);
    case 's': // seconds
      return new Date(now.getTime() + value * 1000);
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}
