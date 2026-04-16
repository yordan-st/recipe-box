import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const TOKEN_MAX_AGE = 60 * 60 * 24 * 90; // 90 days in seconds

function createToken(password: string): string {
  const secret = process.env.AUTH_PASSWORD ?? '';
  return crypto.createHmac('sha256', secret).update(password).digest('hex');
}

export function verifyAuth(req: VercelRequest): boolean {
  const password = process.env.AUTH_PASSWORD;
  if (!password) return true; // No password configured = open access

  const cookie = req.headers.cookie ?? '';
  const match = cookie.match(/(?:^|;\s*)auth_token=([^;]*)/);
  if (!match) return false;

  const expected = createToken(password);
  return match[1] === expected;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    // Check if currently authenticated
    const authed = verifyAuth(req);
    return res.status(200).json({ authenticated: authed });
  }

  if (req.method === 'POST') {
    const { password } = req.body ?? {};
    const expected = process.env.AUTH_PASSWORD;

    if (!expected) {
      return res.status(200).json({ success: true, message: 'No password configured' });
    }

    if (!password || password !== expected) {
      return res.status(401).json({ success: false, message: 'Wrong password' });
    }

    const token = createToken(password);

    res.setHeader('Set-Cookie', [
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_MAX_AGE}; Secure`,
    ]);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
