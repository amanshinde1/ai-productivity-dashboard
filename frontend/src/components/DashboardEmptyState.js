// src/components/DashboardEmptyState.js
import React from 'react';
import {
  VStack, Text, Heading, Button, Center, Icon, useColorModeValue
} from '@chakra-ui/react';
import { ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const DashboardEmptyState = ({ onOpen }) => {
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const cardShadow = useColorModeValue('md', 'lg');

  return (
    <Center height="100vh">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <VStack
          p={10}
          borderRadius="lg"
          bg={cardBgColor}
          boxShadow={cardShadow}
          textAlign="center"
          maxWidth="lg"
          spacing={4}
        >
          <Icon as={ClipboardList} w={12} h={12} color="blue.500" />
          <Heading size="lg">No Tasks Found!</Heading>
          <Text fontSize="md" color="gray.500">
            Looks like you've completed all your tasks or haven't added any yet.
          </Text>
          <Button
            onClick={onOpen}
            colorScheme="blue"
          >
            Add Your First Task
          </Button>
        </VStack>
      </motion.div>
    </Center>
  );

};

export default DashboardEmptyState;
