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
  Textarea,
  Stack,
  Checkbox,
  Flex,
  Icon,
  Select,
  chakra,
  VisuallyHidden,
  useToast,
  Input,
  InputGroup,
  InputLeftAddon,
} from '@chakra-ui/react';
import TableWidget from '@components/TableWidget';
import { AssetFetch } from 'types/asset';
import { Result } from 'types/api';
import { EventFetch } from 'types/event';

export default function Asset() {
  const [loadingData, setLoading] = useState(false);
  const toast = useToast();

  const nameDB = useRef('');
  const [name, setName] = useState('');

  const descriptionDB = useRef('');
  const [description, setDescription] = useState('');

  const visibleDB = useRef(true);
  const [visible, setVisible] = useState(true);

  const eventIDDB = useRef('');

  const selectedFileDB = useRef(null);
  const [fileName, setFileName] = useState(null);

  const [eventDropdown, setEventDropdown] = useState([]);

  const latitudeDB = useRef('');
  const [latitude, setLatitude] = useState('');

  const longitudeDB = useRef('');
  const [longitude, setLongitude] = useState('');

  const [errorMsg, setError] = useState(null);

  const [data, setData] = useState([]);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(null);

  const reset = async () => {
    nameDB.current = '';
    descriptionDB.current = '';
    eventIDDB.current = '';
    selectedFileDB.current = null;
    latitudeDB.current = '';
    longitudeDB.current = '';
    visibleDB.current = true;

    setName('');
    setDescription('');
    setFileName(null);
    setLatitude('');
    setLongitude('');
    setVisible(true);
    setError(null);
  };

  const validateFields = (
    nameField: string,
    descriptionField: string,
    eventIDField: string,
    selectedFileField: any,
    latitudeField: string,
    longitudeField: string,
  ) => {
    // super basic validation here

    if (!nameField) {
      setError('Please write a name!');
      return false;
    }

    if (!descriptionField) {
      setError('Please write a description!');
      return false;
    }

    if (!eventIDField || eventIDField === '') {
      setError('Please choose an event!');
      return false;
    }

    if (!selectedFileField) {
      setError('Please upload an image!');
      return false;
    }

    if (!latitudeField) {
      setError('Please provide a latitude!');
      return false;
    }

    if (!longitudeField) {
      setError('Please provide a longitude');
      return false;
    }

    return true;
  };

  const includeActionButton = useCallback(async (content: AssetFetch[]) => {
    for (let key = 0; key < content.length; key += 1) {
      if (content[key]) {
        // const dataField = content[key];
      }
    }
    setData(content);
  }, []);

  const fetchAssetData = useCallback(async () => {
    setLoading(true);
    try {
      const rawResponse = await fetch('/api/asset/fetch', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        await includeActionButton(content.msg as AssetFetch[]);
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
        nameDB.current,
        descriptionDB.current,
        eventIDDB.current,
        selectedFileDB.current,
        latitudeDB.current,
        longitudeDB.current,
      )
    ) {
      try {
        const dataField = new FormData();
        dataField.append('eventID', eventIDDB.current);
        dataField.append('name', nameDB.current);
        dataField.append('description', descriptionDB.current);
        dataField.append('visible', visibleDB.current.toString());
        dataField.append('image', selectedFileDB.current);
        dataField.append('latitude', latitudeDB.current);
        dataField.append('longitude', longitudeDB.current);

        const rawResponse = await fetch('/api/asset/create', {
          method: 'POST',
          body: dataField,
        });
        const content = await rawResponse.json();
        if (content.status) {
          await reset();
          toast({
            title: 'Success',
            description: content.msg,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          await fetchAssetData();
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

  const onFileChange = async (event: { target: { files: FileList } }) => {
    const file = event.target.files[0];
    selectedFileDB.current = file;
    setFileName(file.name);
  };

  const onEventChange = async (event: { target: { value: any } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDB.current = value;
    }
  };

  const eventDropDownMenu = async (content: EventFetch[]) => {
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
  };

  const fetchData = useCallback(async () => {
    try {
      const rawResponse = await fetch('/api/event/fetch', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        await eventDropDownMenu(content.msg as EventFetch[]);
      }

      return true;
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    async function generate() {
      await fetchData();
      await fetchAssetData();
    }

    generate();
  }, [fetchData, fetchAssetData]);

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'Latitude',
        accessor: 'latitude',
      },
      {
        Header: 'Longitude',
        accessor: 'longitude',
      },
      {
        Header: 'Visible',
        accessor: 'visibleText',
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
          value.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.description.toLowerCase().includes(searchInput.toLowerCase()) ||
          value.latitude
            .toString()
            .toLowerCase()
            .includes(searchInput.toLowerCase()) ||
          value.longitude
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
              <Stack justify='center' align='center'>
                <Text>Loading Please wait...</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length === 0 && (
            <Box mt={30}>
              <Stack justify='center' align='center'>
                <Text>No assets found</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length > 0 && (
            <Box minWidth='full' mt={30}>
              <Stack justify='center' align='center' spacing={30}>
                <InputGroup>
                  <InputLeftAddon>Search:</InputLeftAddon>
                  <Input
                    type='text'
                    placeholder=''
                    value={search}
                    onChange={handleSearch}
                  />
                </InputGroup>

                <Box width='full'>
                  <TableWidget
                    key={1}
                    columns={columns}
                    data={
                      filteredData && filteredData.length ? filteredData : data
                    }
                  />
                </Box>
              </Stack>
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
            <Heading size='md'>Create Asset</Heading>
            <form onSubmit={handleSubmitCreate}>
              <Stack spacing={4}>
                <Stack spacing={5} w='full'>
                  <Text>Select Event</Text>
                  <Select onChange={onEventChange} size='sm'>
                    {eventDropdown}
                  </Select>
                </Stack>

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

                <FormControl id='latitude'>
                  <FormLabel>Latitude</FormLabel>
                  <Input
                    placeholder='Latitude'
                    value={latitude}
                    size='lg'
                    onChange={(event) => {
                      setLatitude(event.currentTarget.value);
                      latitudeDB.current = event.currentTarget.value;
                    }}
                  />
                </FormControl>

                <FormControl id='longitude'>
                  <FormLabel>Longitude</FormLabel>
                  <Input
                    placeholder='Longitude'
                    value={longitude}
                    size='lg'
                    onChange={(event) => {
                      setLongitude(event.currentTarget.value);
                      longitudeDB.current = event.currentTarget.value;
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

                <FormControl>
                  <FormLabel fontSize='sm' fontWeight='md' color='gray.700'>
                    Venue Photo
                  </FormLabel>
                  {fileName && <Text>File uploaded: {fileName}</Text>}
                  <Flex
                    mt={1}
                    justify='center'
                    px={6}
                    pt={5}
                    pb={6}
                    borderWidth={2}
                    borderColor='gray.300'
                    borderStyle='dashed'
                    rounded='md'
                  >
                    <Stack spacing={1} textAlign='center'>
                      <Icon
                        mx='auto'
                        boxSize={12}
                        color='gray.400'
                        stroke='currentColor'
                        fill='none'
                        viewBox='0 0 48 48'
                        aria-hidden='true'
                      >
                        <path
                          d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                        />
                      </Icon>
                      <Flex
                        fontSize='sm'
                        color='gray.600'
                        alignItems='baseline'
                      >
                        <chakra.label
                          htmlFor='file-upload'
                          cursor='pointer'
                          rounded='md'
                          fontSize='md'
                          color='brand.600'
                          pos='relative'
                          _hover={{
                            color: 'brand.400',
                          }}
                        >
                          <span>Upload a file</span>
                          <VisuallyHidden>
                            <input
                              id='file-upload'
                              name='file-upload'
                              type='file'
                              onChange={onFileChange}
                            />
                          </VisuallyHidden>
                        </chakra.label>
                        <Text pl={1}>or drag and drop</Text>
                      </Flex>
                      <Text fontSize='xs' color='gray.500'>
                        PNG, JPG, GIF up to 10MB
                      </Text>
                    </Stack>
                  </Flex>
                </FormControl>

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
