import { cardVariant, parentVariant } from "@root/motion";
import { motion } from "framer-motion";
import { Box, SimpleGrid } from "@chakra-ui/react";
import Card from "@components/Card";
import Auth from "@components/Auth";
const MotionSimpleGrid = motion(SimpleGrid);
const MotionBox = motion(Box);

export default function Home() {
  return (
    <Auth>
      <Box>
        <MotionSimpleGrid
          mt="3"
          minChildWidth={{ base: "full", md: "500px", lg: "500px" }}
          spacing="2em"
          minH="full"
          variants={parentVariant}
          initial="initial"
          animate="animate"
        >
          <MotionBox variants={cardVariant} key="1">
            <Card
              product={{
                img: "/image/events.png",
                title: "Manage Events",
                link: "/event",
              }}
            />
          </MotionBox>
        </MotionSimpleGrid>
      </Box>
    </Auth>
  );
}
