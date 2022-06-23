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
  Text,
  Stack,
  Select,
  Input,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import TableWidget from '@components/TableWidget';
import { Result } from 'types/api';
import { Event } from 'types/event';
import { Leaderboard } from 'types/leaderboard';
import { checkerString } from '@helper/common';

export default function LeaderboardComponent() {
  const [loadingData, setLoading] = useState(false);

  const [eventID, setEventID] = useState('');
  const eventIDDB = useRef('');
  const [eventDropdown, setEventDropdown] = useState<JSX.Element[]>([]);

  const [data, setData] = useState<Leaderboard[]>([]);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<Leaderboard[] | null>(null);
  const [noEvent, setNoEvent] = useState(false);

  const includeActionButton = useCallback(async (content: Leaderboard[]) => {
    for (let key = 0; key < content.length; key += 1) {
      if (content[key]) {
        // const dataField = content[key];
      }
    }
    setData(content);
  }, []);

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

  const onEventChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDB.current = value;
      setEventID(value);
      await fetchData(value);
    }
  };

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

      setEventDropdown(selection);
    } else {
      setNoEvent(true);
    }
  }, []);

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
    ],
    [],
  );

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
                  <Text>No leaderboard found</Text>
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
      </Box>
    </Auth>
  );
}
