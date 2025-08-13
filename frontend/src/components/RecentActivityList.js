import React from 'react';
import { Box, Text, Stack, Flex, Badge, useColorModeValue } from '@chakra-ui/react';
import { CheckCircle } from 'lucide-react';

const RecentActivityList = ({ recentTasks }) => {
  const glassBg = useColorModeValue(
    "linear-gradient(120deg, rgba(255,255,255,0.16) 80%, rgba(120,255,244,0.07) 100%)",
    "linear-gradient(108deg, rgba(28,38,58,.38) 80%, rgba(50,220,255, .09) 100%)"
  );
  const borderCol = useColorModeValue("rgba(20, 244, 255, 0.09)", "rgba(67,255,250,0.13)");
  const cardShadow = useColorModeValue("0 4px 22px #21e3da08", "0 6px 15px #1ee7ff14");
  const iconColor = useColorModeValue("green.500", "green.300");
  const badgeBg = useColorModeValue("#38D9A9ee", "#0ea765ee");
  const textColor = useColorModeValue("#172c26", "#e4fffc");

  return (
    <Box
      p={6}
      bg={glassBg}
      borderRadius="2xl"
      boxShadow={cardShadow}
      border="1.5px solid"
      borderColor={borderCol}
      backdropFilter="blur(12px)"
      minW={{ base: "100%", sm: "340px" }}
      transition="all .21s cubic-bezier(.4,2.2,.6,1.1)"
      h="100%"
    >
      <Text
        fontSize="xl"
        fontWeight={900}
        letterSpacing="wide"
        mb={4}
        color={iconColor}
        textShadow="0 2px 11px #38d9a933"
      >
        Recent Activity
      </Text>
      <Stack spacing={4}>
        {recentTasks && recentTasks.length > 0 ? (
          recentTasks.map((task, idx) => (
            <Flex
              key={idx}
              align="center"
              justify="space-between"
              px={2}
              py={2}
              borderRadius="xl"
              _hover={{
                bg: "rgba(56,217,169,0.09)",
                filter: "blur(0.2px)",
                transform: "scale(1.012)"
              }}
              transition="background .18s"
            >
              <Flex align="center" gap={2}>
                <Box as={CheckCircle} size={22} color={iconColor} flexShrink={0} />
                <Text
                  color={textColor}
                  fontWeight="bold"
                  fontSize="md"
                  textDecoration="line-through"
                  opacity={0.9}
                  transition="opacity .14s"
                  noOfLines={1}
                >
                  {task.title}
                </Text>
              </Flex>
              <Badge
                px={3}
                py={1}
                fontSize="sm"
                borderRadius="full"
                bg={badgeBg}
                boxShadow="0 0 5px 0 #38D9A966"
                color="#fff"
                letterSpacing="0.05em"
              >
                {task.completedAt ? `Done at ${task.completedAt}` : "Done"}
              </Badge>
            </Flex>
          ))
        ) : (
          <Text color={textColor} opacity={.7} fontWeight={500} fontStyle="italic">
            No recent activity yet.
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default RecentActivityList;
