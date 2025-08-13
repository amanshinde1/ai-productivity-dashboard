import React from 'react';
import { Box, Text, Stack, Flex, Badge, useColorModeValue } from '@chakra-ui/react';
import { CalendarDays } from 'lucide-react';

const UpcomingTasksList = ({ tasksDueToday, onEditTask }) => {
  const glassBg = useColorModeValue(
    "linear-gradient(120deg,rgba(255,255,255,0.18) 80%,rgba(120,255,244,0.08) 100%)",
    "linear-gradient(108deg,rgba(30,40,56,0.39) 80%,rgba(70,220,255,0.09) 100%)"
  );
  const borderCol = useColorModeValue("rgba(56,244,255,0.13)", "rgba(69,255,250,0.13)");
  const cardShadow = useColorModeValue("0 4px 22px #22d3ee10", "0 6px 16px #16f7ff24");
  const iconColor = useColorModeValue("purple.500", "purple.200");
  const badgeBg = useColorModeValue("#A78BFAe7", "#8B5CF6ee");
  const textColor = useColorModeValue("#282B3A", "#f3f8fd");

  return (
    <Box
      p={6}
      bg={glassBg}
      borderRadius="2xl"
      boxShadow={cardShadow}
      border="1.5px solid"
      borderColor={borderCol}
      backdropFilter="blur(13px)"
      minW={{ base: "100%", sm: "340px" }}
      maxH="380px"                // <-- max height to constrain height inside grid
      overflowY="auto"           // <-- enable vertical scrolling if content exceeds maxH
      transition="all .21s cubic-bezier(.4,2.2,.6,1.1)"
      h="100%"
    >
      <Text
        fontSize="xl"
        fontWeight={900}
        letterSpacing="wide"
        mb={4}
        color={iconColor}
        textShadow="0 2px 12px #8b5cf622"
      >
        Tasks Due Today
      </Text>
      <Stack spacing={4} >
        {tasksDueToday && tasksDueToday.length > 0 ? (
          tasksDueToday.map((task, idx) => (
            <Flex
              key={idx}
              align="center"
              justify="space-between"
              px={2}
              py={2}
              borderRadius="xl"
              _hover={{
                bg: "rgba(168,139,250,0.13)",
                filter: "blur(0.2px)",
                transform: "scale(1.012)",
                cursor: onEditTask ? "pointer" : "default"
              }}
              transition="background .18s"
              onClick={onEditTask ? () => onEditTask(task) : undefined}
            >
              <Flex align="center" gap={2}>
                <Box as={CalendarDays} size={22} color={iconColor} flexShrink={0} />
                <Text
                  color={textColor}
                  fontWeight="bold"
                  fontSize="md"
                  textDecoration={task.completed ? 'line-through' : undefined}
                  opacity={task.completed ? 0.7 : 1}
                  transition="opacity .15s"
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
                boxShadow="0 0 5px 0 #A78BFA99"
                color="#fff"
                letterSpacing="0.05em"
              >
                {task.due_time ? task.due_time : "Today"}
              </Badge>
            </Flex>
          ))
        ) : (
          <Text color={textColor} opacity={0.7} fontStyle="italic" fontWeight={500}>
            No tasks due today.
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default UpcomingTasksList;
