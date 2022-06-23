import { getSession } from 'next-auth/react';
import { levels } from '@constants/admin';
import { Session } from 'next-auth/core/types';
import { NextApiRequest } from 'next/types';

export const currentSession = async (
  req: NextApiRequest | null = null,
): Promise<Session | null> => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    let session: Session | null = null;
    session = {
      expires: '1',
      user: {
        username: 'Test user',
        email: 'testing@test.com',
        admin: true,
        level: levels.USER,
      },
    };

    return session;
  } else {
    const isServer: boolean = typeof window === 'undefined';
    let session: Session | null = null;
    if (isServer && req) {
      session = (await getSession({ req })) as Session;
      return session;
    } else {
      session = (await getSession()) as Session;
      return session;
    }
  }
};
