// src/components/Analytics.js
import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Card,
  useColorModeValue,
} from '@chakra-ui/react';

const Analytics = () => {
  const headingColor = useColorModeValue('gray.900', 'text.heading');
  const textColor = useColorModeValue('gray.600', 'text.dark');

  return (
    <Box p="6">
      <Heading size="lg" mb="6" color={headingColor}>Analytics</Heading>
      <Text color={textColor}>This is the Analytics View. You can see various analytics and reports here.</Text>
      <VStack spacing="4" mt="4">
        <Card p="4" width="full">
          <Heading size="md" mb="2" color={textColor}>Productivity Trends</Heading>
          <Text fontSize="sm" color={textColor}>Graph showing your task completion rate over time.</Text>
          <Box bg={useColorModeValue('gray.100', 'dark.700')} h="200px" borderRadius="md" mt="2" display="flex" alignItems="center" justifyContent="center">
            <Text color={textColor}>Chart Placeholder</Text>
          </Box>
        </Card>
        <Card p="4" width="full">
          <Heading size="md" mb="2" color={textColor}>Time Allocation</Heading>
          <Text fontSize="sm" color={textColor}>Breakdown of time spent on different task categories.</Text>
          <Box bg={useColorModeValue('gray.100', 'dark.700')} h="200px" borderRadius="md" mt="2" display="flex" alignItems="center" justifyContent="center">
            <Text color={textColor}>Chart Placeholder</Text>
          </Box>
        </Card>
      </VStack>
    </Box>
  );
};

export default Analytics;
