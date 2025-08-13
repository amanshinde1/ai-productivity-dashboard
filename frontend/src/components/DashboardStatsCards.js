// src/components/DashboardStatsCards.js

import React from 'react';
import { SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Box, useColorModeValue, Flex } from '@chakra-ui/react';
import { TrendingUp, TrendingDown, Briefcase, CheckCircle, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// Mapping for Lucide Icons
const LucideIconMap = {
  Briefcase: Briefcase,
  CheckCircle: CheckCircle,
  Zap: Zap,
};

// Create a motion component from a Chakra UI Box
const MotionCard = motion(Box);

// Reusable component for each stat card
const StatCard = ({ label, value, icon, helpText, trend, specialStyle }) => {
  const glassBg = useColorModeValue(
    "linear-gradient(120deg,rgba(255,255,255,0.22) 80%,rgba(120,255,244,0.08) 100%)",
    "linear-gradient(115deg,rgba(38,45,64,0.43) 75%,rgba(70,220,255,0.07) 100%)"
  );
  const borderCol = useColorModeValue("rgba(76,220,255,0.08)", "rgba(80,240,250,0.10)");
  const cardShadow = useColorModeValue("0 6px 18px 0 rgba(32,204,255,0.10)", "0 6px 20px 0 rgba(74,245,255,0.10)");
  const iconColor = useColorModeValue("teal.400", "teal.200");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const valueColor = useColorModeValue("gray.800", "cyan.400");
  const helpTextColor = useColorModeValue("gray.500", "gray.400");

  const cardProps = {
    p: { base: 4, md: 5 },
    minW: 0,
    bg: specialStyle ? specialStyle.bg : glassBg,
    borderRadius: "xl",
    boxShadow: specialStyle ? specialStyle.boxShadow : cardShadow,
    border: "1.5px solid",
    borderColor: specialStyle ? specialStyle.borderColor : borderCol,
    backdropFilter: "blur(10px)",
    transition: "all .23s cubic-bezier(.4,2.2,.6,1.1)",
    position: 'relative',
    _hover: { transform: "translateY(-4px)" }
  };

  const TrendIcon = trend === 'increase' ? TrendingUp : trend === 'decrease' ? TrendingDown : null;
  const StatIcon = LucideIconMap[icon] || Briefcase;

  return (
    <MotionCard
      {...cardProps}
      whileHover={{ transform: "translateY(-4px)" }}
    >
      <Stat>
        <Flex justifyContent="space-between" alignItems="center" mb={1}>
          <StatLabel
            color={specialStyle ? specialStyle.labelColor : labelColor}
            fontWeight="bold"
            fontSize="sm"
          >
            {label}
          </StatLabel>
          <Box as={StatIcon} size={5} color={specialStyle ? specialStyle.iconColor : iconColor} />
        </Flex>
        <StatNumber
          fontSize={{ base: "2xl", md: "3xl" }}
          fontWeight="extrabold"
          color={specialStyle ? specialStyle.valueColor : valueColor}
          textShadow={specialStyle ? specialStyle.valueShadow : "0 0 8px #22d3eef3"}
          lineHeight={1.1}
        >
          {value}
        </StatNumber>
        {helpText && (
          <StatHelpText
            color={specialStyle ? specialStyle.helpTextColor : helpTextColor}
            mt={0}
            fontSize="xs"
            letterSpacing="wide"
            display="flex"
            alignItems="center"
          >
            {TrendIcon && (
              <Box
                as={TrendIcon}
                size={4}
                color={trend === 'increase' ? 'green.400' : 'red.400'}
                mr={1}
              />
            )}
            {helpText}
          </StatHelpText>
        )}
      </Stat>
    </MotionCard>
  );
};

const DashboardStatsCards = React.memo(({
  workHours = { hours: 0, minutes: 0 },
  workHoursTrend = "neutral",
  percentOfTarget = 0,
  focusPercent = 0,
}) => {
  const cardData = [
    {
      label: "Work Hours",
      value: `${workHours.hours}h ${workHours.minutes}m`,
      icon: "Briefcase",
      trend: workHoursTrend,
      helpText: "This week"
    },
    {
      label: "Focus Percent",
      value: `${focusPercent}%`,
      icon: "Zap",
      helpText: "Productive time"
    },
    {
      label: "Target %",
      value: `${percentOfTarget}%`,
      icon: "CheckCircle",
      helpText: "Progress toward goals",
      specialStyle: {
        bg: useColorModeValue(
          "linear-gradient(135deg, #23ffd9 0%, #18e5f8 100%)",
          "linear-gradient(135deg, #29ffd9 0%, #0ee4fd 100%)"
        ),
        boxShadow: useColorModeValue(
          "0 10px 35px 0 rgba(140,255,255,0.15)",
          "0 10px 35px 0 rgba(80,255,255,0.18)"
        ),
        labelColor: "#1b1c1f",
        valueColor: "#1b1c1f",
        helpTextColor: "#222",
        valueShadow: "0 0 8px #13eefa85",
      },
    }
  ];

  return (
    <SimpleGrid
      columns={{ base: 1, md: 3 }}
      spacing={{ base: 3, md: 5 }}
      mb={6}
      w="100%"
    >
      {cardData.map((data, index) => (
        <StatCard key={index} {...data} />
      ))}
    </SimpleGrid>
  );
});

export default DashboardStatsCards;
