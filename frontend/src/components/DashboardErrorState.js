// src/components/DashboardErrorState.js
import React from 'react';
import {
  Box, VStack, Text, Heading, Button, Center, Icon, useColorModeValue
} from '@chakra-ui/react';
import { Frown } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DashboardErrorState = ({ onRetry }) => {
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const cardShadow = useColorModeValue('md', 'lg');

  return (
    <Center height="100vh">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Box
          p={10}
          borderRadius="lg"
          bg={cardBgColor}
          boxShadow={cardShadow}
          textAlign="center"
          maxWidth="lg"
        >
          <VStack spacing={4}>
            <Icon as={Frown} w={12} h={12} color="red.500" />
            <Heading size="lg">Oops, something went wrong!</Heading>
            <Text fontSize="md" color="gray.500">
              We couldn't load your dashboard data. Please check your connection and try again.
            </Text>
            <Button
              onClick={onRetry}
              colorScheme="red"
            >
              Retry
            </Button>
          </VStack>
        </Box>
      </motion.div>
    </Center>
  );
};

export default DashboardErrorState;
