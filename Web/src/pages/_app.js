import { SessionProvider } from "next-auth/react";
import { ChakraProvider } from "@chakra-ui/react";
import Head from "next/head";
import { extendTheme } from "@chakra-ui/react";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  const theme = extendTheme({
    components: {
      Radio: {
        baseStyle: {
          label: {
            touchAction: "none",
          },
        },
      },
    },
  });

  return (
    <SessionProvider session={session}>
      <ChakraProvider theme={theme}>
        <Head>
          <title>ARMazing</title>
        </Head>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
}
