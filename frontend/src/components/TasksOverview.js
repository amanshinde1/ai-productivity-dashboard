// src/components/TasksOverview.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, useColorModeValue } from '@chakra-ui/react';

const TasksOverview = ({ categoryBreakdown = { labels: [], datasets: [] } }) => {
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.12)', 'rgba(20, 20, 31, 0.35)');
  const glassShadow = useColorModeValue('0 0 40px rgba(70,220,255,.25)', '0 0 40px rgba(70,220,255,.25)');
  const glassBorder = useColorModeValue('1px solid rgba(255, 255, 255, 0.18)', '1px solid rgba(255, 255, 255, 0.18)');
  const textColor = useColorModeValue('#1a202c', '#e2e8f0');

  if (!categoryBreakdown || categoryBreakdown.labels.length === 0) return (
    <Box
      bg={glassBg}
      p={6}
      borderRadius="lg"
      boxShadow={glassShadow}
      border={glassBorder}
      height="300px"
      width="100%"
      maxWidth="400px"
      mx="auto"
      backdropFilter="blur(12.5px)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color={textColor}
      fontWeight="semibold"
    >
      No tasks found in any category.
    </Box>
  );

  const chartData = {
    labels: categoryBreakdown.labels,
    datasets: categoryBreakdown.datasets.map((dataset) => ({
      ...dataset,
      stack: 'stack1',
      borderWidth: 0,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: textColor,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: textColor },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { color: textColor },
      },
    },
  };

  return (
    <Box
      bg={glassBg}
      p={6}
      borderRadius="lg"
      boxShadow={glassShadow}
      border={glassBorder}
      height="300px"
      width="100%"
      maxWidth="400px"
      mx="auto"
      backdropFilter="blur(12.5px)"
    >
      <Bar data={chartData} options={options} />
    </Box>
  );
};

export default TasksOverview;
