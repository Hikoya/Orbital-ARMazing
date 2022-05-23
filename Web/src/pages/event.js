import Auth from "@components/Auth";
import { useRef, useState, useMemo, useEffect } from "react";
import {
  Button,
  Box,
  Heading,
  FormControl,
  Input,
  FormLabel,
  Text,
  Stack,
  useToast,
  Checkbox,
} from "@chakra-ui/react";
import TableWidget from "@components/TableWidget";

export default function Event() {
  const [loadingData, setLoading] = useState(true);
  const toast = useToast();
  
  const nameDB = useRef("");
  const [name, setName] = useState("");

  const descriptionDB = useRef("");
  const [description, setDescription] = useState("");

  const startDateDB = useRef("");
  const [startDate, setStartDate] = useState("");

  const endDateDB = useRef("");
  const [endDate, setEndDate] = useState("");

  const visibleDB = useRef(true);
  const [visible, setVisible] = useState(true);

  const publicDB = useRef(true);
  const [isPublic, setIsPublic] = useState(true);

  const [error, setError] = useState(null);

  const [data, setData] = useState([]);

  const reset = async () => {
    nameDB.current = "";
    descriptionDB.current = "";
    startDateDB.current = "";
    endDateDB.current = "";
    visibleDB.current = true;
    publicDB.current = true;

    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setVisible("");
    setIsPublic("");
    setError(null);
  };

  const handleSubmitCreate = async (event) => {
    event.preventDefault();
    if (
      validateFields(
        nameDB.current,
        descriptionDB.current,
        startDateDB.current,
        endDateDB.current
      )
    ) {
      try {
        const rawResponse = await fetch("/api/event/create", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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

  const validateFields = (name, description, startDate, endDate) => {
    //super basic validation here
    if (!name) {
      setError("Please set a name!");
      return false;
    }

    if (!description) {
      setError("Please set a description!");
      return false;
    }

    if (!startDate || !endDate) {
      setError("Please set a date!");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      setError("End date cannot be earlier than start date!");
      return false;
    }

    return true;
  };

  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Description",
        accessor: "description",
      },
      {
        Header: "Start Date",
        accessor: "startDate",
      },
      {
        Header: "End Date",
        accessor: "endDate",
      },
      {
        Header: "Public",
        accessor: "isPublicText",
      },
      {
        Header: "Visible",
        accessor: "visibleText",
      },
    ],
    []
  );

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
      const rawResponse = await fetch("/api/event/fetch", {
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
    }

    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Auth>
      <Box>
      <Box bg="white" borderRadius="lg" p={8} color="gray.700" shadow="base">
        {loadingData ? (
              <Text>Loading Please wait...</Text>
            ) : (
              <TableWidget key={1} columns={columns} data={data} />
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
            <Heading size="md">Create Event</Heading>
            <form onSubmit={handleSubmitCreate}>
              <Stack spacing={4}>
                <FormControl id="name">
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={name}
                    size="lg"
                    onChange={(event) => {
                      setName(event.currentTarget.value);
                      nameDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>
                <FormControl id="description">
                  <FormLabel>Description</FormLabel>
                  <Input
                    type="text"
                    placeholder="Description"
                    value={description}
                    size="lg"
                    onChange={(event) => {
                      setDescription(event.currentTarget.value);
                      descriptionDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id="startDate">
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={startDate}
                    size="lg"
                    onChange={(event) => {
                      setStartDate(event.currentTarget.value);
                      startDateDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id="endDate">
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={endDate}
                    size="lg"
                    onChange={(event) => {
                      setEndDate(event.currentTarget.value);
                      endDateDB.current = event.currentTarget.value;
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
