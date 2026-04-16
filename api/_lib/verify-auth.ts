import type { VercelRequest } from '@vercel/node';
import { createHmac } from 'node:crypto';

function createToken(password: string): string {
  const secret = process.env.AUTH_PASSWORD ?? '';
  return createHmac('sha256', secret).update(password).digest('hex');
}

export function verifyAuth(req: VercelRequest): boolean {
  const password = process.env.AUTH_PASSWORD;
  if (!password) return true;

  const cookie = req.headers.cookie ?? '';
  const match = cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
  if (!match) return false;

  const expected = createToken(password);
  return match[1] === expected;
}

export function createAuthToken(password: string): string {
  return createToken(password);
}
