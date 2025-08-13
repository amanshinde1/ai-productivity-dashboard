// src/components/ProjectProgressList.js
import React from 'react';
import { Box, Progress, Text, VStack, useColorModeValue } from '@chakra-ui/react';

const ProjectProgressList = ({ projects = [] }) => {
  const textColor = useColorModeValue('gray.800', 'gray.200');

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Project Progress
      </Text>
      <VStack spacing={4} align="stretch">
        {projects.length > 0 ? (
          projects.map((proj) => (
            <Box key={proj.id}>
              <Text mb={1} color={textColor}>{proj.name}</Text>
              <Progress
                value={proj.progress}
                size="sm"
                colorScheme={proj.progress > 75 ? 'green' : 'yellow'}
                borderRadius="md"
              />
            </Box>
          ))
        ) : (
          <Text color={textColor} opacity={0.7}>No projects available</Text>
        )}
      </VStack>
    </Box>
  );
};

export default ProjectProgressList;
