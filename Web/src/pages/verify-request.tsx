import React from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';

/**
 * This component renders the verify request page that the user sees upon successful
 * input of their email during the login process. The component will remind the users
 * that an email has been sent and to check their email to complete the login process.
 */
export default function VerifyRequest() {
  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack mx='auto' maxW='xl' py={12} px={6}>
        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <Stack align='center' textAlign='center'>
            <Heading fontSize='4xl'>Authentication</Heading>
            <Text fontSize='sm' color='gray.600' mt={10}>
              An email has been sent to you!
            </Text>
            <Text fontSize='sm' color='gray.600' mt={5}>
              Please click on the link in the email to complete your
              authentication.
            </Text>
            <Text fontSize='sm' color='gray.600' mt={5}>
              If you do not see the email in a few minutes, check your “junk
              mail” folder or “spam” folder.
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
