import React from 'react';
import { Box, Text, Stack, Flex, useColorModeValue } from '@chakra-ui/react';
import { History } from 'lucide-react';


const RecentActivity = ({ activities }) => {
  const borderCol = useColorModeValue("rgba(0,255,255,0.10)", "rgba(14,240,255,0.14)");
  const glassBg = useColorModeValue(
    "linear-gradient(120deg,rgba(255,255,255,0.22) 80%,rgba(120,255,244,0.08) 100%)",
    "linear-gradient(108deg,rgba(32,40,56,0.45) 80%,rgba(70,220,255,0.11) 100%)"
  );
  const cardShadow = useColorModeValue("0 4px 18px #22d3ee19", "0 6px 16px #16f7ff44");
  const textColor = useColorModeValue("#143241", "#c3f9fd");
  const timeColor = useColorModeValue("gray.600", "gray.400");

  if (!activities || activities.length === 0) {
    return (
      <Box
        p={6}
        bg={glassBg}
        borderRadius="2xl"
        border="1.5px solid"
        borderColor={borderCol}
        boxShadow={cardShadow}
        backdropFilter="blur(14px)"
        minW={{ base: "90%", sm: "300px" }}
        maxW="340px"
        maxH="380px"
        display="flex"
        flexDirection="column"
        ml={{ base: 0, md: "8px" }}
        transition="all .23s cubic-bezier(.4,1.9,.5,1.02)"
        justifyContent="center"
        textAlign="center"
      >
        <Text color={textColor} fontStyle="italic" fontWeight={500}>
          No recent activities.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      bg={glassBg}
      borderRadius="2xl"
      border="1.5px solid"
      borderColor={borderCol}
      boxShadow={cardShadow}
      backdropFilter="blur(14px)"
      minW={{ base: "90%", sm: "300px" }}
      maxW="340px"
      maxH="380px"
      display="flex"
      flexDirection="column"
      ml={{ base: 0, md: "8px" }}
      transition="all .23s cubic-bezier(.4,1.9,.5,1.02)"
    >
      <Text fontWeight="900" fontSize="xl" mb={4} color={textColor}>
        Recent Activity
      </Text>
      <Stack spacing={3} flex="1" overflowY="auto">
        {activities.map(({ id, activity, time }) => (
          <Flex key={id} align="center" gap={3}>
            <Box as={History} boxSize={5} color="gray.500" />
            <Box>
              <Text color={textColor} fontWeight="semibold">
                {activity}
              </Text>
              <Text fontSize="sm" color={timeColor}>
                {time}
              </Text>
            </Box>
          </Flex>
        ))}
      </Stack>
    </Box>
  );
};

export default RecentActivity;
