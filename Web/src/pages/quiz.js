import Auth from "@components/Auth";
import { useRef, useState, useEffect, useMemo } from "react";
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
} from "@chakra-ui/react";
import TableWidget from "@components/TableWidget";

export default function Quiz() {
  const [loadingData, setLoading] = useState(false);
  const toast = useToast();

  const [error, setError] = useState(null);

  const eventIDDB = useRef("");
  const [eventDropdown, setEventDropdown] = useState([]);

  const questionDB = useRef("");
  const [question, setQuestion] = useState("");

  const option1DB = useRef("");
  const [option1, setOption1] = useState("");

  const option2DB = useRef("");
  const [option2, setOption2] = useState("");

  const option3DB = useRef("");
  const [option3, setOption3] = useState("");

  const option4DB = useRef("");
  const [option4, setOption4] = useState("");

  const answerDB = useRef("");
  const [answer, setAnswer] = useState("");

  const pointsDB = useRef(0);
  const [points, setPoints] = useState(0);

  const visibleDB = useRef(true);
  const [visible, setVisible] = useState(true);

  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");
  const [filteredData, setFilteredData] = useState(null);

  const reset = async () => {
    eventIDDB.current = "";
    questionDB.current = "";
    option1DB.current = "";
    option2DB.current = "";
    option3DB.current = "";
    option4DB.current = "";
    answerDB.current = "";
    pointsDB.current = 0;

    setQuestion("");
    setOption1("");
    setOption2("");
    setOption3("");
    setOption4("");
    setAnswer("");
    setPoints(0);

    setVisible(true);

    setError(null);
  };

  const handleSubmitCreate = async (event) => {
    event.preventDefault();
    if (
      validateFields(
        eventIDDB.current,
        questionDB.current,
        option1DB.current,
        option2DB.current,
        option3DB.current,
        option4DB.current,
        answerDB.current
      )
    ) {
      try {
        const rawResponse = await fetch("/api/quiz/create", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eventID: eventIDDB.current,
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
        const content = await rawResponse.json();
        if (content.status) {
          await reset();
          toast({
            title: "Success",
            description: content.msg,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          await fetchData();
        } else {
          toast({
            title: "Error",
            description: content.error,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const validateFields = (eventID, question, o1, o2, o3, o4, ans) => {
    //super basic validation here

    if (!eventID) {
      setError("Please choose an event!");
      return false;
    }

    if (!question) {
      setError("Please write a question!");
      return false;
    }

    if (!o1 && !o2 && !o3 && !o4) {
      setError("Please write at least an option!");
      return false;
    }

    if (!ans) {
      setError("Please choose an answer!");
      return false;
    }

    if (isNaN(ans)) {
      setError("Please write a number corresponding to the correct answer!");
      return false;
    }

    if ((ans == 1 || ans == "1") && !o1) {
      setError("Option does not exist!");
      return false;
    }

    if ((ans == 2 || ans == "2") && !o2) {
      setError("Option does not exist!");
      return false;
    }

    if ((ans == 3 || ans == "3") && !o3) {
      setError("Option does not exist!");
      return false;
    }

    if ((ans == 4 || ans == "4") && !o4) {
      setError("Option does not exist!");
      return false;
    }

    return true;
  };

  const onEventChange = async (event) => {
    if (event.target.value) {
      const value = event.target.value;
      eventIDDB.current = value;
    }
  };

  const eventDropDownMenu = async (content) => {
    const selection = [];
    selection.push(<option key={""} value={""}></option>);

    for (let key in content) {
      if (content[key]) {
        const data = content[key];

        selection.push(
          <option key={data.id} value={data.id}>
            {data.name}
          </option>
        );
      }
    }

    setEventDropdown(selection);
  };

  const fetchEventData = async () => {
    try {
      const rawResponse = await fetch("/api/event/fetch", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        await eventDropDownMenu(content.msg);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const includeActionButton = async (content) => {
    for (let key in content) {
      if (content[key]) {
        const data = content[key];
      }
    }
    setData(content);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const rawResponse = await fetch("/api/quiz/fetch", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    async function generate() {
      await fetchData();
      await fetchEventData();
    }

    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "Event",
        accessor: "event",
      },
      {
        Header: "Question",
        accessor: "question",
      },
      {
        Header: "Options",
        accessor: "options",
      },
      {
        Header: "Answer",
        accessor: "answer",
      },
      {
        Header: "Points",
        accessor: "points",
      },
      {
        Header: "Visible",
        accessor: "isVisible",
      },
    ],
    []
  );

  const handleSearch = (event) => {
    const searchInput = event.target.value;
    setSearch(searchInput);

    if (searchInput && searchInput != "") {
      let filteredData = data.filter((value) => {
        return (
          value.event.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.question.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.options.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.answer.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.points
            .toString()
            .toLowerCase()
            .includes(searchInput.toLowerCase())
        );
      });

      setFilteredData(filteredData);
    } else {
      setFilteredData(null);
    }
  };

  return (
    <Auth>
      <Box>
        <Box bg="white" borderRadius="lg" p={8} color="gray.700" shadow="base">
          {loadingData && !data ? (
            <Box align="center" justify="center" mt={30}>
              <Text>Loading Please wait...</Text>
            </Box>
          ) : !loadingData && data.length == 0 ? (
            <Box align="center" justify="center" mt={30}>
              <Text>No quiz found</Text>
            </Box>
          ) : (
            <Box align="center" justify="center" minWidth={"full"} mt={30}>
              <Stack spacing={30}>
                <InputGroup>
                  <InputLeftAddon>Search:</InputLeftAddon>
                  <Input
                    type="text"
                    placeholder=""
                    value={search}
                    onChange={handleSearch}
                  />
                </InputGroup>

                <TableWidget
                  key={1}
                  columns={columns}
                  data={
                    filteredData && filteredData.length ? filteredData : data
                  }
                />
              </Stack>
            </Box>
          )}
        </Box>

        <Box>
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg="white"
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            my={12}
          >
            <Heading size="md">Create Quiz</Heading>
            <form onSubmit={handleSubmitCreate}>
              <Stack spacing={4}>
                <Stack spacing={5} w="full">
                  <Text>Select Event</Text>
                  <Select onChange={onEventChange} size="sm">
                    {eventDropdown}
                  </Select>
                </Stack>

                <FormControl id="question">
                  <FormLabel>Question</FormLabel>
                  <Input
                    placeholder="Question"
                    value={question}
                    size="lg"
                    onChange={(event) => {
                      setQuestion(event.currentTarget.value);
                      questionDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id="option1">
                  <FormLabel>Option 1</FormLabel>
                  <Input
                    placeholder="Option 1"
                    value={option1}
                    size="lg"
                    onChange={(event) => {
                      setOption1(event.currentTarget.value);
                      option1DB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id="option2">
                  <FormLabel>Option 2</FormLabel>
                  <Input
                    placeholder="Option 2"
                    value={option2}
                    size="lg"
                    onChange={(event) => {
                      setOption2(event.currentTarget.value);
                      option2DB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id="option3">
                  <FormLabel>Option 3</FormLabel>
                  <Input
                    placeholder="Option 3"
                    value={option3}
                    size="lg"
                    onChange={(event) => {
                      setOption3(event.currentTarget.value);
                      option3DB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id="option4">
                  <FormLabel>Option 4</FormLabel>
                  <Input
                    placeholder="Option 4"
                    value={option4}
                    size="lg"
                    onChange={(event) => {
                      setOption4(event.currentTarget.value);
                      option4DB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id="answer">
                  <FormLabel>Answer</FormLabel>
                  <Input
                    placeholder="Choose 1, 2, 3, 4"
                    value={answer}
                    size="lg"
                    type={"number"}
                    onChange={(event) => {
                      setAnswer(event.currentTarget.value);
                      answerDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id="points">
                  <FormLabel>Points</FormLabel>
                  <Input
                    placeholder="Points"
                    value={points}
                    size="lg"
                    type={"number"}
                    onChange={(event) => {
                      setPoints(event.currentTarget.value);
                      pointsDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <Stack spacing={5} direction="row">
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

                {error && (
                  <Stack align={"center"}>
                    <Text>{error}</Text>
                  </Stack>
                )}

                <Stack spacing={10}>
                  <Button
                    type="submit"
                    bg={"blue.400"}
                    color={"white"}
                    _hover={{
                      bg: "blue.500",
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
