import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

const WorkHoursChart = ({ data = [] }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const gridColor = useColorModeValue('#e2e8f0', '#4A5568');
  const tooltipBg = useColorModeValue('#fff', '#2D3748');
  const tooltipBorderColor = gridColor;
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={4}
      bg={cardBg}
      borderRadius="lg"
      boxShadow="md"
      border="1px solid"
      borderColor={borderColor}
    >
      <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
        Work Hours (This Week)
      </Text>

      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
            <XAxis dataKey="day" stroke={textColor} />
            <YAxis stroke={textColor} />
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: '1px solid',
                borderColor: tooltipBorderColor,
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="hours" fill="#38B2AC" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <Text color={textColor} opacity={0.7}>
          No work hours data available
        </Text>
      )}
    </Box>
  );
};

export default WorkHoursChart;
