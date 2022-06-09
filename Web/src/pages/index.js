import { cardVariant, parentVariant } from '@root/motion';
import { motion } from 'framer-motion';
import {
  Box,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Card from '@components/Card';
import Auth from '@components/Auth';

const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function Home() {
  const [loading, setLoading] = useState(false);

  const [event, setEvent] = useState(0);
  const [user, setUser] = useState(0);
  const [asset, setAsset] = useState(0);

  const [data, setData] = useState(null);

  const generateStatistic = async (content) => {
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
      setData(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const rawResponse = await fetch('/api/dashboard/statistic', {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const content = await rawResponse.json();
      if (content.status) {
        await generateStatistic(content.msg);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
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
        {!loading && data && (
          <Box
            bg='white'
            borderRadius='lg'
            p={8}
            color='gray.700'
            shadow='base'
          >
            <Stack direction='horizontal'>
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
            </Stack>
          </Box>
        )}

        {loading && (
          <Box
            bg='white'
            borderRadius='lg'
            p={8}
            color='gray.700'
            shadow='base'
            align='center'
            justify='center'
            mt={30}
          >
            <Text>Loading Please wait...</Text>
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
