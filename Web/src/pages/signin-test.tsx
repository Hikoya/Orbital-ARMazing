import React, { useState, useEffect, useRef } from 'react';
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { signIn } from 'next-auth/react';
import { checkerString } from '@helper/common';

/**
 * This component renders the signin page that is displayed to the user
 * if there is no previous session found.
 */
export default function SignInTest(props: Promise<{ data: string }>) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [url, setURL] = useState('http://localhost:3000'); // default

  const emailDB = useRef('');
  const passwordDB = useRef('');
  const [errorMsg, setError] = useState('');

  useEffect(() => {
    async function fetchData(propsField: Promise<{ data: string }>) {
      const propRes = await propsField;
      if (checkerString(propRes.data)) {
        setURL(propRes.data);
      }
    }
    fetchData(props);
  }, [url, props]);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (
      checkerString(emailDB.current) &&
      emailDB.current.includes('@') &&
      checkerString(passwordDB.current)
    ) {
      try {
        setError('');
        setLoading(true);
        await signIn('credentials', {
          username: emailDB.current,
          password: passwordDB.current,
          callbackUrl: `${url}/`,
        });
        return true;
      } catch (error) {
        return false;
      }
    } else {
      setError('Please enter a valid email or enter a password');
      return false;
    }
  };

  return (
    <Flex minH='100vh' align='center' justify='center' bg='gray.50'>
      <Stack spacing={8} mx='auto' maxW='lg' py={12} px={6}>
        <Stack align='center'>
          <Heading fontSize='4xl'>ARMazing</Heading>
        </Stack>

        {checkerString(errorMsg) && (
          <Stack align='center'>
            <Text>{errorMsg}</Text>
          </Stack>
        )}

        <Box rounded='lg' bg='white' boxShadow='lg' p={8}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id='email'>
                <FormLabel>Email address</FormLabel>
                <Input
                  type='email'
                  name='email'
                  placeholder='test@gmail.com'
                  size='lg'
                  value={email}
                  onChange={(event) => {
                    setEmail(event.currentTarget.value);
                    emailDB.current = event.currentTarget.value;
                  }}
                />
              </FormControl>
              <FormControl id='password'>
                <FormLabel>Password</FormLabel>
                <Input
                  type='password'
                  name='password'
                  placeholder=''
                  size='lg'
                  value={password}
                  onChange={(event) => {
                    setPassword(event.currentTarget.value);
                    passwordDB.current = event.currentTarget.value;
                  }}
                />
              </FormControl>
              <Stack spacing={10}>
                <Button
                  type='submit'
                  bg='blue.400'
                  disabled={loading}
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                >
                  Sign in
                </Button>
              </Stack>
            </Stack>
          </form>

          {loading && (
            <Stack spacing={10} mt={5}>
              <Stack align='center'>
                <Text fontSize='sm' color='gray.600'>
                  Logging in...
                </Text>
                <Spinner />
              </Stack>
            </Stack>
          )}
        </Box>
      </Stack>
    </Flex>
  );
}

export async function getServerSideProps() {
  return {
    props: (async function Props() {
      try {
        return {
          data: process.env.NEXTAUTH_URL,
        };
      } catch (error) {
        return {
          data: null,
        };
      }
    })(),
  };
}
