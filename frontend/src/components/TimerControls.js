// src/components/TimerControls.js
import React, { useMemo } from 'react';
import { Button, Text, Flex, Box, useColorModeValue, Badge } from '@chakra-ui/react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const TimerControls = ({
  timerSeconds = 0,
  isRunning = false,
  onStart,
  onPause,
  onReset,
  isFocusMode = false,
  onToggleFocusMode,
}) => {
  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  // Only recalculate formatted time when timerSeconds changes
  const displayTime = useMemo(() => formatTime(timerSeconds), [timerSeconds]);

  const glassBg = useColorModeValue(
    "linear-gradient(135deg, rgba(255,255,255,0.20) 60%, rgba(68,178,197,0.14) 100%)",
    "linear-gradient(120deg, rgba(44,53,78,0.38) 60%, rgba(68,178,197,0.10) 100%)"
  );
  const borderCol = useColorModeValue("rgba(0,200,255,0.10)", "rgba(20,240,240,0.13)");
  const textColor = useColorModeValue('#181C26', '#EAF6FB');

  return (
    <Box
      bg={glassBg}
      p={7}
      borderRadius="2xl"
      boxShadow="0 12px 40px 0 rgba(13,120,255,0.14)"
      border="1.7px solid"
      borderColor={borderCol}
      backdropFilter="blur(15px)"
      minW={{ base: "100%", md: "340px" }}
      mb={5}
      mx="auto"
      textAlign="center"
      transition="all .24s cubic-bezier(.4,2.5,.35,.9)"
    >
      {isFocusMode && (
        <Badge
          mb={3}
          colorScheme="teal"
          fontWeight="bold"
          fontSize="md"
          letterSpacing="wide"
          px={3}
          py={1}
          borderRadius="full"
          userSelect="none"
          boxShadow="0 0 10px teal"
        >
          Focus Mode
        </Badge>
      )}

      {/* Time Display */}
      <Text
        fontSize={{ base: "4xl", md: "6xl" }}
        fontWeight="extrabold"
        color={textColor}
        fontFamily="monospace"
        letterSpacing="wide"
        mb={5}
        textShadow="0 2px 30px rgba(80,211,255,0.13)"
        userSelect="all"
        aria-live="polite"
      >
        {displayTime}
      </Text>

      {/* Timer Buttons */}
      <Flex justify="center" gap={4} mb={4}>
        <Button
          px={6}
          leftIcon={<Play size={22} />}
          colorScheme="teal"
          variant="solid"
          onClick={onStart}
          isDisabled={isRunning}
          fontWeight="bold"
          borderRadius="xl"
          bgGradient="linear(to-r, teal.300, blue.300)"
          _dark={{ bgGradient: "linear(to-r, teal.400, blue.500)" }}
          _hover={{
            bgGradient: "linear(to-r, #50e4ff, #3399ff)",
            boxShadow: "0 0 8px #50e4ff99"
          }}
          aria-label="Start Timer"
        >
          Start
        </Button>

        <Button
          px={6}
          leftIcon={<Pause size={22} />}
          colorScheme="orange"
          variant="ghost"
          onClick={onPause}
          isDisabled={!isRunning}
          fontWeight="bold"
          borderRadius="xl"
          _hover={{
            bg: "orange.100",
            _dark: { bg: "orange.800" },
            boxShadow: "0 0 8px #fbbf24aa"
          }}
          aria-label="Pause Timer"
        >
          Pause
        </Button>

        <Button
          px={6}
          leftIcon={<RotateCcw size={22} />}
          colorScheme="gray"
          variant="ghost"
          onClick={onReset}
          borderRadius="xl"
          fontWeight="bold"
          _hover={{
            bg: "red.100",
            _dark: { bg: "red.700" },
            boxShadow: "0 0 8px #ff52b299"
          }}
          aria-label="Reset Timer"
        >
          Reset
        </Button>
      </Flex>

      {/* Focus Mode Toggle Button */}
      <Button
        size="sm"
        variant={isFocusMode ? "solid" : "outline"}
        colorScheme="teal"
        onClick={onToggleFocusMode}
        fontWeight="bold"
        borderRadius="xl"
        mx="auto"
        aria-pressed={isFocusMode}
      >
        {isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
      </Button>
    </Box>
  );
};

export default TimerControls;
