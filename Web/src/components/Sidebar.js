import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Box, CloseButton, Flex, Text } from "@chakra-ui/react";
import {
  FiHome,
  FiCompass,
  FiStar,
  FiSettings,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";
import NavLink from "./NavLink";
import Link from "next/link";
import { currentSession } from "@constants/helper";
import { useState } from "react";

let LinkItems = null;

export default function Sidebar({ onClose, ...rest }) {
  const [loading, setLoading] = useState(false);
  const [item, setItems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const session = await currentSession();
      if (session.user.admin) {
        LinkItems = [
          { label: "Home", icon: FiHome, href: "/" },
          { label: "Manage Events", icon: FiSettings, href: "/event" },
          { label: "Manage Assets", icon: FiStar, href: "/asset" },
        ];
      } else {
        LinkItems = [
          { label: "Home", icon: FiHome, href: "/" },
          { label: "Manage Events", icon: FiSettings, href: "/event" },
          { label: "Manage Assets", icon: FiStar, href: "/asset" },
        ];
      }

      setItems(LinkItems);
      setLoading(true);
    }
    fetchData();

    router.events.on("routeChangeComplete", onClose);
    return () => {
      router.events.off("routeChangeComplete", onClose);
    };
  }, [router.events, onClose, loading]);

  return (
    <Box
      transition="3s ease"
      bg="white"
      borderRight="1px"
      borderRightColor="gray.200"
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Link href="/">
          <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
            ARMazing
          </Text>
        </Link>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      {loading &&
        item &&
        item.map((link, i) => <NavLink key={i} link={link} />)}
      {!loading && (<Text>Loading sidebar...</Text>)}
    </Box>
  );
}
