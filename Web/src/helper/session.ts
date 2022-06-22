import { getSession } from 'next-auth/react';
import { levels } from '@constants/admin';
import { Session } from 'next-auth/core/types';

export const currentSession = async (req = null): Promise<Session> => {
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    let session = null;
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
    const isServer = typeof window === 'undefined';
    let session = null;
    if (isServer && req) {
      session = await getSession({ req });
    } else {
      session = await getSession();
    }

    return session;
  }
};
