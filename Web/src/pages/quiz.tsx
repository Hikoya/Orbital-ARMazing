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
  FormControl,
  FormLabel,
  Text,
  Stack,
  Checkbox,
  Select,
  useToast,
  Input,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import TableWidget from '@components/TableWidget';
import { Result } from 'types/api';
import { Event } from 'types/event';
import { Asset } from 'types/asset';

export default function QuizComponent() {
  const [loadingData, setLoading] = useState(false);
  const toast = useToast();

  const [errorMsg, setError] = useState(null);

  const [eventID, setEventID] = useState('');
  const eventIDDB = useRef('');
  const [eventDropdown, setEventDropdown] = useState([]);

  const [assetID, setAssetID] = useState('');
  const assetIDDB = useRef('');
  const [assetDropdown, setAssetDropdown] = useState([]);

  const questionDB = useRef('');
  const [question, setQuestion] = useState('');

  const option1DB = useRef('');
  const [option1, setOption1] = useState('');

  const option2DB = useRef('');
  const [option2, setOption2] = useState('');

  const option3DB = useRef('');
  const [option3, setOption3] = useState('');

  const option4DB = useRef('');
  const [option4, setOption4] = useState('');

  const answerDB = useRef(0);
  const [answer, setAnswer] = useState(0);

  const pointsDB = useRef(0);
  const [points, setPoints] = useState(0);

  const visibleDB = useRef(true);
  const [visible, setVisible] = useState(true);

  const [data, setData] = useState([]);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(null);

  const reset = async () => {
    eventIDDB.current = '';
    assetIDDB.current = '';
    questionDB.current = '';
    option1DB.current = '';
    option2DB.current = '';
    option3DB.current = '';
    option4DB.current = '';
    answerDB.current = 0;
    pointsDB.current = 0;

    setEventID('');
    setAssetID('');
    setQuestion('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setAnswer(0);
    setPoints(0);

    setVisible(true);

    setError(null);
  };

  const validateFields = (
    eventIDField: string,
    assetIDField: string,
    questionField: string,
    o1: string,
    o2: string,
    o3: string,
    o4: string,
    ans: number,
  ) => {
    // super basic validation here

    if (!eventIDField || eventIDField === '') {
      setError('Please choose an event!');
      return false;
    }

    if (!assetIDField || assetIDField === '') {
      setError('Please choose an asset!');
      return false;
    }

    if (!questionField || questionField === '') {
      setError('Please write a question!');
      return false;
    }

    if (!o1 && !o2 && !o3 && !o4) {
      setError('Please write at least an option!');
      return false;
    }

    if (!ans || ans === 0 || ans > 4 || ans < 0) {
      setError('Please choose an answer!');
      return false;
    }

    if (Number.isNaN(ans)) {
      setError('Please write a number corresponding to the correct answer!');
      return false;
    }

    if (ans === 1 && (!o1 || o1 === '')) {
      setError('Option does not exist!');
      return false;
    }

    if (ans === 2 && (!o2 || o2 === '')) {
      setError('Option does not exist!');
      return false;
    }

    if (ans === 3 && (!o3 || o3 === '')) {
      setError('Option does not exist!');
      return false;
    }

    if (ans === 4 && (!o4 || o4 === '')) {
      setError('Option does not exist!');
      return false;
    }

    return true;
  };

  const includeActionButton = useCallback(async (content: Event[]) => {
    for (let key = 0; key < content.length; key += 1) {
      if (content[key]) {
        // const dataField = content[key];
      }
    }
    setData(content);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const rawResponse = await fetch('/api/quiz/fetch', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg as Event[]);
        setLoading(false);
      }

      return true;
    } catch (error) {
      return false;
    }
  }, [includeActionButton]);

  const handleSubmitCreate = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (
      validateFields(
        eventIDDB.current,
        assetIDDB.current,
        questionDB.current,
        option1DB.current,
        option2DB.current,
        option3DB.current,
        option4DB.current,
        answerDB.current,
      )
    ) {
      try {
        const rawResponse = await fetch('/api/quiz/create', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventID: eventIDDB.current,
            assetID: assetIDDB.current,
            question: questionDB.current,
            option1: option1DB.current,
            option2: option2DB.current,
            option3: option3DB.current,
            option4: option4DB.current,
            answer: answerDB.current,
            points: pointsDB.current,
            visible: visibleDB.current,
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
        return false;
      }

      return true;
    }

    return false;
  };

  const onEventChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDB.current = value;
      setEventID(value);
    }
  };

  const eventDropDownMenu = useCallback(async (content: Event[]) => {
    const selection = [];
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
      }

      return true;
    } catch (error) {
      return false;
    }
  }, [eventDropDownMenu]);

  const onAssetChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      assetIDDB.current = value;
      setAssetID(value);
    }
  };

  const assetDropDownMenu = useCallback(async (content: Asset[]) => {
    const selection = [];
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

    setAssetDropdown(selection);
  }, []);

  const fetchAssetData = useCallback(async () => {
    try {
      const rawResponse = await fetch('/api/asset/fetch', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        await assetDropDownMenu(content.msg as Asset[]);
      }

      return true;
    } catch (error) {
      return false;
    }
  }, [assetDropDownMenu]);

  useEffect(() => {
    async function generate() {
      await fetchData();
      await fetchEventData();
      await fetchAssetData();
    }

    generate();
  }, [fetchData, fetchEventData, fetchAssetData]);

  const columns = useMemo(
    () => [
      {
        Header: 'Event',
        accessor: 'event',
      },
      {
        Header: 'Question',
        accessor: 'question',
      },
      {
        Header: 'Options',
        accessor: 'options',
      },
      {
        Header: 'Answer',
        accessor: 'answer',
      },
      {
        Header: 'Points',
        accessor: 'points',
      },
      {
        Header: 'Visible',
        accessor: 'isVisible',
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
          value.event.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.question.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.options.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.answer.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.points
            .toString()
            .toLowerCase()
            .includes(searchInput.toLowerCase()),
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
          {loadingData && !data && (
            <Box mt={30}>
              <Stack align='center' justify='center'>
                <Text>Loading Please wait...</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length === 0 && (
            <Box mt={30}>
              <Stack align='center' justify='center'>
                <Text>No quiz found</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length > 0 && (
            <Box w='full' mt={30}>
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

        <Box>
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
            <Heading size='md'>Create Quiz</Heading>
            <form onSubmit={handleSubmitCreate}>
              <Stack spacing={4}>
                <Stack spacing={5} w='full'>
                  <Text>Select Event</Text>
                  <Select onChange={onEventChange} size='sm' value={eventID}>
                    {eventDropdown}
                  </Select>
                </Stack>

                <Stack spacing={5} w='full'>
                  <Text>Select Asset</Text>
                  <Select onChange={onAssetChange} size='sm' value={assetID}>
                    {assetDropdown}
                  </Select>
                </Stack>

                <FormControl id='question'>
                  <FormLabel>Question</FormLabel>
                  <Input
                    placeholder='Question'
                    value={question}
                    size='lg'
                    onChange={(event) => {
                      setQuestion(event.currentTarget.value);
                      questionDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id='option1'>
                  <FormLabel>Option 1</FormLabel>
                  <Input
                    placeholder='Option 1'
                    value={option1}
                    size='lg'
                    onChange={(event) => {
                      setOption1(event.currentTarget.value);
                      option1DB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id='option2'>
                  <FormLabel>Option 2</FormLabel>
                  <Input
                    placeholder='Option 2'
                    value={option2}
                    size='lg'
                    onChange={(event) => {
                      setOption2(event.currentTarget.value);
                      option2DB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id='option3'>
                  <FormLabel>Option 3</FormLabel>
                  <Input
                    placeholder='Option 3'
                    value={option3}
                    size='lg'
                    onChange={(event) => {
                      setOption3(event.currentTarget.value);
                      option3DB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id='option4'>
                  <FormLabel>Option 4</FormLabel>
                  <Input
                    placeholder='Option 4'
                    value={option4}
                    size='lg'
                    onChange={(event) => {
                      setOption4(event.currentTarget.value);
                      option4DB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id='answer'>
                  <FormLabel>Answer</FormLabel>
                  <Input
                    placeholder='Choose 1, 2, 3, 4'
                    value={answer}
                    size='lg'
                    type='number'
                    onChange={(event) => {
                      setAnswer(Number(event.currentTarget.value));
                      answerDB.current = Number(event.currentTarget.value);
                    }}
                  />
                </FormControl>

                <FormControl id='points'>
                  <FormLabel>Points</FormLabel>
                  <Input
                    placeholder='Points'
                    value={points}
                    size='lg'
                    type='number'
                    onChange={(event) => {
                      setPoints(Number(event.currentTarget.value));
                      pointsDB.current = Number(event.currentTarget.value);
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
                </Stack>

                {errorMsg && (
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
        </Box>
      </Box>
    </Auth>
  );
}
