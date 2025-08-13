// src/pages/InsightsView.js
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Grid,
  Alert,
  useColorModeValue,
  Spinner,
  Button,
} from '@chakra-ui/react';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { formatDate } from '../utils/dateHelpers';
import AIInsights from '../components/AIInsights';
import { mockSuggestions } from '../constants/aiSuggestions';
import { useTaskContext } from '../context/TaskContext';
import { useAuthContext } from '../context/AuthContext';

const iconOptions = ['Lightbulb', 'TrendingUp', 'TrendingDown', 'CheckCircle', 'Info', 'Clock'];
function getRandomIcon() {
  return iconOptions[Math.floor(Math.random() * iconOptions.length)];
}

const InsightsView = () => {
  const { tasks, loading, fetchTasks, setFilterStatus, setFilterPriority } = useTaskContext();
  const { isGuest } = useAuthContext();

  const headingColor = useColorModeValue('gray.900', 'text.heading');
  const textColor = useColorModeValue('gray.600', 'text.dark');
  const cardHeaderColor = useColorModeValue('gray.800', 'text.light');
  const chartBorderColor = useColorModeValue('white', 'dark.800');

  const [selectedRange, setSelectedRange] = useState('year');
  const [rangeFallbackTried, setRangeFallbackTried] = useState(false);
  const [hasTasksInRange, setHasTasksInRange] = useState(true);

  // Fetch tasks on mount & reset filters
  useEffect(() => {
    if (!isGuest) {
      setFilterStatus('');
      setFilterPriority('');
      fetchTasks();
    }
  }, [isGuest, fetchTasks, setFilterStatus, setFilterPriority]);

  // Calculate date range based on selected range
  const getDateRange = (rangeType) => {
    const now = new Date();
    let startDate;
    const endDate = new Date(now);
    switch (rangeType) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date();
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return { startDate, endDate };
  };

  // Filter tasks within the selected range
  const filteredTasks = useMemo(() => {
    const { startDate, endDate } = getDateRange(selectedRange);
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    return safeTasks.filter(task => {
      const due = task.due_date ? new Date(task.due_date) : null;
      return due && due >= startDate && due <= endDate;
    });
  }, [tasks, selectedRange]);

  // Update hasTasksInRange state side-effect outside of useMemo to avoid warnings
  useEffect(() => {
    setHasTasksInRange(filteredTasks.length > 0);
  }, [filteredTasks]);

  // Auto fallback for empty ranges except year
  useEffect(() => {
    if (!rangeFallbackTried && !hasTasksInRange && selectedRange !== 'year') {
      setRangeFallbackTried(true);
      setSelectedRange('year');
    }
  }, [hasTasksInRange, selectedRange, rangeFallbackTried]);

  // Prepare chart datasets based on filteredTasks and selectedRange
  const chartData = useMemo(() => {
    const { startDate, endDate } = getDateRange(selectedRange);

    const completedTasks = filteredTasks.filter(t => t.status === 'DONE');
    const pendingTasks = filteredTasks.filter(t => t.status === 'PENDING');

    let completionLabels = [];
    let dailyCompletedCounts = {}, dailyTotalCounts = {};

    if (selectedRange === 'week') {
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const fmt = formatDate(d);
        completionLabels.push(d.toLocaleString('en-US', { weekday: 'short', day: 'numeric' }));
        dailyCompletedCounts[fmt] = 0;
        dailyTotalCounts[fmt] = 0;
      }
      filteredTasks.forEach(task => {
        const tDate = task.due_date ? formatDate(new Date(task.due_date)) : null;
        if (tDate && dailyTotalCounts.hasOwnProperty(tDate)) {
          dailyTotalCounts[tDate]++;
          if (task.status === 'DONE') dailyCompletedCounts[tDate]++;
        }
      });
    } else if (selectedRange === 'month') {
      const weeksInMonth = [];
      let currentWeek = new Date(startDate);
      while (currentWeek <= endDate) {
        const weekEnd = new Date(currentWeek);
        weekEnd.setDate(currentWeek.getDate() + 6);
        weeksInMonth.push({ start: new Date(currentWeek), end: weekEnd > endDate ? endDate : weekEnd });
        currentWeek.setDate(currentWeek.getDate() + 7);
      }
      completionLabels = weeksInMonth.map((_, idx) => `Week ${idx + 1}`);
      dailyCompletedCounts = Array(weeksInMonth.length).fill(0);
      dailyTotalCounts = Array(weeksInMonth.length).fill(0);
      filteredTasks.forEach(task => {
        const due = new Date(task.due_date);
        weeksInMonth.forEach((week, idx) => {
          if (due >= week.start && due <= week.end) {
            dailyTotalCounts[idx]++;
            if (task.status === 'DONE') dailyCompletedCounts[idx]++;
          }
        });
      });
    } else if (selectedRange === 'year') {
      for (let i = 0; i < 12; i++) {
        const d = new Date(startDate.getFullYear(), i, 1);
        completionLabels.push(d.toLocaleString('en-US', { month: 'short', year: 'numeric' }));
        dailyCompletedCounts[i] = 0;
        dailyTotalCounts[i] = 0;
      }
      filteredTasks.forEach(task => {
        const mIdx = new Date(task.due_date).getMonth();
        dailyTotalCounts[mIdx]++;
        if (task.status === 'DONE') dailyCompletedCounts[mIdx]++;
      });
    }

    const priorityBase = { High: 0, Medium: 0, Low: 0 };
    filteredTasks.forEach(task => {
      if (task.priority === 1) priorityBase.High++;
      else if (task.priority === 2) priorityBase.Medium++;
      else priorityBase.Low++;
    });

    const statusCounts = { PENDING: pendingTasks.length, DONE: completedTasks.length };

    return {
      completion: {
        labels: completionLabels,
        datasets: [
          {
            label: 'Completed',
            data: Object.values(dailyCompletedCounts),
            borderColor: '#48BB78',
            backgroundColor: 'rgba(72,187,120,0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Total',
            data: Object.values(dailyTotalCounts),
            borderColor: '#6A569C',
            backgroundColor: 'rgba(106,86,156,0.2)',
            fill: true,
            tension: 0.4
          }
        ],
      },
      priority: {
        labels: Object.keys(priorityBase),
        datasets: [{
          data: Object.values(priorityBase),
          backgroundColor: ['#FC8181', '#F6AD55', '#4299E1'],
          borderColor: chartBorderColor,
          borderWidth: 2
        }]
      },
      status: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#8E77B8', '#48BB78'],
          borderColor: chartBorderColor,
          borderWidth: 2
        }]
      }
    };
  }, [filteredTasks, chartBorderColor, selectedRange]);

  // Prepare generic tips with icons, memoized so icons persist per render
  const guestInsightsData = useMemo(() =>
    mockSuggestions.map(tip => ({ icon: getRandomIcon(), text: tip })),
    []
  );

  if (loading) {
    return <Flex justify="center" align="center" minH="200px"><Spinner size="xl" /></Flex>;
  }

  return (
    <Box>
      {/* Header with range selection */}
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
        <Heading size="lg" color={headingColor}>Insights</Heading>
        {!isGuest && (
          <HStack>
            {['week', 'month', 'year'].map(range => (
              <Button
                key={range}
                size="sm"
                variant={selectedRange === range ? 'solid' : 'outline'}
                colorScheme={selectedRange === range ? 'purple' : 'gray'}
                aria-pressed={selectedRange === range}
                onClick={() => { setRangeFallbackTried(false); setSelectedRange(range); }}
              >
                {range === 'week' ? 'This Week' : range === 'month' ? 'Last Month' : 'Last Year'}
              </Button>
            ))}
          </HStack>
        )}
      </Flex>

      {isGuest ? (
        <>
          <Alert status="info" mb={4}><Text>You are in guest mode. Here are some generic productivity tips:</Text></Alert>
          <AIInsights insights={guestInsightsData} />
        </>
      ) : hasTasksInRange ? (
        <VStack spacing={8} align="stretch">
          <Card>
            <CardHeader>
              <Heading size="md" color={cardHeaderColor}>Productivity Trends</Heading>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <Line
                  data={chartData.completion}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top', labels: { color: textColor } } },
                    scales: {
                      x: {
                        ticks: { color: textColor },
                        grid: { color: 'transparent' }
                      },
                      y: {
                        ticks: { color: textColor },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                      }
                    }
                  }}
                />
              </Box>
            </CardBody>
          </Card>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={6}>
            <Card>
              <CardHeader><Heading size="md" color={cardHeaderColor}>Task Priority Breakdown</Heading></CardHeader>
              <CardBody>
                <Box height="250px">
                  <Pie
                    data={chartData.priority}
                    options={{
                      responsive: true,
                      plugins: { legend: { position: 'right', labels: { color: textColor } } }
                    }}
                  />
                </Box>
              </CardBody>
            </Card>
            <Card>
              <CardHeader><Heading size="md" color={cardHeaderColor}>Task Status Overview</Heading></CardHeader>
              <CardBody>
                <Box height="250px">
                  <Bar
                    data={chartData.status}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false }, ticks: { color: textColor }},
                        y: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: textColor }}
                      }
                    }}
                  />
                </Box>
              </CardBody>
            </Card>
          </Grid>
        </VStack>
      ) : (
        <Alert status="info" mb={4}><Text>No tasks found in the selected date range.</Text></Alert>
      )}
    </Box>
  );
};

export default InsightsView;
