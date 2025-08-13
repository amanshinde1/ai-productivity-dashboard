// src/components/TaskStatusDetails.js
import React from 'react';
import { Box, Text, VStack, HStack, useColorModeValue } from '@chakra-ui/react';

const STATUS_COLORS = {
  Completed: 'green.400',
  'In Progress': 'yellow.400',
  Overdue: 'red.400',
};

const TaskStatusDetails = ({ stats }) => {
  const textColor = useColorModeValue('gray.800', 'gray.200');

  if (!stats) return null;

  const { totalTasks = 0, tasksCompleted = 0, tasksOverdue = 0 } = stats;
  const tasksInProgress = totalTasks - tasksCompleted - tasksOverdue;

  const items = [
    { label: 'Completed', count: tasksCompleted, color: STATUS_COLORS.Completed },
    { label: 'In Progress', count: tasksInProgress, color: STATUS_COLORS['In Progress'] },
    { label: 'Overdue', count: tasksOverdue, color: STATUS_COLORS.Overdue },
  ];

  return (
    <VStack spacing={6} align="stretch" h="100%" justifyContent="center">
      <Text fontSize="lg" fontWeight="bold" color={textColor} textAlign="center">
        Task Status Details
      </Text>
      {items.map(({ label, count, color }) => (
        <HStack key={label} justifyContent="space-between" px={4} py={3} bg={`${color}.100`} borderRadius="md">
          <Text fontWeight="semibold" color={color}>
            {label}
          </Text>
          <Text fontWeight="bold" color={textColor}>
            {count}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
};

export default TaskStatusDetails;
