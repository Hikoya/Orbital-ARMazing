import { levels } from '@constants/admin';
import { Session } from 'next-auth/core/types';
import { getSession } from 'next-auth/react';

/**
 * Retrieves the current session. This function is used for client-side code
 * If development, mocks a fake session and returns the session.
 *
 * @return a Promise containing a Result
 */
export const currentSession = async (): Promise<Session | null> => {
  if (
    process.env.SETDEV === 'true' &&
    (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
  ) {
    let session: Session | null = null;
    session = {
      expires: '1',
      user: {
        username: 'Test user',
        email: 'testing@test.com',
        admin: true,
        level: levels.ORGANIZER,
      },
    };

    return session;
  } else {
    let session: Session | null = (await getSession()) as Session;
    return session;
  }
};
