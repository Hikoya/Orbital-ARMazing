import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Box, CloseButton, Flex, Text } from '@chakra-ui/react';
import {
  FiHome,
  FiStar,
  FiSettings,
  FiPaperclip,
  FiAward,
} from 'react-icons/fi';

import NavLink from '@components/NavLink';

const adminMenu = [
  { label: 'Home', icon: FiHome, href: '/' },
  { label: 'Manage Events', icon: FiSettings, href: '/event' },
  { label: 'Manage Assets', icon: FiStar, href: '/asset' },
  { label: 'Manage Quiz', icon: FiPaperclip, href: '/quiz' },
  { label: 'Leaderboard', icon: FiAward, href: '/leaderboard' },
];

const userMenu = [
  { label: 'Home', icon: FiHome, href: '/' },
  { label: 'Manage Events', icon: FiSettings, href: '/event' },
  { label: 'Manage Assets', icon: FiStar, href: '/asset' },
  { label: 'Manage Quiz', icon: FiPaperclip, href: '/quiz' },
  { label: 'Leaderboard', icon: FiAward, href: '/leaderboard' },
];

/**
 * Sidebar component at the side with all navigation links
 */
export default function Sidebar({ session, onClose, ...rest }) {
  const router = useRouter();
  const [menu, setMenu] = useState(userMenu);

  useEffect(() => {
    if (session) {
      if (session.user.admin) {
        setMenu(adminMenu);
      }
    }

    router.events.on('routeChangeComplete', onClose);
    return () => {
      router.events.off('routeChangeComplete', onClose);
    };
  }, [router.events, onClose, session]);

  return (
    <Box
      transition='3s ease'
      bg='white'
      borderRight='1px'
      borderRightColor='gray.200'
      w={{ base: 'full', md: 60 }}
      pos='fixed'
      h='full'
      {...rest}
    >
      <Flex h='20' alignItems='center' mx='8' justifyContent='space-between'>
        <Link href='/'>
          <Text fontSize='2xl' fontFamily='monospace' fontWeight='bold'>
            ARMazing
          </Text>
        </Link>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      {menu && menu.map((link, i) => <NavLink key={i} link={link} />)}
    </Box>
  );
}
