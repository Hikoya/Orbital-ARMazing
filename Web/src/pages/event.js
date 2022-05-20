import Auth from "@components/Auth";
import { useRef, useState } from "react";
import {
  Button,
  Box,
  Heading,
  FormControl,
  Input,
  FormLabel,
  Text,
  Stack,
  useColorModeValue,
  Checkbox,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

export default function Event() {
  const nameDB = useRef("");
  const [name, setName] = useState("");

  const descriptionDB = useRef("");
  const [description, setDescription] = useState("");

  const visibleDB = useRef(true);
  const [visible, setVisible] = useState(true);

  const publicDB = useRef(true);
  const [isPublic, setIsPublic] = useState(true);

  const startDateDB = useRef("");
  const [startDate, setStartDate] = useState("");

  const endDateDB = useRef("");
  const [endDate, setEndDate] = useState("");

  const [error, setError] = useState(null);

  const handleSubmitCreate = async (event) => {
    event.preventDefault();
  };

  return (
    <Auth>
      <Box>
        <MotionBox>
          <Stack
            spacing={4}
            w={"full"}
            maxW={"md"}
            bg={useColorModeValue("white", "gray.700")}
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
        </MotionBox>
      </Box>
    </Auth>
  );
}
