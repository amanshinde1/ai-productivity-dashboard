import React from 'react';
import {
  Box,
  VStack,
  Text,
  Progress,
  useColorModeValue,
} from '@chakra-ui/react';

const ProjectProgressBar = ({ projects = [] }) => {
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.15)', 'rgba(20, 20, 31, 0.45)');
  const glassBorder = useColorModeValue('1px solid rgba(255, 255, 255, 0.2)', '1px solid rgba(255, 255, 255, 0.25)');
  const glassShadow = useColorModeValue('0 8px 32px 0 rgba(31, 38, 135, 0.37)', '0 8px 32px 0 rgba(31, 38, 135, 0.5)');
  const labelColor = useColorModeValue('gray.800', 'gray.200');

  return (
    <Box
      bg={glassBg}
      border={glassBorder}
      boxShadow={glassShadow}
      borderRadius="md"
      p={6}
      minH="300px"
    >
      <VStack spacing={6} align="stretch">
        {projects.length === 0 ? (
          <Text color={labelColor} fontWeight="semibold" textAlign="center">
            No projects found.
          </Text>
        ) : (
          projects.map(({ id, name, progress, color }) => (
            <Box key={id}>
              <Text color={labelColor} fontWeight="semibold" mb={1}>
                {name} - {progress}%
              </Text>
              <Progress
                value={Math.min(100, Math.max(0, progress))}
                size="md"
                borderRadius="lg"
                colorScheme={color || 'teal'}
                hasStripe
                isAnimated
                aria-label={`Progress for ${name}: ${progress}%`}
              />
            </Box>
          ))
        )}
      </VStack>
    </Box>
  );
};

export default ProjectProgressBar;
