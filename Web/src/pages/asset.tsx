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

import { checkerString, checkerNumber } from '@helper/common';

import safeJsonStringify from 'safe-json-stringify';
import { GetServerSideProps } from 'next';
import { currentSession } from '@helper/sessionServer';
import { Session } from 'next-auth/core/types';
import { levels } from '@constants/admin';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

interface MarkerData {
  id: string;
  title: string;
  msg: string;
  pos: {
    lat: number;
    lng: number;
  };
}

/**
 * This component renders the /asset path, showing a table of all the assets visible to the user,
 * as well as provide options to edit and create new assets.
 */
export default function AssetComponent(props: any) {
  const router = useRouter();

  const [loadingData, setLoading] = useState(false);
  const toast = useToast();

  const assetData = useRef<Asset[]>([]);

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

  const selectedFileDB = useRef<string | Blob | null>(null);
  const [fileName, setFileName] = useState('');

  const selectedFileDBEdit = useRef<string | Blob | null>(null);
  const [fileNameEdit, setFileNameEdit] = useState('');

  const [eventDropdown, setEventDropdown] = useState<JSX.Element[]>([]);

  const latitudeDB = useRef('');
  const [latitude, setLatitude] = useState('');

  const latitudeDBEdit = useRef('');
  const [latitudeEdit, setLatitudeEdit] = useState('');

  const longitudeDB = useRef('');
  const [longitude, setLongitude] = useState('');

  const longitudeDBEdit = useRef('');
  const [longitudeEdit, setLongitudeEdit] = useState('');

  const [errorMsg, setError] = useState('');
  const [errorMsgEdit, setErrorEdit] = useState('');

  const [assetDropdown, setAssetDropdown] = useState<JSX.Element[]>([]);

  const [data, setData] = useState<Asset[]>([]);

  const [search, setSearch] = useState('');
  const [filteredData, setFilteredData] = useState<Asset[] | null>(null);

  const [API_KEY, setAPIKEY] = useState('');
  const [markers, setMarkers] = useState<MarkerData[] | null>(null);
  const location = {
    lat: 1.2925423384337875,
    lng: 103.78102165309795,
  };
  const [coordinate, setCoordinate] = useState('');

  const [organizer, setOrganizer] = useState(true);

  const [noEvent, setNoEvent] = useState(false);

  const onLocationChange = (locationC: { lat: number; lng: number }) => {
    const text = `Latitude: ${locationC.lat} , Longitude: ${locationC.lng}`;
    setCoordinate(text);
  };

  /**
   * Resets all values to their default values upon successful creation of asset
   */
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
    setFileName('');
    setLatitude('');
    setLongitude('');
    setVisible(true);
    setError('');
  };

  /**
   * Resets all values to their default values upon successful editing of asset
   */
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
    setFileNameEdit('');
    setLatitudeEdit('');
    setLongitudeEdit('');
    setVisibleEdit(true);
    setErrorEdit('');
  };

  /**
   * Input validation for creating an asset
   */
  const validateFields = (
    nameField: string,
    descriptionField: string,
    eventIDField: string,
    selectedFileField: any,
    latitudeField: string,
    longitudeField: string,
  ) => {
    if (!checkerString(nameField)) {
      setError('Please write a name!');
      return false;
    }

    if (!checkerString(descriptionField)) {
      setError('Please write a description!');
      return false;
    }

    if (!checkerString(eventIDField)) {
      setError('Please choose an event!');
      return false;
    }

    if (selectedFileField === null || selectedFileField === undefined) {
      setError('Please upload an image!');
      return false;
    }

    if (
      !checkerString(latitudeField) ||
      !checkerNumber(Number(latitudeField))
    ) {
      setError('Please provide a latitude!');
      return false;
    }

    if (
      !checkerString(longitudeField) ||
      !checkerNumber(Number(latitudeField))
    ) {
      setError('Please provide a longitude');
      return false;
    }

    if (
      !(
        Number(longitudeField) > -180 &&
        Number(longitudeField) < 180 &&
        Number(latitudeField) > -90 &&
        Number(latitudeField) < 90
      )
    ) {
      setError('Please provide valid pair of longitude and latitude');
      return false;
    }

    return true;
  };

  /**
   * Input validation for editing an asset
   */
  const validateFieldsEdit = (
    idField: string,
    nameField: string,
    descriptionField: string,
    eventIDField: string,
    latitudeField: string,
    longitudeField: string,
  ) => {
    if (!checkerString(idField)) {
      setErrorEdit('Please select an asset!');
      return false;
    }

    if (!checkerString(nameField)) {
      setErrorEdit('Please write a name!');
      return false;
    }

    if (!checkerString(descriptionField)) {
      setErrorEdit('Please write a description!');
      return false;
    }

    if (!checkerString(eventIDField)) {
      setErrorEdit('Please choose an event!');
      return false;
    }

    if (
      !checkerString(latitudeField) ||
      !checkerNumber(Number(latitudeField))
    ) {
      setErrorEdit('Please provide a latitude!');
      return false;
    }

    if (
      !checkerString(longitudeField) ||
      !checkerNumber(Number(longitudeField))
    ) {
      setErrorEdit('Please provide a longitude');
      return false;
    }

    if (
      !(
        Number(longitudeField) > -180 &&
        Number(longitudeField) < 180 &&
        Number(latitudeField) > -90 &&
        Number(latitudeField) < 90
      )
    ) {
      setErrorEdit('Please provide valid pair of longitude and latitude');
      return false;
    }

    return true;
  };

  /**
   * Generates an action button to redirect users to the image path.
   */
  const generateActionButton = useCallback(
    async (content: Asset) => {
      const button: JSX.Element = (
        <Button
          size='sm'
          leftIcon={<InfoOutlineIcon />}
          onClick={(event) => {
            event.preventDefault();
            if (
              router.isReady &&
              content.imagePath !== undefined &&
              checkerString(content.imagePath)
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

  /**
   * Creates a dropdown menu for all assets fetched, and calls the function to generate
   * an action button.
   *
   * Populates the data on the table in the end.
   */
  const includeActionButton = useCallback(
    async (content: Asset[]) => {
      const selectionEdit: JSX.Element[] = [];
      selectionEdit.push(<option key='' value='' aria-label='Default' />);

      const allAssets: Asset[] = [];

      const marker: MarkerData[] = [];

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

          if (dataField.id !== undefined) {
            const dataSet: MarkerData = {
              id: dataField.id,
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
      }

      assetData.current = allAssets;
      setAssetDropdown(selectionEdit);
      setData(content);

      setMarkers(marker);
    },
    [generateActionButton],
  );

  /**
   * Fetches assets data by calling the API
   */
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
      }

      setLoading(false);
      return true;
    } catch (error) {
      return false;
    }
  }, [includeActionButton]);

  /**
   * Validates the input from the user, and calls the API to create an asset
   *
   * Resets the input fields upon successful request.
   */
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
        if (selectedFileDB.current !== null) {
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
        } else {
          setError('Please include an image');
        }

        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  /**
   * Validates the input from the user, and calls the API to edit an asset
   *
   * Resets the input fields upon successful request.
   */
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
        if (selectedFileDBEdit.current !== null) {
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
        } else {
          const dataField = new FormData();
          dataField.append('id', assetDBEdit.current);
          dataField.append('eventID', eventIDDBEdit.current);
          dataField.append('name', nameDBEdit.current);
          dataField.append('description', descriptionDBEdit.current);
          dataField.append('visible', visibleDBEdit.current.toString());
          dataField.append('image', '');
          dataField.append('latitude', latitudeDBEdit.current);
          dataField.append('longitude', longitudeDBEdit.current);

          const rawResponse = await fetch('/api/asset/edit', {
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
        }
        return true;
      } catch (error) {
        return false;
      }
    }
    return false;
  };

  /**
   * Validates the asset ID, and calls the API to delete an asset
   *
   * Fetches the latest asset data upon successful request.
   */
  const handleDelete = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (checkerString(assetDBEdit.current)) {
      try {
        const rawResponse = await fetch('/api/asset/delete', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: assetDBEdit.current,
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

  /**
   * Changes all input fields to the given Asset details
   */
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

  /**
   * Event that is called when a user uploads a file on Create Asset
   */
  const onFileChange = async (event: {
    target: { files: FileList | null };
  }) => {
    if (event.target.files !== null) {
      const file = event.target.files[0];
      selectedFileDB.current = file;
      setFileName(file.name);
    }
  };

  /**
   * Event that is called when a user uploads a file on the Edit Asset
   */
  const onFileChangeEdit = async (event: {
    target: { files: FileList | null };
  }) => {
    if (event.target.files !== null) {
      const file = event.target.files[0];
      selectedFileDBEdit.current = file;
      setFileNameEdit(file.name);
    }
  };

  /**
   * Event that is called when a user selects an item from the event dropdown menu
   */
  const onEventChange = async (event: { target: { value: any } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDB.current = value;
      setEventID(value);
    }
  };

  /**
   * Event that is called when a user selects an item from the event dropdown menu
   * for the Edit Asset portion
   */
  const onEventChangeEdit = async (event: { target: { value: any } }) => {
    if (event.target.value) {
      const { value } = event.target;
      eventIDDBEdit.current = value;
      setEventIDEdit(value);
    }
  };

  /**
   * Event that is called when a user selects an item from the asset dropdown menu
   */
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

  /**
   * Generates the event dropdown menu
   */
  const eventDropDownMenu = async (content: Event[]) => {
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
  };

  /**
   * Fetches all event that the user is authorized to view
   */
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
      } else {
        setNoEvent(true);
      }

      return true;
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    async function generate(propsField: any) {
      await fetchData();
      await fetchAssetData();

      const propRes = await propsField;
      if (propRes.API_KEY) {
        setAPIKEY(propRes.API_KEY);
      }

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
  }, [fetchData, fetchAssetData, props]);

  const columns = useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'id',
      },
      {
        Header: 'Event Name',
        accessor: 'eventName',
      },
      {
        Header: 'Asset Name',
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

  /**
   * Event that is called when the user types something in the search bar
   */
  const handleSearch = (event: { target: { value: string } }) => {
    const searchInput = event.target.value;
    setSearch(searchInput);

    if (checkerString(searchInput)) {
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
          {loadingData && (data === null || data.length === 0) && (
            <Box mt={30}>
              <Stack justify='center' align='center'>
                <Text>Loading Please wait...</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length === 0 && (
            <Box w='full' mt={30} overflow='auto'>
              <Stack justify='center' align='center'>
                <Text>No assets found</Text>
              </Stack>
            </Box>
          )}

          {!loadingData && data.length > 0 && (
            <Stack>
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
                  data={
                    filteredData && filteredData.length ? filteredData : data
                  }
                />
              </Box>
            </Stack>
          )}
        </Box>
        <Box bg='white' borderRadius='lg' p={3} color='gray.700' shadow='base'>
          <Map
            location={location}
            zoomLevel={15}
            apiKey={API_KEY || null}
            markers={markers}
            dataHandler={onLocationChange}
          />
          <Text>Click on the Map to get coordinates {coordinate}</Text>
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
                <Heading size='md'>Create Asset</Heading>
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
                                  accept='image/png, image/jpeg'
                                  onChange={onFileChange}
                                />
                              </VisuallyHidden>
                            </chakra.label>
                          </Flex>
                          <Text fontSize='xs' color='gray.500'>
                            PNG, JPG up to 10MB
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
                      {fileNameEdit && (
                        <Text>File uploaded: {fileNameEdit}</Text>
                      )}
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
                                  accept='image/png, image/jpeg'
                                  onChange={onFileChangeEdit}
                                />
                              </VisuallyHidden>
                            </chakra.label>
                          </Flex>
                          <Text fontSize='xs' color='gray.500'>
                            PNG, JPG up to 10MB
                          </Text>
                        </Stack>
                      </Flex>
                    </FormControl>

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
 * On page load, fetches the current session and returns the session data as well
 * as the API key for the Google Maps API.
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
          API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
          sess: data,
        };
      }
      return {
        API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
        sess: null,
      };
    } catch (error) {
      console.error(error);
      return {
        API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
        sess: null,
      };
    }
  })(),
});
