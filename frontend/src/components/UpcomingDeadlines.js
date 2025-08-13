// src/components/UpcomingDeadlines.js
import React from 'react';
import { Box, Text, Stack, Flex, useColorModeValue } from '@chakra-ui/react';
import { Calendar } from 'lucide-react';

/**
 * UpcomingDeadlines component shows a list of upcoming deadlines or tasks.
 * @param {object} props
 * @param {Array} props.deadlines - Array of deadline objects with id, title, dueDate fields
 */
const UpcomingDeadlines = ({ deadlines }) => {
  const borderCol = useColorModeValue("cyan.200", "cyan.700");
  const bgCol = useColorModeValue("whiteAlpha.800", "blackAlpha.400");
  const textColor = useColorModeValue("gray.800", "gray.200");

  if (!deadlines || deadlines.length === 0) {
    return (
      <Box p={4} bg={bgCol} borderRadius="md" border="1px solid" borderColor={borderCol}>
        <Text color={textColor} fontStyle="italic" textAlign="center">
          No upcoming deadlines.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={4} bg={bgCol} borderRadius="md" border="1px solid" borderColor={borderCol}>
      <Text fontWeight="bold" fontSize="lg" mb={3} color={textColor}>
        Upcoming Deadlines
      </Text>
      <Stack spacing={3}>
        {deadlines.map(({ id, title, dueDate }) => {
          const dueDateFormatted = new Date(dueDate).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric',
          });

          return (
            <Flex key={id} align="center" gap={3}>
              <Box as={Calendar} boxSize={5} color="cyan.500" />
              <Box>
                <Text fontWeight="semibold" color={textColor}>{title}</Text>
                <Text fontSize="sm" color="gray.500">{dueDateFormatted}</Text>
              </Box>
            </Flex>
          );
        })}
      </Stack>
    </Box>
  );
};

export default UpcomingDeadlines;
