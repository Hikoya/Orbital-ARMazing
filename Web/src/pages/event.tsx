import React, {
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import Auth from '@components/Auth';
import {
  Button,
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Textarea,
  Stack,
  Select,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react';
import TableWidget from '@components/TableWidget';
import LoadingModal from '@components/LoadingModal';

import { Result } from 'types/api';
import { Event } from 'types/event';

import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

import { checkerNumber, checkerString } from '@helper/common';
import { isValidDate } from '@constants/date';

import safeJsonStringify from 'safe-json-stringify';
import { GetServerSideProps } from 'next';
import { currentSession } from '@helper/sessionServer';
import { Session } from 'next-auth/core/types';
import { levels } from '@constants/admin';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * This component renders the /event path, showing a table of all the event visible to the user,
 * as well as provide options to edit and create new event.
 */
export default function EventComponent(props: any) {
  const [loadingData, setLoading] = useState(true);
  const toast = useToast();

  const eventIDDBEdit = useRef('');
  const [eventIDEdit, setEventIDEdit] = useState('');

  const nameDB = useRef('');
  const [name, setName] = useState('');

  const nameDBEdit = useRef('');
  const [nameEdit, setNameEdit] = useState('');

  const descriptionDB = useRef('');
  const [description, setDescription] = useState('');

  const descriptionDBEdit = useRef('');
  const [descriptionEdit, setDescriptionEdit] = useState('');

  const startDateDB = useRef('');
  const [startDate, setStartDate] = useState('');

  const startDateDBEdit = useRef('');
  const [startDateEdit, setStartDateEdit] = useState('');

  const endDateDB = useRef('');
  const [endDate, setEndDate] = useState('');

  const endDateDBEdit = useRef('');
  const [endDateEdit, setEndDateEdit] = useState('');

  const visibleDB = useRef(true);
  const [visible, setVisible] = useState(true);

  const visibleDBEdit = useRef(true);
  const [visibleEdit, setVisibleEdit] = useState(true);

  const publicDB = useRef(true);
  const [isPublic, setIsPublic] = useState(true);

  const publicDBEdit = useRef(true);
  const [isPublicEdit, setIsPublicEdit] = useState(true);

  const [errorMsg, setError] = useState('');
  const [errorMsgEdit, setErrorEdit] = useState('');

  const eventData = useRef<Event[]>([]);

  const [eventDropdown, setEventDropdown] = useState<JSX.Element[]>([]);

  const [data, setData] = useState<Event[]>([]);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<Event[] | null>(null);

  const [organizer, setOrganizer] = useState(true);

  const [submitButtonPressed, setSubmitButtonPressed] = useState(false);

  /**
   * Resets all values to their default values upon successful creation
   * of event
   */
  const reset = async () => {
    nameDB.current = '';
    descriptionDB.current = '';
    startDateDB.current = '';
    endDateDB.current = '';
    visibleDB.current = true;
    publicDB.current = true;

    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setVisible(true);
    setIsPublic(true);
    setError('');
  };

  /**
   * Resets all values to their default values upon successful editing
   * of event
   */
  const resetEdit = async () => {
    eventIDDBEdit.current = '';
    nameDBEdit.current = '';
    descriptionDBEdit.current = '';
    startDateDBEdit.current = '';
    endDateDBEdit.current = '';
    visibleDBEdit.current = true;
    publicDBEdit.current = true;

    setEventIDEdit('');
    setNameEdit('');
    setDescriptionEdit('');
    setStartDateEdit('');
    setEndDateEdit('');
    setVisibleEdit(true);
    setIsPublicEdit(true);
    setErrorEdit('');
  };

  /**
   * Input validation for creating an event
   */
  const validateFields = (
    nameFieldDB: string,
    descriptionFieldDB: string,
    startDateFieldDB: string,
    endDateFieldDB: string,
  ) => {
    // super basic validation here
    const nameField = nameFieldDB.trim();
    const descriptionField = descriptionFieldDB.trim();
    const startDateField = startDateFieldDB.trim();
    const endDateField = endDateFieldDB.trim();

    if (!checkerString(nameField)) {
      setError('Please set a name!');
      return false;
    }

    if (!checkerString(descriptionField)) {
      setError('Please set a description!');
      return false;
    }

    if (!checkerString(startDateField)) {
      setError('Please set a date!');
      return false;
    }

    if (!checkerString(endDateField)) {
      setError('Please set a date!');
      return false;
    }

    const start = new Date(startDateField);
    const end = new Date(endDateField);

    if (!isValidDate(start) || !isValidDate(end)) {
      setError('Incorrect date format');
      return false;
    }

    if (end < start) {
      setError('End date cannot be earlier than start date!');
      return false;
    }

    return true;
  };

  /**
   * Input validation for editing an event
   */
  const validateFieldsEdit = (
    idField: string,
    nameField: string,
    descriptionField: string,
    startDateField: string,
    endDateField: string,
  ) => {
    if (!checkerString(idField)) {
      setErrorEdit('Please select an event!');
      return false;
    }

    if (!checkerString(nameField)) {
      setErrorEdit('Please set a name!');
      return false;
    }

    if (!checkerString(descriptionField)) {
      setErrorEdit('Please set a description!');
      return false;
    }

    if (!checkerString(startDateField)) {
      setErrorEdit('Please set a date!');
      return false;
    }

    if (!checkerString(endDateField)) {
      setErrorEdit('Please set a date!');
      return false;
    }

    const start = new Date(startDateField);
    const end = new Date(endDateField);

    if (!isValidDate(start) || !isValidDate(end)) {
      setError('Incorrect date format');
      return false;
    }

    if (end < start) {
      setErrorEdit('End date cannot be earlier than start date!');
      return false;
    }

    return true;
  };

  /**
   * Creates a dropdown menu for all event fetched
   *
   * Populates the data on the table in the end.
   */
  const includeActionButton = useCallback(async (content: Event[]) => {
    const allEvent: Event[] = [];
    const selectionEdit: JSX.Element[] = [];

    selectionEdit.push(<option key='' value='' aria-label='Default' />);

    for (let key = 0; key < content.length; key += 1) {
      if (content[key]) {
        const dataField: Event = content[key];
        allEvent.push(dataField);

        selectionEdit.push(
          <option key={dataField.id} value={dataField.id}>
            {dataField.name}
          </option>,
        );
      }
    }

    eventData.current = allEvent;
    setData(content);
    setEventDropdown(selectionEdit);
  }, []);

  /**
   * Fetches event data by calling the API
   */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setSubmitButtonPressed(true);
    try {
      const rawResponse = await fetch('/api/event/fetch', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg as Event[]);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
    setSubmitButtonPressed(false);
  }, [includeActionButton]);

  /**
   * Validates the input from the user, and calls the API to create an event
   *
   * Resets the input fields upon successful request.
   */
  const handleSubmitCreate = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (
      validateFields(
        nameDB.current,
        descriptionDB.current,
        startDateDB.current,
        endDateDB.current,
      )
    ) {
      setSubmitButtonPressed(true);
      try {
        const rawResponse = await fetch('/api/event/create', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: nameDB.current,
            description: descriptionDB.current,
            startDate: startDateDB.current,
            endDate: endDateDB.current,
            visible: visibleDB.current,
            isPublic: publicDB.current,
          }),
        });
        const content: Result = await rawResponse.json();
        if (content.status) {
          await reset();
          toast({
            title: 'Success',
            description: content.msg as string,
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
   * Validates the input from the user, and calls the API to edit an event
   *
   * Resets the input fields upon successful request.
   */
  const handleSubmitEdit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (
      validateFieldsEdit(
        eventIDDBEdit.current,
        nameDBEdit.current,
        descriptionDBEdit.current,
        startDateDBEdit.current,
        endDateDBEdit.current,
      )
    ) {
      try {
        setSubmitButtonPressed(true);
        const rawResponse = await fetch('/api/event/edit', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: eventIDDBEdit.current,
            name: nameDBEdit.current,
            description: descriptionDBEdit.current,
            startDate: startDateDBEdit.current,
            endDate: endDateDBEdit.current,
            visible: visibleDBEdit.current,
            isPublic: publicDBEdit.current,
          }),
        });
        const content: Result = await rawResponse.json();
        if (content.status) {
          await resetEdit();
          toast({
            title: 'Success',
            description: content.msg as string,
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
   * Validates the event ID, and calls the API to delete an event
   *
   * Fetches the latest event data upon successful request.
   */
  const handleDelete = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (checkerString(eventIDDBEdit.current)) {
      setSubmitButtonPressed(true);
      try {
        const rawResponse = await fetch('/api/event/delete', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: eventIDDBEdit.current,
          }),
        });
        const content: Result = await rawResponse.json();
        if (content.status) {
          await resetEdit();
          toast({
            title: 'Success',
            description: content.msg as string,
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
   * Changes all input fields to the given Event details
   */
  const changeDataEdit = (dataField: Event) => {
    setNameEdit(dataField.name);
    setDescriptionEdit(dataField.description);

    if (dataField.startDateStr !== undefined) {
      setStartDateEdit(dataField.startDateStr);
      startDateDBEdit.current = dataField.startDateStr;
    }

    if (dataField.endDateStr !== undefined) {
      setEndDateEdit(dataField.endDateStr);
      endDateDBEdit.current = dataField.endDateStr;
    }

    setVisibleEdit(dataField.visible);
    setIsPublicEdit(dataField.isPublic);

    nameDBEdit.current = dataField.name;
    descriptionDBEdit.current = dataField.description;
    visibleDBEdit.current = dataField.visible;
    publicDBEdit.current = dataField.isPublic;
  };

  /**
   * Event that is called when a user selects an item from the event dropdown menu
   * for the Edit Event portion
   */
  const onEventChangeEdit = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDBEdit.current = value;
      setEventIDEdit(value);

      if (eventData.current !== []) {
        for (let key = 0; key < eventData.current.length; key += 1) {
          if (eventData.current[key]) {
            const dataField: Event = eventData.current[key];
            if (dataField.id === value) {
              changeDataEdit(dataField);
            }
          }
        }
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id',
      },
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Start Date',
        accessor: 'startDateStr',
      },
      {
        Header: 'End Date',
        accessor: 'endDateStr',
      },
      {
        Header: 'Public',
        accessor: 'isPublicText',
      },
      {
        Header: 'Visible',
        accessor: 'visibleText',
      },
      {
        Header: 'Event Join Code',
        accessor: 'eventCode',
      },
    ],
    [],
  );

  useEffect(() => {
    async function generate(propsField) {
      await fetchData();

      const propRes = await propsField;
      if (propRes.sess) {
        const user: Session = propRes.sess;
        const { level } = user.user;

        if (checkerNumber(level)) {
          if (level === levels.ORGANIZER) {
            setOrganizer(true);
          } else {
            setOrganizer(false);
          }
        }
      }
    }

    generate(props);
  }, [fetchData, props]);

  /**
   * Event that is called when the user types something in the search bar
   */
  const handleSearch = (event: { target: { value: string } }) => {
    const searchInput: string = event.target.value;
    setSearch(searchInput);

    if (searchInput && searchInput !== '') {
      const filteredDataField = data.filter(
        (value) =>
          value.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.description.toLowerCase().includes(searchInput.toLowerCase()) ||
          (value.startDateStr !== undefined &&
            value.startDateStr
              .toLowerCase()
              .includes(searchInput.toLowerCase())) ||
          (value.endDateStr !== undefined &&
            value.endDateStr.toLowerCase().includes(searchInput.toLowerCase())),
      );

      setFilteredData(filteredDataField);
    } else {
      setFilteredData(null);
    }
  };

  return (
    <Auth admin={undefined}>
      <Box>
        <Box
          data-testid='box-event'
          bg='white'
          borderRadius='lg'
          p={8}
          color='gray.700'
          shadow='base'
        >
          <LoadingModal
            isOpen={!!submitButtonPressed}
            onClose={() => setSubmitButtonPressed(false)}
          />

          {loadingData && (data === null || data === []) && (
            <Box mt={30}>
              <Stack justify='center' align='center'>
                <Text>Loading Please wait...</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length === 0 && (
            <Box mt={30}>
              <Stack justify='center' align='center'>
                <Text>No events found</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data !== [] && data.length > 0 && (
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
                key='table'
                columns={columns}
                data={filteredData && filteredData.length ? filteredData : data}
              />
            </Box>
          )}
        </Box>

        {organizer && (
          <MotionSimpleGrid
            mt='3'
            minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <MotionBox key={1}>
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
                <Heading size='md'>Create Event</Heading>
                <form onSubmit={handleSubmitCreate}>
                  <Stack spacing={4}>
                    <FormControl id='name'>
                      <FormLabel>Name</FormLabel>
                      <Input
                        type='text'
                        placeholder='Name'
                        value={name}
                        size='lg'
                        onChange={(event) => {
                          setName(event.currentTarget.value);
                          nameDB.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>
                    <FormControl id='description'>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        placeholder='Description'
                        value={description}
                        size='lg'
                        onChange={(event) => {
                          setDescription(event.currentTarget.value);
                          descriptionDB.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <FormControl id='startDate'>
                      <FormLabel>Start Date</FormLabel>
                      <Input
                        type='date'
                        placeholder='Start Date'
                        value={startDate}
                        size='lg'
                        onChange={(event) => {
                          setStartDate(event.currentTarget.value);
                          startDateDB.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <FormControl id='endDate'>
                      <FormLabel>End Date</FormLabel>
                      <Input
                        type='date'
                        placeholder='End Date'
                        value={endDate}
                        size='lg'
                        onChange={(event) => {
                          setEndDate(event.currentTarget.value);
                          endDateDB.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <Stack spacing={5} direction='row'>
                      <Checkbox
                        isChecked={visible}
                        onChange={(event) => {
                          setVisible(event.target.checked);
                          visibleDB.current = event.target.checked;
                        }}
                      >
                        Visible
                      </Checkbox>

                      <Checkbox
                        isChecked={isPublic}
                        onChange={(event) => {
                          setIsPublic(event.target.checked);
                          publicDB.current = event.target.checked;
                        }}
                      >
                        Public
                      </Checkbox>
                    </Stack>

                    {checkerString(errorMsg) && (
                      <Stack align='center'>
                        <Text>{errorMsg}</Text>
                      </Stack>
                    )}

                    <Stack spacing={10}>
                      <Button
                        type='submit'
                        bg='blue.400'
                        color='white'
                        _hover={{
                          bg: 'blue.500',
                        }}
                      >
                        Create
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Stack>
            </MotionBox>

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
                <Heading size='md'>Edit Event</Heading>
                <form onSubmit={handleSubmitEdit}>
                  {eventDropdown && (
                    <Stack spacing={3} w='full'>
                      <FormLabel>Select Event</FormLabel>
                      <Select
                        value={eventIDEdit}
                        onChange={onEventChangeEdit}
                        size='sm'
                      >
                        {eventDropdown}
                      </Select>
                    </Stack>
                  )}

                  <Stack spacing={4}>
                    <FormControl id='nameEdit'>
                      <FormLabel>Name</FormLabel>
                      <Input
                        type='text'
                        placeholder='Name'
                        value={nameEdit}
                        size='lg'
                        onChange={(event) => {
                          setNameEdit(event.currentTarget.value);
                          nameDBEdit.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>
                    <FormControl id='descriptionEdit'>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        placeholder='Description'
                        value={descriptionEdit}
                        size='lg'
                        onChange={(event) => {
                          setDescriptionEdit(event.currentTarget.value);
                          descriptionDBEdit.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <FormControl id='startDateEdit'>
                      <FormLabel>Start Date</FormLabel>
                      <Input
                        type='date'
                        placeholder='Start Date'
                        value={startDateEdit}
                        size='lg'
                        onChange={(event) => {
                          setStartDateEdit(event.currentTarget.value);
                          startDateDBEdit.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <FormControl id='endDateEdit'>
                      <FormLabel>End Date</FormLabel>
                      <Input
                        type='date'
                        placeholder='End Date'
                        value={endDateEdit}
                        size='lg'
                        onChange={(event) => {
                          setEndDateEdit(event.currentTarget.value);
                          endDateDBEdit.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <Stack spacing={5} direction='row'>
                      <Checkbox
                        isChecked={visibleEdit}
                        onChange={(event) => {
                          setVisibleEdit(event.target.checked);
                          visibleDBEdit.current = event.target.checked;
                        }}
                      >
                        Visible
                      </Checkbox>

                      <Checkbox
                        isChecked={isPublicEdit}
                        onChange={(event) => {
                          setIsPublicEdit(event.target.checked);
                          publicDBEdit.current = event.target.checked;
                        }}
                      >
                        Public
                      </Checkbox>
                    </Stack>

                    {checkerString(errorMsgEdit) && (
                      <Stack align='center'>
                        <Text>{errorMsgEdit}</Text>
                      </Stack>
                    )}

                    <Stack spacing={5}>
                      <Button
                        type='submit'
                        bg='blue.400'
                        color='white'
                        _hover={{
                          bg: 'blue.500',
                        }}
                      >
                        Update
                      </Button>
                      <Button
                        bg='red.400'
                        color='white'
                        _hover={{
                          bg: 'red.500',
                        }}
                        onClick={handleDelete}
                      >
                        Delete
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

/**
 * On page load, fetches the current session and returns the session data.
 */
export const getServerSideProps: GetServerSideProps = async (cont) => ({
  props: (async function Props() {
    try {
      const session: Session | null = await currentSession(
        null,
        null,
        cont,
        true,
      );
      if (session !== null) {
        const stringifiedData = safeJsonStringify(session);
        const data: Session = JSON.parse(stringifiedData);
        return {
          sess: data,
        };
      }
      return {
        sess: null,
      };
    } catch (error) {
      console.error(error);
      return {
        sess: null,
      };
    }
  })(),
});
