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
  Checkbox,
  FormControl,
  FormLabel,
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
import { Result } from 'types/api';
import { Event } from 'types/event';
import { Asset } from 'types/asset';
import { Quiz } from 'types/quiz';

import { checkerNumber, checkerString } from '@helper/common';

import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

import safeJsonStringify from 'safe-json-stringify';
import { GetServerSideProps } from 'next';
import { currentSession } from '@helper/sessionServer';
import { Session } from 'next-auth/core/types';
import { levels } from '@constants/admin';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

/**
 * This component renders the /quiz path, showing a table of all the assets visible to the user,
 * as well as provide options to edit and create new assets.
 */
export default function QuizComponent(props: any) {
  const [loadingData, setLoading] = useState(false);
  const toast = useToast();

  const [errorMsg, setError] = useState('');
  const [errorMsgEdit, setErrorEdit] = useState('');

  const [eventID, setEventID] = useState('');
  const eventIDDB = useRef('');
  const [eventDropdown, setEventDropdown] = useState<JSX.Element[]>([]);

  const [eventIDEdit, setEventIDEdit] = useState('');
  const eventIDDBEdit = useRef('');

  const [assetID, setAssetID] = useState('');
  const assetIDDB = useRef('');
  const [assetDropdown, setAssetDropdown] = useState<JSX.Element[]>([]);

  const [assetIDEdit, setAssetIDEdit] = useState('');
  const assetIDDBEdit = useRef('');

  const questionDB = useRef('');
  const [question, setQuestion] = useState('');

  const questionDBEdit = useRef('');
  const [questionEdit, setQuestionEdit] = useState('');

  const option1DB = useRef('');
  const [option1, setOption1] = useState('');

  const option1DBEdit = useRef('');
  const [option1Edit, setOption1Edit] = useState('');

  const option2DB = useRef('');
  const [option2, setOption2] = useState('');

  const option2DBEdit = useRef('');
  const [option2Edit, setOption2Edit] = useState('');

  const option3DB = useRef('');
  const [option3, setOption3] = useState('');

  const option3DBEdit = useRef('');
  const [option3Edit, setOption3Edit] = useState('');

  const option4DB = useRef('');
  const [option4, setOption4] = useState('');

  const option4DBEdit = useRef('');
  const [option4Edit, setOption4Edit] = useState('');

  const answerDB = useRef(0);
  const [answer, setAnswer] = useState(0);

  const answerDBEdit = useRef(0);
  const [answerEdit, setAnswerEdit] = useState(0);

  const pointsDB = useRef(0);
  const [points, setPoints] = useState(0);

  const pointsDBEdit = useRef(0);
  const [pointsEdit, setPointsEdit] = useState(0);

  const visibleDB = useRef(true);
  const [visible, setVisible] = useState(true);

  const visibleDBEdit = useRef(true);
  const [visibleEdit, setVisibleEdit] = useState(true);

  const quizDBEdit = useRef('');
  const [quiz, setQuiz] = useState('');
  const quizData = useRef<Quiz[]>([]);
  const [quizDropdown, setQuizDropdown] = useState<JSX.Element[]>([]);

  const [data, setData] = useState<Quiz[]>([]);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<Quiz[] | null>(null);

  const [organizer, setOrganizer] = useState(false);
  const [noEvent, setNoEvent] = useState(false);

  /**
   * Resets all values to their default values upon successful creation of quiz
   */
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

    setError('');
  };

  /**
   * Resets all values to their default values upon successful editing of quiz
   */
  const resetEdit = async () => {
    quizDBEdit.current = '';
    eventIDDBEdit.current = '';
    assetIDDBEdit.current = '';
    questionDBEdit.current = '';
    option1DBEdit.current = '';
    option2DBEdit.current = '';
    option3DBEdit.current = '';
    option4DBEdit.current = '';
    answerDBEdit.current = 0;
    pointsDBEdit.current = 0;

    setQuiz('');
    setEventIDEdit('');
    setAssetIDEdit('');
    setQuestionEdit('');
    setOption1Edit('');
    setOption2Edit('');
    setOption3Edit('');
    setOption4Edit('');
    setAnswerEdit(0);
    setPointsEdit(0);

    setVisibleEdit(true);

    setErrorEdit('');
  };

  /**
   * Input validation for creating a quiz
   */
  const validateFields = (
    eventIDField: string,
    assetIDField: string,
    questionField: string,
    o1: string,
    o2: string,
    o3: string,
    o4: string,
    ans: number,
    pointsField: number,
  ) => {
    // super basic validation here

    if (!checkerString(eventIDField)) {
      setError('Please choose an event!');
      return false;
    }

    if (!checkerString(assetIDField)) {
      setError('Please choose an asset!');
      return false;
    }

    if (!checkerString(questionField)) {
      setError('Please write a question!');
      return false;
    }

    if (
      !checkerString(o1) &&
      !checkerString(o2) &&
      !checkerString(o3) &&
      !checkerString(o4)
    ) {
      setError('Please write at least an option!');
      return false;
    }

    if (
      o1.includes(',') ||
      o2.includes(',') ||
      o3.includes(',') ||
      o4.includes(',')
    ) {
      setError('No special character `,` allowed');
      return false;
    }

    if (!checkerNumber(ans) || ans > 4 || ans <= 0) {
      setError('Please choose an answer!');
      return false;
    }

    if (ans === 1 && !checkerString(o1)) {
      setError('Option does not exist!');
      return false;
    }

    if (ans === 2 && !checkerString(o2)) {
      setError('Option does not exist!');
      return false;
    }

    if (ans === 3 && !checkerString(o3)) {
      setError('Option does not exist!');
      return false;
    }

    if (ans === 4 && !checkerString(o4)) {
      setError('Option does not exist!');
      return false;
    }

    if (pointsField <= 0) {
      setError('Points cannot be 0 or lesser than 0!');
      return false;
    }

    return true;
  };

  /**
   * Input validation for editing a quiz
   */
  const validateFieldsEdit = (
    quizIDField: string,
    eventIDField: string,
    assetIDField: string,
    questionField: string,
    o1: string,
    o2: string,
    o3: string,
    o4: string,
    ans: number,
    pointsField: number,
  ) => {
    // super basic validation here

    if (!checkerString(quizIDField)) {
      setErrorEdit('Please choose a quiz!');
      return false;
    }

    if (!checkerString(eventIDField)) {
      setErrorEdit('Please choose an event!');
      return false;
    }

    if (!checkerString(assetIDField)) {
      setErrorEdit('Please choose an asset!');
      return false;
    }

    if (!checkerString(questionField)) {
      setErrorEdit('Please write a question!');
      return false;
    }

    if (
      !checkerString(o1) &&
      !checkerString(o2) &&
      !checkerString(o3) &&
      !checkerString(o4)
    ) {
      setErrorEdit('Please write at least an option!');
      return false;
    }

    if (
      o1.includes(',') ||
      o2.includes(',') ||
      o3.includes(',') ||
      o4.includes(',')
    ) {
      setError('No special character `,` allowed');
      return false;
    }

    if (!checkerNumber(ans) || ans > 4 || ans <= 0) {
      setErrorEdit('Please choose an answer!');
      return false;
    }

    if (ans === 1 && !checkerString(o1)) {
      setErrorEdit('Option does not exist!');
      return false;
    }

    if (ans === 2 && !checkerString(o2)) {
      setErrorEdit('Option does not exist!');
      return false;
    }

    if (ans === 3 && !checkerString(o3)) {
      setErrorEdit('Option does not exist!');
      return false;
    }

    if (ans === 4 && !checkerString(o4)) {
      setErrorEdit('Option does not exist!');
      return false;
    }

    if (pointsField <= 0) {
      setError('Points cannot be 0 or lesser than 0!');
      return false;
    }

    return true;
  };

  /**
   * Creates a dropdown menu for all quiz fetched, and calls the function to generate
   * an action button.
   *
   * Populates the data on the table in the end.
   */
  const includeActionButton = useCallback(async (content: Quiz[]) => {
    const selectionEdit: JSX.Element[] = [];
    selectionEdit.push(<option key='' value='' aria-label='Default' />);
    const allQuiz: Quiz[] = [];

    for (let key = 0; key < content.length; key += 1) {
      if (content[key]) {
        const dataField: Quiz = content[key];
        selectionEdit.push(
          <option key={dataField.id} value={dataField.id}>
            {dataField.question}
          </option>,
        );
        allQuiz.push(dataField);
      }
    }

    quizData.current = allQuiz;
    setQuizDropdown(selectionEdit);
    setData(content);
  }, []);

  /**
   * Fetches quiz data by calling the API
   */
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
        await includeActionButton(content.msg as Quiz[]);
      }

      setLoading(false);
      return true;
    } catch (error) {
      return false;
    }
  }, [includeActionButton]);

  /**
   * Validates the input from the user, and calls the API to create a quiz
   *
   * Resets the input fields upon successful request.
   */
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
        pointsDB.current,
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

  /**
   * Validates the input from the user, and calls the API to edit a quiz
   *
   * Resets the input fields upon successful request.
   */
  const handleSubmitEdit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (
      validateFieldsEdit(
        quizDBEdit.current,
        eventIDDBEdit.current,
        assetIDDBEdit.current,
        questionDBEdit.current,
        option1DBEdit.current,
        option2DBEdit.current,
        option3DBEdit.current,
        option4DBEdit.current,
        answerDBEdit.current,
        pointsDBEdit.current,
      )
    ) {
      try {
        const rawResponse = await fetch('/api/quiz/edit', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizID: quizDBEdit.current,
            eventID: eventIDDBEdit.current,
            assetID: assetIDDBEdit.current,
            question: questionDBEdit.current,
            option1: option1DBEdit.current,
            option2: option2DBEdit.current,
            option3: option3DBEdit.current,
            option4: option4DBEdit.current,
            answer: answerDBEdit.current,
            points: pointsDBEdit.current,
            visible: visibleDBEdit.current,
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
        return false;
      }

      return true;
    }

    return false;
  };

  /**
   * Validates the asset ID, and calls the API to delete a quiz
   *
   * Fetches the latest quiz data upon successful request.
   */
  const handleDelete = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (checkerString(quizDBEdit.current)) {
      try {
        const rawResponse = await fetch('/api/quiz/delete', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quizID: quizDBEdit.current,
          }),
        });
        const content = await rawResponse.json();
        if (content.status) {
          await resetEdit();
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

        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  /**
   * Changes all input fields to the given Quiz details
   */
  const changeDataEdit = (dataField: Quiz) => {
    if (dataField.assetID !== undefined) {
      setAssetIDEdit(dataField.assetID);
      assetIDDBEdit.current = dataField.assetID;
    }

    setAnswerEdit(dataField.answer);
    setEventIDEdit(dataField.eventID);
    setVisibleEdit(dataField.visible);
    setPointsEdit(dataField.points);
    setQuestionEdit(dataField.question);

    answerDBEdit.current = dataField.answer;
    eventIDDBEdit.current = dataField.eventID;
    visibleDBEdit.current = dataField.visible;
    pointsDBEdit.current = dataField.points;
    questionDBEdit.current = dataField.question;

    if (dataField.options !== undefined) {
      const [one, two, three, four] = dataField.options.split(',');
      option1DBEdit.current = one;
      option2DBEdit.current = two;
      option3DBEdit.current = three;
      option4DBEdit.current = four;

      setOption1Edit(one);
      setOption2Edit(two);
      setOption3Edit(three);
      setOption4Edit(four);
    }
  };

  /**
   * Event that is called when a user selects an item from the quiz dropdown menu
   */
  const onQuizChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      quizDBEdit.current = value;
      setQuiz(value);

      if (quizData.current !== []) {
        for (let key = 0; key < quizData.current.length; key += 1) {
          if (quizData.current[key]) {
            const dataField: Quiz = quizData.current[key];
            if (dataField.id === value) {
              changeDataEdit(dataField);
            }
          }
        }
      }
    }
  };

  /**
   * Event that is called when a user selects an item from the event dropdown menu
   */
  const onEventChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDB.current = value;
      setEventID(value);
    }
  };

  /**
   * Event that is called when a user selects an item from the event dropdown menu
   * for the Edit Quiz portion
   */
  const onEventChangeEdit = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDBEdit.current = value;
      setEventIDEdit(value);
    }
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

  /**
   * Event that is called when a user selects an item from the asset dropdown menu
   */
  const onAssetChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      assetIDDB.current = value;
      setAssetID(value);
    }
  };

  /**
   * Event that is called when a user selects an item from the asset dropdown menu
   * on the Edit Asset portion
   */
  const onAssetChangeEdit = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      assetIDDBEdit.current = value;
      setAssetIDEdit(value);
    }
  };

  /**
   * Generates the asset dropdown menu
   */
  const assetDropDownMenu = useCallback(async (content: Asset[]) => {
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

    setAssetDropdown(selection);
  }, []);

  /**
   * Fetches all asset that the user is authorized to view
   */
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
    async function generate(propsField) {
      await fetchData();
      await fetchEventData();
      await fetchAssetData();

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
  }, [fetchData, fetchEventData, fetchAssetData, props]);

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

  /**
   * Event that is called when the user types something in the search bar
   */
  const handleSearch = (event: { target: { value: string } }) => {
    const searchInput = event.target.value;
    setSearch(searchInput);

    if (searchInput && searchInput !== '') {
      const filteredDataField = data.filter(
        (value) =>
          (value.event !== undefined &&
            value.event.toLowerCase().includes(searchInput.toLowerCase())) ||
          value.question.toLowerCase().includes(searchInput.toLowerCase()) ||
          (value.options !== undefined &&
            value.options.toLowerCase().includes(searchInput.toLowerCase())) ||
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
          {loadingData && (data === null || data.length === 0) && (
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

        {organizer && !noEvent && (
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
                <Heading size='md'>Create Quiz</Heading>
                <form onSubmit={handleSubmitCreate}>
                  <Stack spacing={4}>
                    <Stack spacing={5} w='full'>
                      <Text>Select Event</Text>
                      <Select
                        onChange={onEventChange}
                        size='sm'
                        value={eventID}
                      >
                        {eventDropdown}
                      </Select>
                    </Stack>

                    <Stack spacing={5} w='full'>
                      <Text>Select Asset</Text>
                      <Select
                        onChange={onAssetChange}
                        size='sm'
                        value={assetID}
                      >
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
                <Heading size='md'>Edit Quiz</Heading>
                <form onSubmit={handleSubmitEdit}>
                  <Stack spacing={4}>
                    <Stack spacing={5} w='full'>
                      <Text>Select Quiz</Text>
                      <Select onChange={onQuizChange} size='sm' value={quiz}>
                        {quizDropdown}
                      </Select>
                    </Stack>

                    <Stack spacing={5} w='full'>
                      <Text>Select Event</Text>
                      <Select
                        onChange={onEventChangeEdit}
                        size='sm'
                        value={eventIDEdit}
                      >
                        {eventDropdown}
                      </Select>
                    </Stack>

                    <Stack spacing={5} w='full'>
                      <Text>Select Asset</Text>
                      <Select
                        onChange={onAssetChangeEdit}
                        size='sm'
                        value={assetIDEdit}
                      >
                        {assetDropdown}
                      </Select>
                    </Stack>

                    <FormControl id='questionEdit'>
                      <FormLabel>Question</FormLabel>
                      <Input
                        placeholder='Question'
                        value={questionEdit}
                        size='lg'
                        onChange={(event) => {
                          setQuestionEdit(event.currentTarget.value);
                          questionDBEdit.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <FormControl id='option1Edit'>
                      <FormLabel>Option 1</FormLabel>
                      <Input
                        placeholder='Option 1'
                        value={option1Edit}
                        size='lg'
                        onChange={(event) => {
                          setOption1Edit(event.currentTarget.value);
                          option1DBEdit.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <FormControl id='option2Edit'>
                      <FormLabel>Option 2</FormLabel>
                      <Input
                        placeholder='Option 2'
                        value={option2Edit}
                        size='lg'
                        onChange={(event) => {
                          setOption2Edit(event.currentTarget.value);
                          option2DBEdit.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <FormControl id='option3Edit'>
                      <FormLabel>Option 3</FormLabel>
                      <Input
                        placeholder='Option 3'
                        value={option3Edit}
                        size='lg'
                        onChange={(event) => {
                          setOption3Edit(event.currentTarget.value);
                          option3DBEdit.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <FormControl id='option4Edit'>
                      <FormLabel>Option 4</FormLabel>
                      <Input
                        placeholder='Option 4'
                        value={option4Edit}
                        size='lg'
                        onChange={(event) => {
                          setOption4Edit(event.currentTarget.value);
                          option4DBEdit.current = event.currentTarget.value;
                        }}
                      />
                    </FormControl>

                    <FormControl id='answerEdit'>
                      <FormLabel>Answer</FormLabel>
                      <Input
                        placeholder='Choose 1, 2, 3, 4'
                        value={answerEdit}
                        size='lg'
                        type='number'
                        onChange={(event) => {
                          setAnswerEdit(Number(event.currentTarget.value));
                          answerDBEdit.current = Number(
                            event.currentTarget.value,
                          );
                        }}
                      />
                    </FormControl>

                    <FormControl id='pointsEdit'>
                      <FormLabel>Points</FormLabel>
                      <Input
                        placeholder='Points'
                        value={pointsEdit}
                        size='lg'
                        type='number'
                        onChange={(event) => {
                          setPointsEdit(Number(event.currentTarget.value));
                          pointsDBEdit.current = Number(
                            event.currentTarget.value,
                          );
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
                    </Stack>

                    {errorMsgEdit && (
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

        {organizer && noEvent && (
          <Box
            bg='white'
            borderRadius='lg'
            p={8}
            color='gray.700'
            shadow='base'
            mt={30}
          >
            <Stack justify='center' align='center'>
              <Text>Please create an Event first.</Text>
            </Stack>
          </Box>
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
