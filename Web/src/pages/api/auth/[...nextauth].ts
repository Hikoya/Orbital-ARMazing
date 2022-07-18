import NextAuth from 'next-auth';
import type { NextApiRequest, NextApiResponse } from 'next';
import { options } from '@constants/nextAuthOptions';

/**
 * API Route to handle all Next-Auth authentication requests and validations
 */
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'HEAD') {
    return res.status(200);
  }

  const au = NextAuth(req, res, options);
  return au;
}
