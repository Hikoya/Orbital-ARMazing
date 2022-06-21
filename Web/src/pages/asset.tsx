import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import Auth from '@components/Auth';
import { useRouter } from 'next/router';
import {
  Button,
  Box,
  Checkbox,
  chakra,
  FormControl,
  FormLabel,
  Flex,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  Text,
  Textarea,
  Stack,
  Select,
  SimpleGrid,
  VisuallyHidden,
  useToast,
} from '@chakra-ui/react';
import TableWidget from '@components/TableWidget';
import { Asset } from 'types/asset';
import { Result } from 'types/api';
import { Event } from 'types/event';
import { InfoOutlineIcon } from '@chakra-ui/icons';

import Map from '@components/Map';

import { parentVariant } from '@root/motion';
import { motion } from 'framer-motion';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function AssetComponent() {
  const router = useRouter();

  const [loadingData, setLoading] = useState(false);
  const toast = useToast();

  const assetData = useRef([]);

  const assetDBEdit = useRef('');
  const [asset, setAsset] = useState('');

  const nameDB = useRef('');
  const [name, setName] = useState('');

  const nameDBEdit = useRef('');
  const [nameEdit, setNameEdit] = useState('');

  const descriptionDB = useRef('');
  const [description, setDescription] = useState('');

  const descriptionDBEdit = useRef('');
  const [descriptionEdit, setDescriptionEdit] = useState('');

  const visibleDB = useRef(true);
  const [visible, setVisible] = useState(true);

  const visibleDBEdit = useRef(true);
  const [visibleEdit, setVisibleEdit] = useState(true);

  const [eventID, setEventID] = useState('');
  const eventIDDB = useRef('');

  const [eventIDEdit, setEventIDEdit] = useState('');
  const eventIDDBEdit = useRef('');

  const selectedFileDB = useRef(null);
  const [fileName, setFileName] = useState(null);

  const selectedFileDBEdit = useRef(null);
  const [fileNameEdit, setFileNameEdit] = useState(null);

  const [eventDropdown, setEventDropdown] = useState([]);

  const latitudeDB = useRef('');
  const [latitude, setLatitude] = useState('');

  const latitudeDBEdit = useRef('');
  const [latitudeEdit, setLatitudeEdit] = useState('');

  const longitudeDB = useRef('');
  const [longitude, setLongitude] = useState('');

  const longitudeDBEdit = useRef('');
  const [longitudeEdit, setLongitudeEdit] = useState('');

  const [errorMsg, setError] = useState(null);
  const [errorMsgEdit, setErrorEdit] = useState(null);

  const [assetDropdown, setAssetDropdown] = useState([]);

  const [data, setData] = useState([]);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState(null);

  const [markers, setMarkers] = useState(null);
  const location = {
    lat: 1.2925423384337875,
    lng: 103.78102165309795,
  };

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

  const resetEdit = async () => {
    assetDBEdit.current = '';
    nameDBEdit.current = '';
    descriptionDBEdit.current = '';
    eventIDDBEdit.current = '';
    selectedFileDBEdit.current = null;
    latitudeDBEdit.current = '';
    longitudeDBEdit.current = '';
    visibleDBEdit.current = true;

    setAsset('');
    setNameEdit('');
    setDescriptionEdit('');
    setFileNameEdit(null);
    setLatitudeEdit('');
    setLongitudeEdit('');
    setVisibleEdit(true);
    setErrorEdit(null);
  };

  const validateFields = (
    nameFieldDB: string,
    descriptionFieldDB: string,
    eventIDFieldDB: string,
    selectedFileField: any,
    latitudeFieldDB: string,
    longitudeFieldDB: string,
  ) => {
    // super basic validation here
    const nameField = nameFieldDB.trim();
    const descriptionField = descriptionFieldDB.trim();
    const eventIDField = eventIDFieldDB.trim();
    const latitudeField = latitudeFieldDB.trim();
    const longitudeField = longitudeFieldDB.trim();

    if (nameField === '' || nameField === null || nameField === undefined) {
      setError('Please write a name!');
      return false;
    }

    if (
      descriptionField === '' ||
      descriptionField === null ||
      descriptionField === undefined
    ) {
      setError('Please write a description!');
      return false;
    }

    if (
      eventIDField === '' ||
      eventIDField === null ||
      eventIDField === undefined
    ) {
      setError('Please choose an event!');
      return false;
    }

    if (selectedFileField === null || selectedFileField === undefined) {
      setError('Please upload an image!');
      return false;
    }

    if (
      latitudeField === '' ||
      latitudeField === null ||
      latitudeField === undefined ||
      Number.isNaN(Number(latitudeField))
    ) {
      setError('Please provide a latitude!');
      return false;
    }

    if (
      longitudeField === '' ||
      longitudeField === null ||
      longitudeField === undefined ||
      Number.isNaN(Number(latitudeField))
    ) {
      setError('Please provide a longitude');
      return false;
    }

    return true;
  };

  const validateFieldsEdit = (
    idFieldDB: string,
    nameFieldDB: string,
    descriptionFieldDB: string,
    eventIDFieldDB: string,
    latitudeFieldDB: string,
    longitudeFieldDB: string,
  ) => {
    // super basic validation here
    const idField = idFieldDB.trim();
    const nameField = nameFieldDB.trim();
    const descriptionField = descriptionFieldDB.trim();
    const eventIDField = eventIDFieldDB.trim();
    const latitudeField = latitudeFieldDB.trim();
    const longitudeField = longitudeFieldDB.trim();

    if (idField === '' || idField === null || idField === undefined) {
      setErrorEdit('Please select an asset!');
      return false;
    }

    if (nameField === '' || nameField === null || nameField === undefined) {
      setErrorEdit('Please write a name!');
      return false;
    }

    if (
      descriptionField === '' ||
      descriptionField === null ||
      descriptionField === undefined
    ) {
      setErrorEdit('Please write a description!');
      return false;
    }

    if (
      eventIDField === '' ||
      eventIDField === null ||
      eventIDField === undefined
    ) {
      setErrorEdit('Please choose an event!');
      return false;
    }

    if (
      latitudeField === '' ||
      latitudeField === null ||
      latitudeField === undefined
    ) {
      setErrorEdit('Please provide a latitude!');
      return false;
    }

    if (
      longitudeField === '' ||
      longitudeField === null ||
      longitudeField === undefined
    ) {
      setErrorEdit('Please provide a longitude');
      return false;
    }

    return true;
  };

  const generateActionButton = useCallback(
    async (content: Asset) => {
      let button = null;

      button = (
        <Button
          size='sm'
          leftIcon={<InfoOutlineIcon />}
          onClick={(event) => {
            event.preventDefault();
            console.log(content.imagePath);
            if (
              router.isReady &&
              content.imagePath !== null &&
              content.imagePath !== undefined &&
              content.imagePath !== ''
            ) {
              router.push(content.imagePath);
            }
          }}
        >
          View Image
        </Button>
      );

      return button;
    },
    [router],
  );

  const includeActionButton = useCallback(
    async (content: Asset[]) => {
      const selectionEdit = [];
      selectionEdit.push(<option key='' value='' aria-label='Default' />);

      const allAssets: Asset[] = [];

      const marker = [];

      for (let key = 0; key < content.length; key += 1) {
        if (content[key]) {
          const dataField: Asset = content[key];
          selectionEdit.push(
            <option key={dataField.id} value={dataField.id}>
              {dataField.name}
            </option>,
          );
          allAssets.push(dataField);

          const buttons = await generateActionButton(dataField);
          dataField.action = buttons;

          const dataSet = {
            title: dataField.name,
            msg: dataField.description,
            pos: {
              lat: Number(dataField.latitude),
              lng: Number(dataField.longitude),
            },
          };

          marker.push(dataSet);
        }
      }

      assetData.current = allAssets;
      setAssetDropdown(selectionEdit);
      setData(content);

      setMarkers(marker);
    },
    [generateActionButton],
  );

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
        await includeActionButton(content.msg as Asset[]);
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
          await resetEdit();
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

  const handleSubmitEdit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (
      validateFieldsEdit(
        assetDBEdit.current,
        nameDBEdit.current,
        descriptionDBEdit.current,
        eventIDDBEdit.current,
        latitudeDBEdit.current,
        longitudeDBEdit.current,
      )
    ) {
      try {
        const dataField = new FormData();
        dataField.append('id', assetDBEdit.current);
        dataField.append('eventID', eventIDDBEdit.current);
        dataField.append('name', nameDBEdit.current);
        dataField.append('description', descriptionDBEdit.current);
        dataField.append('visible', visibleDBEdit.current.toString());
        dataField.append('image', selectedFileDBEdit.current);
        dataField.append('latitude', latitudeDBEdit.current);
        dataField.append('longitude', longitudeDBEdit.current);

        const rawResponse = await fetch('/api/asset/edit', {
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

  const changeDataEdit = (dataField: Asset) => {
    setNameEdit(dataField.name);
    setDescriptionEdit(dataField.description);
    setVisibleEdit(dataField.visible);
    setEventIDEdit(dataField.eventID);
    setLatitudeEdit(dataField.latitude);
    setLongitudeEdit(dataField.longitude);

    nameDBEdit.current = dataField.name;
    descriptionDBEdit.current = dataField.description;
    visibleDBEdit.current = dataField.visible;
    eventIDDBEdit.current = dataField.eventID;
    latitudeDBEdit.current = dataField.latitude;
    longitudeDBEdit.current = dataField.longitude;
  };

  const onFileChange = async (event: { target: { files: FileList } }) => {
    const file = event.target.files[0];
    selectedFileDB.current = file;
    setFileName(file.name);
  };

  const onFileChangeEdit = async (event: { target: { files: FileList } }) => {
    const file = event.target.files[0];
    selectedFileDBEdit.current = file;
    setFileNameEdit(file.name);
  };

  const onEventChange = async (event: { target: { value: any } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDB.current = value;
      setEventID(value);
    }
  };

  const onEventChangeEdit = async (event: { target: { value: any } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDBEdit.current = value;
      setEventIDEdit(value);
    }
  };

  const onAssetChange = async (event: { target: { value: string } }) => {
    if (event.target.value) {
      const { value } = event.target;
      assetDBEdit.current = value;
      setAsset(value);

      if (assetData.current !== []) {
        for (let key = 0; key < assetData.current.length; key += 1) {
          if (assetData.current[key]) {
            const dataField: Asset = assetData.current[key];
            if (dataField.id === value) {
              changeDataEdit(dataField);
            }
          }
        }
      }
    }
  };

  const eventDropDownMenu = async (content: Event[]) => {
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
        await eventDropDownMenu(content.msg as Event[]);
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
      {
        Header: 'Action',
        accessor: 'action',
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
            <Stack>
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
                  data={
                    filteredData && filteredData.length ? filteredData : data
                  }
                />
              </Box>
              <Box>
                <Map
                  location={location}
                  zoomLevel={15}
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}
                  markers={markers}
                />
              </Box>
            </Stack>
          )}
        </Box>

        <MotionSimpleGrid
          mt='3'
          minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
          minH='full'
          variants={parentVariant}
          initial='initial'
          animate='animate'
        >
          <MotionBox>
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
                    <Select onChange={onEventChange} size='sm' value={eventID}>
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

                  <FormControl id='photo'>
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
          </MotionBox>
          <MotionBox>
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
              <Heading size='md'>Edit Asset</Heading>
              <form onSubmit={handleSubmitEdit}>
                <Stack spacing={4}>
                  <Stack spacing={5} w='full'>
                    <Text>Select Asset</Text>
                    <Select onChange={onAssetChange} size='sm' value={asset}>
                      {assetDropdown}
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

                  <FormControl id='latitudeEdit'>
                    <FormLabel>Latitude</FormLabel>
                    <Input
                      placeholder='Latitude'
                      value={latitudeEdit}
                      size='lg'
                      onChange={(event) => {
                        setLatitudeEdit(event.currentTarget.value);
                        latitudeDBEdit.current = event.currentTarget.value;
                      }}
                    />
                  </FormControl>

                  <FormControl id='longitudeEdit'>
                    <FormLabel>Longitude</FormLabel>
                    <Input
                      placeholder='Longitude'
                      value={longitudeEdit}
                      size='lg'
                      onChange={(event) => {
                        setLongitudeEdit(event.currentTarget.value);
                        longitudeDBEdit.current = event.currentTarget.value;
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

                  <FormControl id='photoEdit'>
                    <FormLabel fontSize='sm' fontWeight='md' color='gray.700'>
                      Venue Photo
                    </FormLabel>
                    {fileNameEdit && <Text>File uploaded: {fileNameEdit}</Text>}
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
                            htmlFor='file-upload-edit'
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
                                id='file-upload-edit'
                                name='file-upload-edit'
                                type='file'
                                onChange={onFileChangeEdit}
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

                  {errorMsgEdit && (
                    <Stack align='center'>
                      <Text>{errorMsgEdit}</Text>
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
                      Update
                    </Button>
                  </Stack>
                </Stack>
              </form>
            </Stack>
          </MotionBox>
        </MotionSimpleGrid>
      </Box>
    </Auth>
  );
}
