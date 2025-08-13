import React from 'react';
import { Box, Flex, Switch, Text, useColorModeValue } from '@chakra-ui/react';
import { Target } from 'lucide-react';

const FocusModeToggle = ({ isFocusMode, toggleFocusMode }) => {
  const glassBg = useColorModeValue(
    "linear-gradient(120deg, rgba(242,255,255,0.33) 80%, rgba(120,225,255,0.13) 100%)",
    "linear-gradient(105deg, rgba(32,44,90,0.55) 60%, rgba(47,177,230,0.10) 100%)"
  );
  const border = useColorModeValue("rgba(77, 204, 233, 0.16)", "rgba(59,254,255,0.12)");
  const focusActive = useColorModeValue("#14ffe9", "#20e7e7");
  const focusOff = useColorModeValue("gray.500", "gray.400");
  const ring = useColorModeValue("0 0 12px #1cd4ff33", "0 0 16px #14ffe955");

  return (
    <Box
      mb={6}
      mx="auto"
      px={5}
      py={4}
      bg={glassBg}
      borderRadius="xl"
      boxShadow="0 3px 24px #14ffe940"
      border="1.6px solid"
      borderColor={border}
      maxW="440px"
      w="100%"
      backdropFilter="blur(10px)"
      transition="all .22s cubic-bezier(.4,2.5,.35,.9)"
    >
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={2}>
          <Box
            as={Target}
            size={22}
            color={isFocusMode ? focusActive : focusOff}
            boxShadow={isFocusMode ? ring : 'none'}
            transition="all .22s"
          />
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={isFocusMode ? focusActive : focusOff}
            letterSpacing="wide"
            transition="color .22s"
          >
            Focus Mode
          </Text>
        </Flex>
        <Switch
          isChecked={isFocusMode}
          onChange={toggleFocusMode}
          size="lg"
          colorScheme="teal"
          bg={isFocusMode ? "#14ffe950" : "gray.200"}
          _checked={{
            bg: "#20e7e7",
            boxShadow: "0 0 0 3px #14ffe92a"
          }}
          transition="all .19s"
        />
      </Flex>
      <Text
        color={isFocusMode ? focusActive : focusOff}
        mt={2}
        fontSize="sm"
        letterSpacing="wide"
        opacity={.75}
        fontWeight="semi"
        textAlign="center"
        transition="color .22s"
      >
        {isFocusMode ? "Maximize deep work and minimize distractions." : "Start Focus Mode to boost productivity!"}
      </Text>
    </Box>
  );
};

export default FocusModeToggle;
