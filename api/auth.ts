import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, createAuthToken } from './_lib/verify-auth';

const TOKEN_MAX_AGE = 60 * 60 * 24 * 90; // 90 days in seconds

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
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

    const token = createAuthToken(password);

    res.setHeader('Set-Cookie', [
      `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_MAX_AGE}; Secure`,
    ]);

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
