import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'listenify-super-secret-production-key-2025';
export const AUTH_COOKIE_NAME = 'listenify_session';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwtToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(req?: Request): Promise<JwtPayload | null> {
  // 1. Check Authorization header if request is provided
  if (req) {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const verified = verifyJwtToken(token);
      if (verified) return verified;
    }
  }

  // 2. Check cookies
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const verified = verifyJwtToken(token);
      if (verified) return verified;
    }
  } catch {
    // cookies() might fail if called outside Request context
  }

  return null;
}

