//src/components/AIInsights.js
import React from 'react';
import { Box, Stack, Text, Flex, useColorModeValue } from '@chakra-ui/react';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Info,
  Clock,
  Zap,
  Brain,
  Play,
  AlertTriangle,
} from 'lucide-react';

// Mapping icon names to lucide-react icons
const iconMap = {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Info,
  Clock,
  Zap,
  Brain,
  Play,
  AlertTriangle,
};

const AIInsights = ({ insights }) => {
  const glassBg = useColorModeValue(
    "linear-gradient(120deg,rgba(255,255,255,0.20) 80%,rgba(120,255,244,0.08) 100%)",
    "linear-gradient(108deg,rgba(32,40,56,0.39) 80%,rgba(70,220,255,0.13) 100%)"
  );
  const borderCol = useColorModeValue("rgba(35,214,255,0.18)", "rgba(69,255,250,0.11)");
  const cardShadow = useColorModeValue("0 4px 24px #26ffe924", "0 6px 18px #0bd6ff23");
  const labelColor = useColorModeValue("cyan.600", "cyan.300");
  const iconGlow = useColorModeValue("0 0 8px #90e7ff88", "0 0 12px #50fbe380");
  const textColor = useColorModeValue("#222D3A", "#E2FEFF");

  return (
    <Box
      p={6}
      bg={glassBg}
      borderRadius="2xl"
      boxShadow={cardShadow}
      border="1.7px solid"
      borderColor={borderCol}
      backdropFilter="blur(14px)"
      minW={{ base: "100%", sm: "340px" }}
      transition="all .22s cubic-bezier(.4,2.2,.6,1.1)"
      h="100%"
    >
      <Text
        fontSize="xl"
        fontWeight={900}
        letterSpacing="wide"
        mb={4}
        color={labelColor}
        textShadow="0 1px 8px #52f7ea1a"
      >
        AI Insights
      </Text>
      <Stack spacing={3}>
        {insights && insights.length > 0 ? (
          insights.map((insight, idx) => {
            // Determine display text: support string or object with message or text
            const text = typeof insight === 'string'
              ? insight
              : insight.text || insight.message || 'No detail';

            // Determine icon: default Lightbulb if not present
            const iconKey = insight.icon || 'Lightbulb';
            const IconComponent = iconMap[iconKey] || Lightbulb;

            return (
              <Flex key={idx} align="center" gap={3}>
                <Box
                  as={IconComponent}
                  color={labelColor}
                  boxSize={7}
                  mr={1}
                  style={{ filter: `drop-shadow(${iconGlow})` }}
                  aria-label={iconKey}
                />
                <Text color={textColor} fontSize="md" lineHeight="1.3" fontWeight={600}>
                  {text}
                </Text>
              </Flex>
            );
          })
        ) : (
          <Text color={textColor} opacity={0.65} fontStyle="italic">
            No insights available for today.
          </Text>
        )}
      </Stack>
    </Box>
  );
};

export default AIInsights;
