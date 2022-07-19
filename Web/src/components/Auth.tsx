import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { currentSession } from '@helper/session';
import Layout from '@layout/index';
import Loading from '@layout/Loading';
import { Session } from 'next-auth/core/types';

/**
 * This component checks whether a session is present, and redirects the user
 * to the signin page if no session is found.
 *
 * Additionally, the component checks whether the user is an admin for admin-level
 * pages.
 */
function Auth({ children, admin }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const hasUser = !!session?.user;
  const router = useRouter();
  const devSession = useRef<Session | null>(null);
  const isAdmin = !!admin;

  useEffect(() => {
    async function fetchData() {
      try {
        if (
          process.env.SETDEV === 'true' &&
          (!process.env.NODE_ENV ||
            process.env.NODE_ENV === 'development' ||
            process.env.ENVIRONMENT === 'development')
        ) {
          devSession.current = await currentSession();
          if (
            isAdmin &&
            devSession.current !== null &&
            !devSession.current.user.admin
          ) {
            router.push('/unauthorized');
          }
        } else if (!loading && !hasUser) {
          router.push('/signin');
        } else if (isAdmin && session !== null && !session.user.admin) {
          router.push('/unauthorized');
        }
      } catch (error) {
        router.push('/unauthorized');
      }
    }

    fetchData();
  }, [loading, hasUser, isAdmin, router, session]);

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return <Layout session={session}>{children}</Layout>;
  }
  if (loading || !hasUser) {
    return <Loading />;
  }

  return <Layout session={session}>{children}</Layout>;
}

export default Auth;
