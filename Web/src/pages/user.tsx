import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import Auth from '@components/Auth';
import {
  Button,
  Box,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Stack,
  Select,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react';
import TableWidget from '@components/TableWidget';
import LoadingModal from '@components/LoadingModal';

import { Result } from 'types/api';
import { User } from 'types/user';

import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

import { checkerString } from '@helper/common';

import { levels } from '@constants/admin';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * This component renders the /user path, showing a table of all the users visible to the user,
 * as well as provide options to edit user permission
 */
export default function UserComponent() {
  const [loadingData, setLoading] = useState(false);
  const toast = useToast();

  const userDBEdit = useRef('');
  const [user, setUser] = useState('');

  const [userDropdown, setUserDropdown] = useState<JSX.Element[]>([]);
  const [levelDropdown, setLevelDropdown] = useState<JSX.Element[]>([]);

  const [level, setLevel] = useState(0);
  const levelDBEdit = useRef(0);

  const [errorMsg, setError] = useState('');
  const memberData = useRef<User[]>([]);

  const [data, setData] = useState<User[]>([]);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<User[] | null>(null);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  /**
   * Resets all values to their default values upon successful request
   */
  const reset = async () => {
    setError('');
    setUser('');
    setLevel(0);

    userDBEdit.current = '';
    levelDBEdit.current = 0;
  };

  /**
   * Input validation for editing user permission
   */
  const validateFields = (idField: string, levelField: number) => {
    if (!checkerString(idField)) {
      setError('Please choose a user!');
      return false;
    }

    const len: number = Object.keys(levels).length;
    if (levelField >= len || levelField < 0) {
      setError('Invalid permission level!');
      return false;
    }

    return true;
  };

  /**
   * Changes all input fields to the given User details
   */
  const changeDataEdit = (dataField: User) => {
    setLevel(dataField.level);
    levelDBEdit.current = dataField.level;
  };

  /**
   * Event that is called when a user selects a level from the dropdown menu
   */
  const onLevelChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      levelDBEdit.current = Number(value);
      setLevel(Number(value));
    }
  };

  /**
   * Event that is called when a user selects a user from the dropdown menu
   */
  const onUserChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      userDBEdit.current = value;
      setUser(value);

      if (memberData.current !== []) {
        for (let key = 0; key < memberData.current.length; key += 1) {
          if (memberData.current[key]) {
            const dataField: User = memberData.current[key];
            if (dataField.email === value) {
              changeDataEdit(dataField);
            }
          }
        }
      }
    }
  };

  /**
   * Creates a dropdown menu for all users fetched
   *
   * Populates the data on the table in the end.
   */
  const includeActionButton = useCallback(async (content: User[]) => {
    const selectionEdit: JSX.Element[] = [];
    selectionEdit.push(<option key='' value='' aria-label='Default' />);

    const allUsers: User[] = [];

    for (let key = 0; key < content.length; key += 1) {
      if (content[key]) {
        const dataField: User = content[key];
        selectionEdit.push(
          <option key={dataField.id} value={dataField.email}>
            {dataField.email}
          </option>,
        );
        allUsers.push(dataField);
      }
    }

    memberData.current = allUsers;
    setUserDropdown(selectionEdit);
    setData(content);
  }, []);

  /**
   * Fetches user data by calling the API
   */
  const fetchData = useCallback(async () => {
    setSubmitButtonPressed(true);
    try {
      const rawResponse = await fetch('/api/user/fetch', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg as User[]);
      }
    } catch (error) {
      console.error(error);
    }
    setSubmitButtonPressed(false);
  }, [includeActionButton]);

  /**
   * Validates the input from the user, and calls the API to edit user permission   *
   * Resets the input fields upon successful request.
   */
  const handleSubmitEdit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (validateFields(userDBEdit.current, levelDBEdit.current)) {
      setSubmitButtonPressed(true);
      try {
        const rawResponse = await fetch('/api/user/edit', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userDBEdit.current,
            level: levelDBEdit.current,
          }),
        });
        const content = await rawResponse.json();
        console.log(content);
        if (content.status) {
          await reset();
          toast({
            title: 'Success',
            description: content.msg,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          await fetchData();
        } else {
          toast({
            title: 'Error',
            description: content.error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error(error);
      }
      setSubmitButtonPressed(false);
    }
  };

  /**
   * Generates the user permission dropdown menu
   */
  const generateLevels = useCallback(async () => {
    const levelD: JSX.Element[] = [];

    const keys: string[] = Object.keys(levels);
    const values = Object.values(levels);

    for (let key = 0; key < keys.length; key += 1) {
      levelD.push(
        <option key={`levels-${values[key]}`} value={values[key]}>
          {keys[key]}
        </option>,
      );
    }

    setLevelDropdown(levelD);
  }, []);

  useEffect(() => {
    async function generate() {
      setLoading(true);

      await fetchData();
      await generateLevels();

      setLoading(false);
    }

    generate();
  }, [fetchData, generateLevels]);

  const columns = useMemo(
    () => [
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Admin',
        accessor: 'adminStr',
      },
      {
        Header: 'Level',
        accessor: 'levelStr',
      },
    ],
    [],
  );

  /**
   * Event that is called when the user types something in the search bar
   */
  const handleSearch = (event: { target: { value: string } }) => {
    const searchInput = event.target.value;
    setSearch(searchInput);

    if (checkerString(searchInput)) {
      const filteredDataField = data.filter((value) =>
        value.email.toLowerCase().includes(searchInput.toLowerCase()),
      );

      setFilteredData(filteredDataField);
    } else {
      setFilteredData(null);
    }
  };

  return (
    <Auth admin>
      <Box>
        <Box bg='white' borderRadius='lg' p={8} color='gray.700' shadow='base'>
          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
          />

          {loadingData && (data === null || data.length === 0) && (
            <Box mt={30}>
              <Stack justify='center' align='center'>
                <Text>Loading Please wait...</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length === 0 && (
            <Box w='full' mt={30} overflow='auto'>
              <Stack justify='center' align='center'>
                <Text>No users found</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length > 0 && (
            <Stack>
              <Box w='full' mt={30} overflow='auto'>
                <Stack align='center' justify='center' spacing={30} mb={10}>
                  <InputGroup>
                    <InputLeftAddon>Search:</InputLeftAddon>
                    <Input
                      type='text'
                      placeholder=''
                      value={search}
                      onChange={handleSearch}
                    />
                  </InputGroup>
                </Stack>

                <TableWidget
                  key={1}
                  columns={columns}
                  data={
                    filteredData && filteredData.length ? filteredData : data
                  }
                />
              </Box>
            </Stack>
          )}
        </Box>

        {data.length > 0 && (
          <MotionSimpleGrid
            mt='3'
            minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <MotionBox key={2}>
              <Stack
                spacing={4}
                w='full'
                maxW='md'
                bg='white'
                rounded='xl'
                boxShadow='lg'
                p={6}
                my={12}
              >
                <Heading size='md'>Edit Permissions</Heading>
                <form onSubmit={handleSubmitEdit}>
                  <Stack spacing={4}>
                    <Stack spacing={5} w='full'>
                      <Text>Select User</Text>
                      <Select onChange={onUserChange} size='sm' value={user}>
                        {userDropdown}
                      </Select>
                    </Stack>

                    <Stack spacing={5} w='full'>
                      <Text>Select Level</Text>
                      <Select onChange={onLevelChange} size='sm' value={level}>
                        {levelDropdown}
                      </Select>
                    </Stack>

                    {errorMsg && (
                      <Stack align='center'>
                        <Text>{errorMsg}</Text>
                      </Stack>
                    )}

                    <Stack spacing={5}>
                      <Button
                        type='submit'
                        disabled={submitButtonPressed}
                        bg='blue.400'
                        color='white'
                        _hover={{
                          bg: 'blue.500',
                        }}
                      >
                        Update
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Stack>
            </MotionBox>
          </MotionSimpleGrid>
        )}
      </Box>
    </Auth>
  );
}
