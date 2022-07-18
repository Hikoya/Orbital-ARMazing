import React from 'react';
import Header from '@components/Header';
import Sidebar from '@components/Sidebar';

import { Box, Drawer, DrawerContent, useDisclosure } from '@chakra-ui/react';

/**
 * Main layout. This layout is used to enforce consistency
 * for all pages. It contains the Header, Sidebar and the main content.
 */
export default function Layout({ session, children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH='100vh' bg='gray.100'>
      <Sidebar
        session={session}
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size='full'
      >
        <DrawerContent>
          <Sidebar session={session} onClose={onClose} />
        </DrawerContent>
      </Drawer>

      <Header onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p='4'>
        {children}
      </Box>
    </Box>
  );
}
