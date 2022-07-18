import React, { useEffect } from 'react';
import { Flex, Box, Stack, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';

/**
 * This component renders the unauthorized page when the user access an
 * admins-only page. The component will automatically redirect the user to the default
 * dashboard after a specified period of time.
 */
export default function Unauthorized() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push('/');
    }, 5000);
  }, [router]);

  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack mx='auto' maxW='lg' py={12} px={6}>
        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <Stack align='center'>
            <Heading fontSize='4xl'>Unauthorized user</Heading>
            <Text fontSize='sm' color='gray.600'>
              You are unauthorized to visit the target page.
            </Text>
            <Text mt={4} fontSize='sm' color='gray.600'>
              Redirecting you to main page in 5 seconds...
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
