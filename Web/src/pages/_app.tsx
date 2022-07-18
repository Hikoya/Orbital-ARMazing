import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { ChakraProvider } from '@chakra-ui/react';
import Head from 'next/head';
import type { AppProps } from 'next/app';

/**
 * Entry point of the application
 */
export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ChakraProvider>
      <SessionProvider
        session={session}
        refetchInterval={Number(process.env.NEXTAUTH_REFRESH_INTERVAL)}
      >
        <Head>
          <title>ARMazing</title>
        </Head>
        <Component {...pageProps} />
      </SessionProvider>
    </ChakraProvider>
  );
}
