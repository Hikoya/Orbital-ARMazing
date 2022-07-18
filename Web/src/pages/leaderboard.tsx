import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import Auth from '@components/Auth';
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Select,
  SimpleGrid,
  Input,
  InputGroup,
  InputLeftAddon,
  useToast,
} from '@chakra-ui/react';
import TableWidget from '@components/TableWidget';
import PlayerModal from '@components/PlayerModal';

import { Result } from 'types/api';
import { Event } from 'types/event';
import { Leaderboard } from 'types/leaderboard';
import { checkerString } from '@helper/common';

import { InfoOutlineIcon } from '@chakra-ui/icons';

import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * This component renders the /leaderboard path, allowing users to see the current
 * leaderboard and perform certain operations such as reset or delete
 */
export default function LeaderboardComponent() {
  const [loadingData, setLoading] = useState(false);
  const toast = useToast();

  const [specificPlayer, setSpecificPlayerData] = useState<Leaderboard | null>(
    null,
  );

  const [eventID, setEventID] = useState('');
  const eventIDDB = useRef('');
  const [eventDropdown, setEventDropdown] = useState<JSX.Element[]>([]);
  const rawEvent = useRef<Event[]>([]);
  const [eventName, setEventName] = useState('');

  const [data, setData] = useState<Leaderboard[]>([]);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<Leaderboard[] | null>(null);
  const [noEvent, setNoEvent] = useState(false);

  const [hasLeaderBoard, setHasLeaderBoard] = useState(false);

  /**
   * Generates an action button to set the player modal
   */
  const generateActionButton = useCallback(async (content: Leaderboard) => {
    const button: JSX.Element = (
      <Button
        size='sm'
        leftIcon={<InfoOutlineIcon />}
        onClick={(event) => {
          if (event.cancelable) {
            event.preventDefault();
          }
          setSpecificPlayerData(content);
        }}
      >
        View Details
      </Button>
    );

    return button;
  }, []);

  /**
   * Calls the function to generate an action button.
   *
   * Populates the data on the table in the end.
   */
  const includeActionButton = useCallback(
    async (content: Leaderboard[]) => {
      if (content !== null && content.length > 0) {
        setHasLeaderBoard(true);
      } else {
        setHasLeaderBoard(false);
      }

      for (let key = 0; key < content.length; key += 1) {
        if (content[key]) {
          const dataField: Leaderboard = content[key];
          const buttons = await generateActionButton(dataField);
          dataField.action = buttons;
        }
      }
      setData(content);
    },
    [generateActionButton],
  );

  /**
   * Fetches leaderboard data by calling the API
   */
  const fetchData = useCallback(
    async (eventIDField: string) => {
      setLoading(true);
      try {
        const rawResponse = await fetch('/api/leaderboard/fetch', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventID: eventIDField,
          }),
        });
        const content: Result = await rawResponse.json();
        if (content.status) {
          await includeActionButton(content.msg as Leaderboard[]);
          setLoading(false);
        }
        return true;
      } catch (error) {
        return false;
      }
    },
    [includeActionButton],
  );

  /**
   * Event that is called when a user selects an item from the event dropdown menu
   */
  const onEventChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDB.current = value;

      if (rawEvent.current.length > 0) {
        for (let key = 0; key < rawEvent.current.length; key += 1) {
          if (rawEvent.current[key]) {
            const ev: Event = rawEvent.current[key];
            if (ev.id === value) {
              setEventName(ev.name);
            }
          }
        }
      }

      setEventID(value);
      await fetchData(value);
    }
  };

  /**
   * Validates the event ID, and calls the API to reset the leaderboard
   *
   * Fetches the latest leaderboard data upon successful request.
   */
  const handleReset = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (checkerString(eventIDDB.current)) {
      try {
        const rawResponse = await fetch('/api/leaderboard/reset', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventID: eventIDDB.current,
          }),
        });
        const content = await rawResponse.json();
        if (content.status) {
          toast({
            title: 'Success',
            description: content.msg,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          await fetchData(eventIDDB.current);
        } else {
          toast({
            title: 'Error',
            description: content.error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }

        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  /**
   * Validates the event ID, and calls the API to delete the leaderboard
   *
   * Fetches the latest leaderboard data upon successful request.
   */
  const handleDeletePlayer = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (checkerString(eventIDDB.current)) {
      try {
        const rawResponse = await fetch('/api/leaderboard/delete', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventID: eventIDDB.current,
          }),
        });
        const content = await rawResponse.json();
        if (content.status) {
          toast({
            title: 'Success',
            description: content.msg,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          await fetchData(eventIDDB.current);
        } else {
          toast({
            title: 'Error',
            description: content.error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }

        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  /**
   * Generates the event dropdown menu
   */
  const eventDropDownMenu = useCallback(async (content: Event[]) => {
    if (content.length > 0) {
      setNoEvent(false);
      const selection: JSX.Element[] = [];
      selection.push(<option key='' value='' aria-label='default' />);

      for (let key = 0; key < content.length; key += 1) {
        if (content[key]) {
          const dataField = content[key];

          selection.push(
            <option key={dataField.id} value={dataField.id}>
              {dataField.name}
            </option>,
          );
        }
      }

      rawEvent.current = content;
      setEventDropdown(selection);
    } else {
      setNoEvent(true);
    }
  }, []);

  /**
   * Fetches all event that the user is authorized to view
   */
  const fetchEventData = useCallback(async () => {
    try {
      const rawResponse = await fetch('/api/event/fetch', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        await eventDropDownMenu(content.msg as Event[]);
      } else {
        setNoEvent(true);
      }

      return true;
    } catch (error) {
      return false;
    }
  }, [eventDropDownMenu]);

  useEffect(() => {
    async function generate() {
      await fetchEventData();
    }

    generate();
  }, [fetchEventData]);

  const columns = useMemo(
    () => [
      {
        Header: 'Event',
        accessor: 'eventName',
      },
      {
        Header: 'Username',
        accessor: 'username',
      },
      {
        Header: 'Points',
        accessor: 'points',
      },
      {
        Header: 'Actions',
        accessor: 'action',
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

    if (searchInput && searchInput !== '') {
      const filteredDataField = data.filter(
        (value) =>
          (value.eventName !== undefined &&
            value.eventName
              .toLowerCase()
              .includes(searchInput.toLowerCase())) ||
          value.username.toLowerCase().includes(searchInput.toLowerCase()) ||
          (value.points !== undefined &&
            value.points
              .toString()
              .toLowerCase()
              .includes(searchInput.toLowerCase())),
      );

      setFilteredData(filteredDataField);
    } else {
      setFilteredData(null);
    }
  };

  return (
    <Auth admin={undefined}>
      <Box>
        <Box bg='white' borderRadius='lg' p={8} color='gray.700' shadow='base'>
          <PlayerModal
            isOpen={specificPlayer}
            onClose={() => setSpecificPlayerData(null)}
            modalData={specificPlayer}
          />

          {noEvent && (
            <Stack justify='center' align='center'>
              <Text>Please create an Event first.</Text>
            </Stack>
          )}

          {!noEvent && (
            <Stack spacing={5} w='full'>
              <Text>Select Event</Text>
              <Select onChange={onEventChange} size='sm' value={eventID}>
                {eventDropdown}
              </Select>
            </Stack>
          )}

          {loadingData && !data && (
            <Box mt={30}>
              <Stack align='center' justify='center'>
                <Text>Loading Please wait...</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && !noEvent && !checkerString(eventID) && (
            <Box mt={30}>
              <Stack align='center' justify='center'>
                <Text>Select an event</Text>
              </Stack>
            </Box>
          )}

          {!loadingData &&
            !noEvent &&
            checkerString(eventID) &&
            data.length === 0 && (
              <Box mt={30}>
                <Stack align='center' justify='center'>
                  <Text>
                    No leaderboard found. The board will update when players
                    join the event
                  </Text>
                </Stack>
              </Box>
            )}

          {!loadingData && !noEvent && data.length > 0 && (
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
                data={filteredData && filteredData.length ? filteredData : data}
              />
            </Box>
          )}
        </Box>

        {hasLeaderBoard && checkerString(eventID) && (
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
                <Heading size='md'>Reset Leaderboard</Heading>
                <Text>This will reset the points of all players to 0</Text>
                <Text>
                  Selected Event: {checkerString(eventName) && eventName}
                </Text>
                <Button
                  bg='blue.400'
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Stack>
            </MotionBox>

            <MotionBox key={4}>
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
                <Heading size='md'>Delete Players in Leaderboard</Heading>
                <Text>
                  This will delete all players in the leaderboard. Proceed with
                  caution
                </Text>
                <Text>
                  Selected Event: {checkerString(eventName) && eventName}
                </Text>
                <Button
                  bg='blue.400'
                  color='white'
                  _hover={{
                    bg: 'blue.500',
                  }}
                  onClick={handleDeletePlayer}
                >
                  Reset
                </Button>
              </Stack>
            </MotionBox>
          </MotionSimpleGrid>
        )}
      </Box>
    </Auth>
  );
}
