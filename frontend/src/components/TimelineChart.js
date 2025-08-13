import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Box } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TimelineChart = () => {
  const data = {
    labels: [
      "6 am", "7 am", "8 am", "9 am", "10 am", "11 am", "12 pm",
      "1 pm", "2 pm", "3 pm", "4 pm", "5 pm", "6 pm"
    ],
    datasets: [
      {
        label: 'Work',
        data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        backgroundColor: "#3acef2",
        borderRadius: 4,
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: 'Meeting',
        data: [0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        backgroundColor: "#3b82f6",
        borderRadius: 4,
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: 'Break',
        data: [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
        backgroundColor: "#2ee38e",
        borderRadius: 4,
        barPercentage: 1,
        categoryPercentage: 1,
      },
      {
        label: 'Idle',
        data: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        backgroundColor: "rgba(255,255,255,0.12)",
        borderRadius: 4,
        barPercentage: 1,
        categoryPercentage: 1,
      }
    ]
  };

  const options = {
    indexAxis: 'x', // Horizontal bars!
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#b6eaff' } },
      tooltip: {
        enabled: true,
        callbacks: {
          label: ctx => `${ctx.dataset.label}: ${ctx.raw ? ctx.raw : ''}`,
        }
      },
      title: { display: false },
    },
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        display: true,
        grid: { color: "rgba(50,200,255,0.04)" },
        ticks: { color: "#9abfdc", font: { weight: "bold" } }
      },
      y: {
        stacked: true,
        display: false,
      }
    }
  };

  return (
    <Box
      minH="200px"
      w="100%"
      maxW="1020px"
      mx="auto"
      bg="rgba(28,30,36,0.96)"
      borderRadius="2xl"
      boxShadow="0 6px 32px rgba(31,38,135,0.16)"
      p={6}
    >
      <Bar data={data} options={options} height={200} />
    </Box>
  );
};

export default TimelineChart;
