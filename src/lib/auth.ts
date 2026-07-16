import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'gearsync-secret-key-1893-production';
const TOKEN_NAME = 'gearsync_auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'customer' | 'mechanic' | 'admin';
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

// Sign JWT
export function signToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verify JWT
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

// Set HttpOnly Auth Cookie using Next.js headers cookies API
export async function setAuthCookie(payload: TokenPayload) {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  });
}

// Clear Auth Cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}

// Get user info from cookie
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Authenticate request and enforce role
export async function getAuthenticatedUser(
  requiredRoles?: Array<'customer' | 'mechanic' | 'admin'>
): Promise<TokenPayload | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return null;
  }
  return user;
}
