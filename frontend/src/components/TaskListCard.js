import React from 'react';
import {
  Box, Heading, List, ListItem, Checkbox, Text, useColorModeValue, Flex
} from '@chakra-ui/react';
import { FaTasks } from 'react-icons/fa';

/**
 * A card component that displays a list of tasks.
 * It shows a title, and a list of tasks with checkboxes.
 */
const TaskListCard = () => {
  // Define some mock task data for now.
  // In a real application, this data would be fetched from a parent component or an API.
  const mockTasks = [
    { id: 1, text: 'Finish the dashboard UI', isCompleted: false },
    { id: 2, text: 'Write new API endpoints for tasks', isCompleted: false },
    { id: 3, text: 'Refactor the timer logic', isCompleted: true },
    { id: 4, text: 'Review team pull requests', isCompleted: false },
  ];

  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const completedTextColor = 'gray.400';
  const incompleteTextColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      p={6}
      bg={cardBg}
      rounded="lg"
      shadow="lg"
      border="1px"
      borderColor={cardBorder}
      minWidth={{ base: "100%", md: "400px" }}
    >
      <Flex alignItems="center" mb={4}>
        <Box as={FaTasks} color="purple.400" size="24px" mr={3} />
        <Heading size="md" color="purple.500">
          My Tasks
        </Heading>
      </Flex>
      <List spacing={3}>
        {mockTasks.map(task => (
          <ListItem key={task.id} p={2} rounded="md" _hover={{ bg: hoverBg }}>
            <Flex align="center" justify="space-between">
              <Checkbox
                isChecked={task.isCompleted}
                colorScheme="purple"
                size="lg"
              >
                <Text
                  as={task.isCompleted ? 's' : undefined}
                  fontSize="md"
                  color={task.isCompleted ? completedTextColor : incompleteTextColor}
                >
                  {task.text}
                </Text>
              </Checkbox>
            </Flex>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default TaskListCard;
