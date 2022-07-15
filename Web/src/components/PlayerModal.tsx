import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  List,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  TableContainer,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { cardVariant, parentVariant } from '@root/motion';

import { Result } from 'types/api';
import { Attempt } from 'types/attempt';
import { Leaderboard } from 'types/leaderboard';

import { checkerString } from '@helper/common';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function PlayerModal({ isOpen, onClose, modalData }) {
  const [loadingData, setLoadingData] = useState(true);
  const [username, setUsername] = useState('');
  const [points, setPoints] = useState(0);
  const [eventName, setEventName] = useState('');

  const eventIDDB = useRef('');
  const usernameDB = useRef('');

  const [attempt, setAttempt] = useState<JSX.Element | null>();

  const reset = () => {
    setUsername('');
    setPoints(0);
    setEventName('');

    eventIDDB.current = '';
    usernameDB.current = '';

    setAttempt(null);
  };

  const handleModalCloseButton = () => {
    setTimeout(() => {
      reset();
      onClose();
    }, 200);
  };

  const generateAttemptList = useCallback(async (content: Attempt[]) => {
    if (content.length > 0) {
      const list: JSX.Element[] = [];

      for (let key = 0; key < content.length; key += 1) {
        if (content[key]) {
          const att: Attempt = content[key];
          if (att.assetName !== undefined) {
            list.push(
              <Tr key={`tr-r-${key}`}>
                <Td key={`td-r-${key}-1`}>
                  <Text>{att.assetName}</Text>
                </Td>
                <Td key={`td-r-${key}-2`}>
                  <Text>{att.points}</Text>
                </Td>
              </Tr>,
            );
          }
        }
      }

      const tableField: JSX.Element = (
        <TableContainer>
          <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Asset Name</Th>
              <Th>Points</Th>
            </Tr>
          </Thead>

            <Tbody>{list}</Tbody>
          </Table>
        </TableContainer>
      );

      setAttempt(tableField);
    } else {
      setAttempt(null);
    }
  }, []);

  const fetchAttempt = useCallback(async () => {
    if (checkerString(eventIDDB.current) && checkerString(usernameDB.current)) {
      try {
        const rawResponse = await fetch('/api/attempt/fetch', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventID: eventIDDB.current,
            username: usernameDB.current,
          }),
        });
        const content: Result = await rawResponse.json();
        if (content.status) {
          await generateAttemptList(content.msg);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, [generateAttemptList]);

  useEffect(() => {
    async function setupData(modalDataField: Leaderboard) {
      setLoadingData(true);

      const usernameField: string =
        modalDataField && modalDataField.username
          ? modalDataField.username
          : '';
      setUsername(usernameField);
      usernameDB.current = usernameField;

      const pointsField: number =
        modalDataField && modalDataField.points ? modalDataField.points : 0;
      setPoints(pointsField);

      const eventNameField: string =
        modalDataField && modalDataField.eventName
          ? modalDataField.eventName
          : '';
      setEventName(eventNameField);

      const eventIDField: string =
        modalDataField && modalDataField.eventID ? modalDataField.eventID : '';
      eventIDDB.current = eventIDField;

      await fetchAttempt();
      setLoadingData(false);
    }

    if (modalData) {
      setupData(modalData);
    }
  }, [modalData, fetchAttempt]);

  return (
    <Modal
      closeOnOverlayClick={false}
      isOpen={isOpen}
      onClose={handleModalCloseButton}
      size='full'
      isCentered
      motionPreset='slideInBottom'
      scrollBehavior='inside'
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader />
        <ModalBody>
          <MotionSimpleGrid
            mt='3'
            minChildWidth={{ base: 'full', md: 'full' }}
            spacing='2em'
            minH='full'
            variants={parentVariant}
            initial='initial'
            animate='animate'
          >
            <MotionBox variants={cardVariant} key='2'>
              {modalData && !loadingData && (
                <Flex
                  w='full'
                  h='full'
                  alignItems='center'
                  justifyContent='center'
                >
                  <Stack spacing={{ base: 6, md: 10 }}>
                    <Stack
                      spacing={{ base: 4, sm: 6 }}
                      direction='column'
                      divider={<StackDivider borderColor='gray.200' />}
                    >
                      <Box>
                        <List spacing={5}>
                          {checkerString(eventName) && (
                            <ListItem key='player-eventname'>
                              <Stack direction='row'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  Event Name
                                </Text>{' '}
                                <Text>{eventName}</Text>
                              </Stack>
                            </ListItem>
                          )}

                          {checkerString(username) && (
                            <ListItem key='player-username'>
                              <Stack direction='row'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  Username
                                </Text>{' '}
                                <Text>{username}</Text>
                              </Stack>
                            </ListItem>
                          )}

                          <ListItem key='player-points'>
                            <Stack direction='row'>
                              <Text
                                textTransform='uppercase'
                                letterSpacing='tight'
                                fontWeight='bold'
                              >
                                Points
                              </Text>{' '}
                              <Text>{points}</Text>
                            </Stack>
                          </ListItem>

                          {attempt && (
                            <ListItem key='player-attempt'>
                              <Stack direction='column'>
                                <Text
                                  textTransform='uppercase'
                                  letterSpacing='tight'
                                  fontWeight='bold'
                                >
                                  List of Landmarks where quiz attempted
                                </Text>{' '}
                                <Stack direction='column'>{attempt}</Stack>
                              </Stack>
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    </Stack>
                  </Stack>
                </Flex>
              )}
            </MotionBox>
          </MotionSimpleGrid>
        </ModalBody>
        <ModalFooter>
          <Button
            bg='cyan.700'
            color='white'
            w='150px'
            size='lg'
            onClick={handleModalCloseButton}
            _hover={{ bg: 'cyan.800' }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
