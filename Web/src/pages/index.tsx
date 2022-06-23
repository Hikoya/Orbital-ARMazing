import React, { useState, useEffect, useCallback } from 'react';
import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';
import {
  Box,
  HStack,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react';
import Card from '@components/Card';
import Auth from '@components/Auth';
import { Result } from 'types/api';
import { Statistic } from 'types/dashboard';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function Home() {
  const [loading, setLoading] = useState(false);

  const [event, setEvent] = useState(0);
  const [user, setUser] = useState(0);
  const [asset, setAsset] = useState(0);

  const [data, setData] = useState(false);

  const generateStatistic = useCallback(async (content: Statistic) => {
    if (content) {
      setData(true);

      if (content.event) {
        setEvent(content.event);
      }

      if (content.user) {
        setUser(content.user);
      }

      if (content.asset) {
        setAsset(content.asset);
      }
    } else {
      setData(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const rawResponse = await fetch('/api/dashboard/statistic', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content: Result = await rawResponse.json();
      if (content.status) {
        await generateStatistic(content.msg as Statistic);
      }
    } catch (error) {
      return false;
    }

    setLoading(false);
    return true;
  }, [generateStatistic]);

  useEffect(() => {
    async function generate() {
      await fetchData();
    }

    generate();
  }, [fetchData]);

  return (
    <Auth admin={undefined}>
      <Box>
        {!loading && data && (
          <Box
            bg='white'
            borderRadius='lg'
            p={8}
            color='gray.700'
            shadow='base'
          >
            <HStack>
              <Stat>
                <StatLabel>Total Events</StatLabel>
                <StatNumber>{event}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total Assets</StatLabel>
                <StatNumber>{asset}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total Users joined</StatLabel>
                <StatNumber>{user}</StatNumber>
              </Stat>
            </HStack>
          </Box>
        )}

        {loading && (
          <Box
            bg='white'
            borderRadius='lg'
            p={8}
            color='gray.700'
            shadow='base'
            mt={30}
          >
            <Stack align='center' justify='center'>
              <Text>Loading Please wait...</Text>
            </Stack>
          </Box>
        )}

        <MotionSimpleGrid
          mt='3'
          minChildWidth={{ base: 'full', md: '500px', lg: '500px' }}
          spacing='2em'
          minH='full'
          variants={parentVariant}
          initial='initial'
          animate='animate'
        >
          <MotionBox variants={cardVariant} key='1'>
            <Card
              product={{
                img: '/image/events.png',
                title: 'Manage Events',
                link: '/event',
              }}
            />
          </MotionBox>

          <MotionBox variants={cardVariant} key='1'>
            <Card
              product={{
                img: '/image/assets.png',
                title: 'Manage Assets',
                link: '/asset',
              }}
            />
          </MotionBox>

          <MotionBox variants={cardVariant} key='1'>
            <Card
              product={{
                img: '/image/quiz.png',
                title: 'Manage Quiz Pool',
                link: '/quiz',
              }}
            />
          </MotionBox>
        </MotionSimpleGrid>
      </Box>
    </Auth>
  );
}
