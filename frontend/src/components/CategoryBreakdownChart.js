import React from 'react';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

// Define a list of colors for pie segments
const COLORS = [
  '#38B2AC', // teal
  '#805AD5', // purple
  '#ED8936', // orange
  '#E53E3E', // red
  '#3182CE', // blue
  '#48BB78', // green
];

const CategoryBreakdownChart = ({ data = [] }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const tooltipBg = useColorModeValue('#fff', '#2D3748');
  const tooltipBorder = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={4}
      bg={cardBg}
      borderRadius="lg"
      boxShadow="md"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
    >
      <Text fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
        Category Breakdown
      </Text>

      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: '8px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <Text color={textColor} opacity={0.7}>
          No category data available
        </Text>
      )}
    </Box>
  );
};

export default CategoryBreakdownChart;
