// src/components/ColorModeSwitcher.js
import React from 'react';
import {
  IconButton,
  Tooltip,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const ColorModeSwitcher = (props) => {
  const { toggleColorMode } = useColorMode();
  const nextMode = useColorModeValue('dark', 'light');
  const SwitchIcon = useColorModeValue(Moon, Sun);

  // Tooltip colors adjusted to match glassmorphism palette
  const tooltipBg = useColorModeValue('rgba(255,255,255,0.15)', 'rgba(18,18,18,0.85)');
  const tooltipColor = useColorModeValue('#202f42', 'whiteAlpha.900');

  // Framer Motion icon wrapper for smooth rotation animation
  const MotionIcon = motion(SwitchIcon);

  return (
    <Tooltip
      label={`Switch to ${nextMode} mode`}
      openDelay={300}
      hasArrow
      bg={tooltipBg}
      color={tooltipColor}
      fontSize="sm"
      p={2}
      borderRadius="md"
      backdropFilter="blur(10px)"
    >
      <IconButton
        size="md"
        fontSize="lg"
        aria-label={`Switch to ${nextMode} mode`}
        variant="ghost"
        color="current"
        ml={{ base: '0', md: '3' }}
        onClick={toggleColorMode}
        icon={
          <MotionIcon
            key={nextMode}
            initial={{ rotate: 0 }}
            animate={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          />
        }
        {...props}
      />
    </Tooltip>
  );
};

export default ColorModeSwitcher;
