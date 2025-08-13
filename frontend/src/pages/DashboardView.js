// src/pages/DashboardView.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Text, Heading, Button, VStack, HStack, Icon, useColorModeValue,
  Center, SimpleGrid, Spinner, useToast, useDisclosure,
  Table, Thead, Tbody, Tr, Th, Td, Tag, Badge, TableContainer,
  Checkbox, Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow,
  PopoverCloseButton, Skeleton, SkeletonText, useBreakpointValue,
} from '@chakra-ui/react';
import {
  Zap, ClipboardList, ChevronUp, ChevronDown, Settings, Frown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

// DnD-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useAuthContext } from '../context/AuthContext';
import { apiClient } from '../services/api';
import useAISuggestion from "../hooks/useAISuggestion";

import TimerControls from '../components/TimerControls';
import DashboardStatsCards from '../components/DashboardStatsCards';
import AIInsights from '../components/AIInsights';
import AddTaskModal from '../components/AddTaskModal';
import TaskStatusBarChart from '../components/TaskStatusBarChart';
import ProjectProgressBar from '../components/ProjectProgressBar';
import TasksOverview from '../components/TasksOverview';

/* ===========================
   Mock data (used as fallback)
   =========================== */
const MOCK_AI_INSIGHTS = [
  { id: 'insight-1', type: 'info', message: 'You completed 3 tasks today! Great job staying on track.' },
  { id: 'insight-2', type: 'warning', message: 'You have a high-priority task due today. Time to get it done!' },
  { id: 'insight-3', type: 'info', message: 'Your productivity increased by 15% this week. Keep up the good work!' },
];

const MOCK_DASHBOARD_DATA = {
  stats: {
    totalTasks: 45,
    tasksCompleted: 30,
    tasksOverdue: 5,
    upcomingDeadlines: 10,
  },
  taskBreakdown: {
    labels: ['Completed', 'In Progress', 'Overdue'],
    datasets: [{
      data: [30, 10, 5],
      backgroundColor: ['#48bb78', '#ecc94b', '#f56565'],
      borderWidth: 0,
    }],
  },
  categoryBreakdown: {
    labels: ['Work', 'Personal', 'Shopping', 'Health'],
    datasets: [{
      data: [15, 10, 5, 5],
      backgroundColor: ['#4299e1', '#805ad5', '#dd6b20', '#38a169'],
      borderWidth: 0,
    }],
  },
  topProjects: [
    { id: '1', name: 'Project Alpha', progress: 85, color: 'blue' },
    { id: '2', name: 'Project Beta', progress: 50, color: 'purple' },
    { id: '3', name: 'Project Gamma', progress: 20, color: 'orange' },
  ],
  workHours: { hours: 3, minutes: 30 },
  workHoursTrend: "increase",
  percentOfTarget: 75,
  focusPercent: 50,
  productiveApps: [{ name: "VS Code", minutes: 90 }, { name: "Browser", minutes: 60 }],
  tasksDueToday: [{ title: "Start new project" }],
  recentTasks: [{ title: "Reviewed PR", completedAt: "10:00 AM" }],
  tasks: [
    { id: '101', title: 'Finish report', description: 'Complete the quarterly report for Q3.', status: 'In Progress', dueDate: '2025-08-10', priority: 'High', category: 'Work' },
    { id: '102', title: 'Email client', description: 'Send follow-up email to the new client.', status: 'Completed', dueDate: '2025-08-07', priority: 'High', category: 'Work' },
    { id: '103', title: 'Plan team meeting', description: 'Prepare agenda for the weekly team sync.', status: 'Overdue', dueDate: '2025-08-05', priority: 'Medium', category: 'Work' },
    { id: '104', title: 'Grocery shopping', description: 'Buy milk, eggs, bread, and fruits.', status: 'In Progress', dueDate: '2025-08-11', priority: 'Low', category: 'Shopping' },
  ],
  aiInsights: MOCK_AI_INSIGHTS,
};

/* ===========================
   Local storage helper
   =========================== */
const getLocalStorageValue = (key, defaultValue) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error(`Failed to parse localStorage key "${key}":`, e);
    return defaultValue;
  }
};

/* ===========================
   Empty / Error / Skeleton UI
   =========================== */
const DashboardEmptyState = ({ onOpenAddTask }) => {
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const cardShadow = useColorModeValue('md', 'lg');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const animationVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <Center minH="calc(100vh - 200px)" p={8}>
      <VStack spacing={6} p={10} bg={cardBgColor} borderRadius="lg" boxShadow={cardShadow} maxW="lg" textAlign="center">
        <Icon as={ClipboardList} boxSize={16} color="teal.500" />
        <Heading size="lg" color={textColor}>Your Dashboard is Ready!</Heading>
        <motion.div initial="initial" animate="animate" variants={animationVariants} transition={{ duration: 0.5 }}>
          <Text fontSize="md" color={textColor}>
            This is where your tasks, stats, and insights will appear.
          </Text>
          <Text fontSize="md" color={textColor}>
            Once you add your first task, you'll start to see your progress here.
          </Text>
        </motion.div>
        <Button
          colorScheme="teal"
          size="lg"
          onClick={onOpenAddTask}
          _hover={{ bg: 'teal.500', boxShadow: '0 0 12px #14b8a6' }}
          boxShadow="lg"
          fontWeight="bold"
          mt={4}
          aria-label="Add my first task"
          role="button"
        >
          + Add My First Task
        </Button>
      </VStack>
    </Center>
  );
};

const DashboardErrorState = ({ message, onRetry }) => {
  const cardBgColor = useColorModeValue('white', 'gray.700');
  const cardShadow = useColorModeValue('md', 'lg');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  return (
    <Center minH="calc(100vh - 200px)" p={8}>
      <VStack spacing={6} p={10} bg={cardBgColor} borderRadius="lg" boxShadow={cardShadow} maxW="lg" textAlign="center">
        <Icon as={Frown} boxSize={16} color="red.500" />
        <Heading size="lg" color={textColor}>Oops, something went wrong!</Heading>
        <Text fontSize="md" color={textColor}>
          {message}
        </Text>
        <Button
          colorScheme="red"
          size="lg"
          onClick={onRetry}
          _hover={{ bg: 'red.500', boxShadow: '0 0 12px #e53e3e' }}
          boxShadow="lg"
          fontWeight="bold"
          mt={4}
          aria-label="Retry loading data"
        >
          Retry
        </Button>
      </VStack>
    </Center>
  );
};

const DashboardStatsCardsSkeleton = () => (
  <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} h="120px" borderRadius="lg" />
    ))}
  </SimpleGrid>
);

const DashboardSectionSkeleton = () => (
  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
    {[...Array(3)].map((_, i) => (
      <Box key={i} p={6} h="300px">
        <Skeleton h="100%" borderRadius="lg" />
      </Box>
    ))}
  </SimpleGrid>
);

const TaskListSkeleton = () => (
  <Box p={6}>
    <SkeletonText mt="4" noOfLines={5} spacing="4" />
  </Box>
);

/* ===========================
   Task row + TaskList
   =========================== */
const SortableTaskRow = ({ task, index, focusedIndex, onEditTask, visibleColumns }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.9 : 1,
    boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.08)' : undefined,
    borderLeft: isDragging ? '4px solid rgba(14,165,233,0.6)' : undefined,
  };

  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const focusBg = useColorModeValue('teal.100', 'teal.600');
  const isFocused = focusedIndex === index;

  const getPriorityColor = (priority) => {
    switch (String(priority || '').toLowerCase()) {
      case 'high':
        return 'red';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getCategoryColor = (category) => {
    switch (String(category || '').toLowerCase()) {
      case 'work':
        return 'blue';
      case 'personal':
        return 'purple';
      case 'shopping':
        return 'orange';
      case 'health':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusColor = (status) => {
    switch (String(status || '').toLowerCase()) {
      case 'completed':
        return 'green';
      case 'in progress':
        return 'blue';
      case 'overdue':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      console.error("Failed to format date:", e);
      return dateString;
    }
  };

  return (
    <Tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEditTask(task)}
      _hover={{ cursor: 'pointer', bg: hoverBg }}
      _focus={{ outline: 'none', bg: focusBg }}
      tabIndex={isFocused ? 0 : -1}
      data-index={index}
      data-id={task.id}
    >
      {visibleColumns.title && (
        <Td>
          <Text color="teal.500" fontWeight="medium">{task.title}</Text>
        </Td>
      )}
      {visibleColumns.category && (
        <Td>
          <Tag size="sm" colorScheme={getCategoryColor(task.category)}>{task.category}</Tag>
        </Td>
      )}
      {visibleColumns.priority && (
        <Td>
          <Badge colorScheme={getPriorityColor(task.priority)}>{task.priority}</Badge>
        </Td>
      )}
      {visibleColumns.status && (
        <Td>
          <Badge colorScheme={getStatusColor(task.status)}>{task.status}</Badge>
        </Td>
      )}
      {visibleColumns.dueDate && (
        <Td>
          <Text>{formatDate(task.dueDate)}</Text>
        </Td>
      )}
    </Tr>
  );
};

const TaskList = React.memo(({ tasks: initialTasks, onEditTask }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const tableRef = useRef(null);
  const [tasks, setTasks] = useState(initialTasks);

  // breakpoint aware default column visibility
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [visibleColumns, setVisibleColumns] = useState({
    title: true,
    category: true,
    priority: !isMobile,
    status: !isMobile,
    dueDate: !isMobile,
  });

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const allColumns = [
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'dueDate', label: 'Due Date' },
  ];

  const handleColumnToggle = useCallback((columnKey) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: !prev[columnKey] }));
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!active || !over) return;
    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const sortedTasks = useMemo(() => {
    let sortableItems = [...tasks];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'dueDate') {
          aValue = aValue ? new Date(aValue).getTime() : 0;
          bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [tasks, sortConfig]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => {
      let direction = 'ascending';
      if (prev.key === key && prev.direction === 'ascending') direction = 'descending';
      return { key, direction };
    });
  }, []);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <Icon as={ChevronUp} ml={1} boxSize={4} /> : <Icon as={ChevronDown} ml={1} boxSize={4} />;
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => (prev < sortedTasks.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && focusedIndex !== -1) {
      e.preventDefault();
      const taskToOpen = sortedTasks[focusedIndex];
      onEditTask(taskToOpen);
    }
  }, [focusedIndex, sortedTasks, onEditTask]);

  useEffect(() => {
    if (focusedIndex !== -1 && tableRef.current) {
      const rows = tableRef.current.querySelectorAll('[data-index]');
      if (rows[focusedIndex]) rows[focusedIndex].focus();
    }
  }, [focusedIndex]);

  if (!tasks || tasks.length === 0) {
    return (
      <Center p={6}>
        <Text>No tasks to display.</Text>
      </Center>
    );
  }

  return (
    <Box>
      <HStack justifyContent="flex-end" mb={4}>
        <Popover>
          <PopoverTrigger>
            <Button
              size="sm"
              leftIcon={<Icon as={Settings} />}
              colorScheme="gray"
              variant="outline"
              aria-label="Toggle column visibility"
            >
              Columns
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>Visible Columns</PopoverHeader>
            <PopoverBody>
              <VStack align="stretch" spacing={2}>
                {allColumns.map(column =>
                  <Checkbox
                    key={column.key}
                    isChecked={visibleColumns[column.key]}
                    onChange={() => handleColumnToggle(column.key)}
                    size="sm"
                  >
                    {column.label}
                  </Checkbox>
                )}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>

      <TableContainer
        overflowX="auto"
        ref={tableRef}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        outline="none"
        _focus={{ boxShadow: 'outline' }}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Table variant="simple" size="sm" role="table" aria-label="Task List">
            <Thead>
              <Tr>
                {allColumns.map(col =>
                  visibleColumns[col.key] && (
                    <Th key={col.key} onClick={() => handleSort(col.key)} cursor="pointer" whiteSpace="nowrap">
                      <HStack>
                        <Text>{col.label}</Text>
                        {getSortIcon(col.key)}
                      </HStack>
                    </Th>
                  )
                )}
              </Tr>
            </Thead>

            <Tbody>
              <SortableContext items={sortedTasks.map(t => t.id)}>
                {sortedTasks.map((task, index) => (
                  <SortableTaskRow
                    key={task.id}
                    task={task}
                    index={index}
                    focusedIndex={focusedIndex}
                    onEditTask={onEditTask}
                    visibleColumns={visibleColumns}
                  />
                ))}
              </SortableContext>
            </Tbody>
          </Table>
        </DndContext>
      </TableContainer>
    </Box>
  );
});

/* ===========================
   Main DashboardView
   =========================== */
const DashboardView = () => {
  const { isAuthenticated, isGuest, currentProfileUsername } = useAuthContext();
  const toast = useToast();
  const { loading: aiLoading, data: aiData, fetchSuggestion } = useAISuggestion();

  const isMock = process.env.REACT_APP_USE_MOCK === "true" || isGuest;

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);

  const timerRef = useRef(null);
  const FOCUS_SESSION_DURATION = 1500;

  const [timerSeconds, setTimerSeconds] = useState(getLocalStorageValue('timerSeconds', 0));
  const [isTimerRunning, setIsTimerRunning] = useState(getLocalStorageValue('isTimerRunning', false));
  const [isFocusMode, setIsFocusMode] = useState(getLocalStorageValue('isFocusMode', false));
  const [focusCountdown, setFocusCountdown] = useState(getLocalStorageValue('focusCountdown', FOCUS_SESSION_DURATION));

  const cardBgColor = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const cardShadow = useColorModeValue('md', 'lg');
  const mainBg = useColorModeValue('rgba(255, 255, 255, 0.12)', 'rgba(18, 18, 18, 0.8)');
  const glassShadow = '0 0 40px rgba(70,220,255,.25)';
  const glassBorder = '1px solid rgba(255, 255, 255, 0.18)';

  /* ---------------------------
     Category breakdown helper
     --------------------------- */
  const createCategoryBreakdown = useCallback((tasksList) => {
    if (!tasksList || !Array.isArray(tasksList) || tasksList.length === 0) {
      return { labels: [], datasets: [{ data: [], backgroundColor: [] }] };
    }

    const categoryCounts = tasksList.reduce((acc, task) => {
      if (task.category) acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(categoryCounts);
    const data = Object.values(categoryCounts);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#4299e1', '#805ad5', '#dd6b20', '#38a169', '#319795'],
        borderWidth: 0,
      }],
    };
  }, []);

  /* ---------------------------
     AI normalization helper
     --------------------------- */
  const normalizeAIResponse = useCallback((response) => {
    if (!response) return [];
    const arr = Array.isArray(response) ? response : [response];

    return arr.map((tip) => {
      // If tip is a string, make a simple object
      if (typeof tip === 'string') {
        return {
          id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'info',
          text: tip,
          message: tip,
          icon: 'Zap',
          raw: tip,
        };
      }

      // tip is an object — normalize common fields
      const id = tip.id || `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const type = tip.type || tip.level || 'info';
      const text = tip.text || tip.message || tip.summary || (typeof tip === 'string' ? tip : '');
      const message = tip.message || tip.text || text;
      const icon = tip.icon || (type === 'warning' ? 'Frown' : 'Zap'); // not required by child but included for compatibility

      return { id, type, text, message, icon, raw: tip };
    });
  }, []);

  /* ---------------------------
     Centralized data fetch w/ normalization
     --------------------------- */
  const getDashboardData = useCallback(async () => {
    if (isMock) {
      return MOCK_DASHBOARD_DATA;
    }

    try {
      const [metricsResponse, tasksResponse] = await Promise.all([
        apiClient.get('/dashboard-metrics/'),
        apiClient.get('/tasks/')
      ]);

      // Normalize tasks
      const fetchedTasks = Array.isArray(tasksResponse.data)
        ? tasksResponse.data.map(task => ({
            id: task.id || `task-${Math.random()}`,
            title: task.title || 'Untitled Task',
            description: task.description || '',
            status: task.status || 'In Progress',
            dueDate: task.dueDate || null,
            priority: task.priority || 'Medium',
            category: task.category || 'General',
          }))
        : [];

      const metrics = metricsResponse?.data || {};

      const fetchedMetrics = {
        stats: metrics.stats || { totalTasks: 0, tasksCompleted: 0, tasksOverdue: 0, upcomingDeadlines: 0 },
        topProjects: metrics.topProjects || [],
        workHours: metrics.workHours || { hours: 0, minutes: 0 },
        workHoursTrend: metrics.workHoursTrend || "neutral",
        percentOfTarget: metrics.percentOfTarget || 0,
        focusPercent: metrics.focusPercent || 0,
        aiInsights: normalizeAIResponse(metrics.aiInsights || metrics.ai_insights || []),
      };

      return {
        ...fetchedMetrics,
        tasks: fetchedTasks
      };
    } catch (err) {
      const status = err?.response?.status;
      console.warn('Dashboard API error', err?.message || err, 'status:', status);
      if (status === 404) {
        toast({
          title: "Using local demo data",
          description: "Dashboard API not available — showing demo/mock data.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
        return MOCK_DASHBOARD_DATA;
      }

      setError("Failed to load dashboard data. Please try again.");
      toast({
        title: "Dashboard load failed.",
        description: "We couldn't retrieve your data. Please retry.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
  }, [isMock, toast, normalizeAIResponse]);

  /* ---------------------------
     Load logic
     --------------------------- */
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await getDashboardData();
    if (data) {
      setDashboardData(data);
      // normalize again defensively and set local state for AI insights
      setAiInsights(normalizeAIResponse(data.aiInsights || []));
    }
    setLoading(false);
  }, [getDashboardData, normalizeAIResponse]);

  useEffect(() => {
    if (isAuthenticated || isGuest) loadDashboardData();
  }, [loadDashboardData, isAuthenticated, isGuest]);

  /* ---------------------------
     Timer + other effects
     --------------------------- */
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        if (isFocusMode) {
          setFocusCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsTimerRunning(false);
              toast({
                title: "Focus Session Complete!",
                description: "Great job! Time for a short break.",
                status: "success",
                duration: 5000,
                isClosable: true,
              });
              return 0;
            }
            return prev - 1;
          });
        } else {
          setTimerSeconds(prev => prev + 1);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isFocusMode, toast]);

  useEffect(() => {
    localStorage.setItem('timerSeconds', JSON.stringify(timerSeconds));
  }, [timerSeconds]);

  useEffect(() => {
    localStorage.setItem('isTimerRunning', JSON.stringify(isTimerRunning));
    if (isTimerRunning && !isFocusMode) {
      const savedTimerSeconds = getLocalStorageValue('timerSeconds', 0);
      setTimerSeconds(savedTimerSeconds);
    } else if (isTimerRunning && isFocusMode) {
      const savedFocusCountdown = getLocalStorageValue('focusCountdown', FOCUS_SESSION_DURATION);
      setFocusCountdown(savedFocusCountdown);
    }
  }, [isTimerRunning, isFocusMode, FOCUS_SESSION_DURATION]);

  useEffect(() => {
    localStorage.setItem('isFocusMode', JSON.stringify(isFocusMode));
  }, [isFocusMode]);

  useEffect(() => {
    localStorage.setItem('focusCountdown', JSON.stringify(focusCountdown));
  }, [focusCountdown, isFocusMode]);

  const startTimer = useCallback(() => {
    if (isTimerRunning) return;
    setIsTimerRunning(true);
    if (isFocusMode) {
      toast({
        title: "Focus Session Started!",
        description: "You're now in the zone. Let's get to work!",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [isTimerRunning, isFocusMode, toast]);

  const pauseTimer = useCallback(() => {
    setIsTimerRunning(false);
    toast({
      title: "Timer Paused.",
      description: "You can resume or reset at any time.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setTimerSeconds(0);
    setFocusCountdown(FOCUS_SESSION_DURATION);
    toast({
      title: "Timer Reset.",
      description: isFocusMode ? "Focus session timer has been reset." : "Your timer has been reset to zero.",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
  }, [pauseTimer, isFocusMode, toast, FOCUS_SESSION_DURATION]);

  const toggleFocusMode = useCallback(() => {
    pauseTimer();
    setIsFocusMode(prev => !prev);
    resetTimer();
  }, [pauseTimer, resetTimer]);

  /* ---------------------------
     Task CRUD helpers
     --------------------------- */
  const openAddTask = useCallback(() => {
    setTaskToEdit(null);
    onOpen();
  }, [onOpen]);

  const openEditTask = useCallback((task) => {
    setTaskToEdit(task);
    onOpen();
  }, [onOpen]);

  const handleAddTask = useCallback(async (taskData) => {
    try {
      await apiClient.post('/tasks/', taskData);
      toast({ title: "Task added.", description: "Your new task has been created.", status: "success", duration: 5000, isClosable: true });
      await loadDashboardData();
    } catch (e) {
      console.error("Failed to add task:", e);
      toast({ title: "Failed to add task.", description: "There was an error creating your task. Please try again.", status: "error", duration: 5000, isClosable: true });
      throw e;
    }
  }, [loadDashboardData, toast]);

  const handleUpdateTask = useCallback(async (taskId, taskData) => {
    try {
      await apiClient.put(`/tasks/${taskId}/`, taskData);
      toast({ title: "Task updated.", description: "Your task has been successfully updated.", status: "success", duration: 5000, isClosable: true });
      await loadDashboardData();
    } catch (e) {
      console.error("Failed to update task:", e);
      toast({ title: "Failed to update task.", description: "There was an error updating your task. Please try again.", status: "error", duration: 5000, isClosable: true });
      throw e;
    }
  }, [loadDashboardData, toast]);

  /* ---------------------------
     Get AI insights (button)
     --------------------------- */
  const handleGetInsightsClick = useCallback(async () => {
    if (isMock) {
      const pick = MOCK_AI_INSIGHTS[Math.floor(Math.random() * MOCK_AI_INSIGHTS.length)];
      const normalized = normalizeAIResponse(pick)[0];
      setAiInsights(prev => ([...prev, normalized]));
      toast({ title: "Mock Insight Generated", description: normalized.message || normalized.text, status: normalized.type || 'info', duration: 3000, isClosable: true });
      return;
    }

    // Live mode — await fetchSuggestion if it returns data; otherwise fall back to aiData
    const fetched = await fetchSuggestion();
    const source = fetched ?? aiData;
    const normalizedInsights = normalizeAIResponse(source);

    if (normalizedInsights.length > 0) {
      setAiInsights(prev => ([...prev, ...normalizedInsights]));
      toast({ title: "AI Suggestion", description: normalizedInsights[0].message || normalizedInsights[0].text, status: "info", duration: 6000, isClosable: true });
    } else {
      toast({ title: "No Suggestion Available", description: "AI could not provide a suggestion at this time.", status: "warning", duration: 4000, isClosable: true });
    }
  }, [fetchSuggestion, aiData, toast, isMock, normalizeAIResponse]);

  /* ---------------------------
     Memos for rendering
     --------------------------- */
  const tasks = useMemo(() => dashboardData?.tasks || [], [dashboardData]);
  const stats = useMemo(() => dashboardData?.stats || {}, [dashboardData]);
  const topProjects = useMemo(() => dashboardData?.topProjects || [], [dashboardData]);
  const workHours = useMemo(() => dashboardData?.workHours || { hours: 0, minutes: 0 }, [dashboardData]);
  const workHoursTrend = useMemo(() => dashboardData?.workHoursTrend || "neutral", [dashboardData]);
  const percentOfTarget = useMemo(() => dashboardData?.percentOfTarget || 0, [dashboardData]);
  const focusPercent = useMemo(() => dashboardData?.focusPercent || 0, [dashboardData]);

  const taskChartData = useMemo(() => {
    if (!stats || Object.keys(stats).length === 0) return { labels: [], datasets: [{ data: [] }] };
    return {
      labels: ['Completed', 'In Progress', 'Overdue'],
      datasets: [{
        data: [
          stats.tasksCompleted || 0,
          (stats.totalTasks || 0) - (stats.tasksCompleted || 0) - (stats.tasksOverdue || 0),
          stats.tasksOverdue || 0,
        ],
        backgroundColor: ['#48bb78', '#ecc94b', '#f56565'],
      }]
    };
  }, [stats]);

  const categoryBreakdownData = useMemo(() => createCategoryBreakdown(tasks), [tasks, createCategoryBreakdown]);

  const hasData = useMemo(() => {
    return (
      (tasks && tasks.length > 0) ||
      (stats && Object.keys(stats).length > 0) ||
      (aiInsights && aiInsights.length > 0) ||
      (topProjects && topProjects.length > 0)
    );
  }, [tasks, stats, aiInsights, topProjects]);

  /* ---------------------------
     Render gates & states
     --------------------------- */
  if (!isAuthenticated && !isGuest) {
    return (
      <Center height="100vh">
        <Text fontSize="lg" color="gray.400">Please log in to see the dashboard.</Text>
      </Center>
    );
  }

  if (error) return <DashboardErrorState message={error} onRetry={loadDashboardData} />;

  if (loading) {
    return (
      <Box maxW="7xl" mx="auto" p={{ base: 4, md: 6 }} minHeight="100vh">
        <VStack spacing={6} align="stretch">
          <Skeleton h="40px" w="50%" mb={4} />
          <DashboardStatsCardsSkeleton />
          <DashboardSectionSkeleton />
          <Box bg={cardBgColor} borderRadius="lg" boxShadow={cardShadow} p={6}>
            <Skeleton h="40px" w="30%" mb={4} />
            <TaskListSkeleton />
          </Box>
        </VStack>
      </Box>
    );
  }

  if (!hasData) return <DashboardEmptyState onOpenAddTask={openAddTask} />;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } },
  };

  return (
    <Box
      maxW="7xl"
      mx="auto"
      p={{ base: 4, md: 6 }}
      minHeight="100vh"
      bg={mainBg}
      boxShadow={glassShadow}
      backdropFilter="blur(12.5px)"
      border={glassBorder}
      borderRadius="lg"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center" flexWrap="wrap">
          <HStack spacing={4}>
            <Heading size={{ base: "xl", md: "3xl" }} color="teal.400" fontWeight="extrabold">
              Welcome back, {(isGuest && 'Guest') || currentProfileUsername || 'User'}!
            </Heading>
            {isGuest && <Badge colorScheme="purple" size="md" px={3} py={1} borderRadius="full">Guest Mode</Badge>}
          </HStack>
          <Button colorScheme="teal" onClick={openAddTask} aria-label="Add a new task">+ New Task</Button>
        </HStack>

        <motion.div animate={isTimerRunning ? "running" : "paused"} variants={{
          running: { scale: [1, 1.02, 1], transition: { duration: 1, repeat: Infinity }},
          paused: { scale: 1, transition: { duration: 0.5 }}
        }}>
          <TimerControls
            timerSeconds={isFocusMode ? focusCountdown : timerSeconds}
            isRunning={isTimerRunning}
            isFocusMode={isFocusMode}
            onStart={startTimer}
            onPause={pauseTimer}
            onReset={resetTimer}
            onToggleFocusMode={toggleFocusMode}
          />
        </motion.div>

        <DashboardStatsCards
          workHours={workHours}
          workHoursTrend={workHoursTrend}
          percentOfTarget={percentOfTarget}
          focusPercent={focusPercent}
        />

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box bg={cardBgColor} borderRadius="lg" boxShadow={cardShadow} p={6} minH="300px">
            <Heading size="md" mb={4}>Task Status</Heading>
            <TaskStatusBarChart data={taskChartData} options={{ maintainAspectRatio: false }} />
          </Box>

          <Box bg={cardBgColor} borderRadius="lg" boxShadow={cardShadow} p={6}>
            <Heading size="md" mb={4}>Top Projects</Heading>
            <ProjectProgressBar projects={topProjects} />
          </Box>

          <Box bg={cardBgColor} borderRadius="lg" boxShadow={cardShadow} p={6}>
            <Heading size="md" mb={4}>Tasks Overview</Heading>
            <TasksOverview categoryBreakdown={categoryBreakdownData || { labels: [], datasets: [] }} />
          </Box>
        </SimpleGrid>

        <Box bg={cardBgColor} borderRadius="lg" boxShadow={cardShadow} p={6} aria-live="polite">
          <HStack justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="md">AI Insights</Heading>
            <Button onClick={handleGetInsightsClick} isLoading={aiLoading} leftIcon={<Icon as={Zap} />} colorScheme="purple" aria-label="Get AI suggestion">Get Suggestion</Button>
          </HStack>
          <AIInsights insights={aiInsights} />
        </Box>

        {tasks.length > 0 && (
          <Box bg={cardBgColor} borderRadius="lg" boxShadow={cardShadow} p={6}>
            <Heading size="md" mb={4}>All Tasks</Heading>
            <TaskList tasks={tasks} onEditTask={openEditTask} />
          </Box>
        )}
      </VStack>

      <AnimatePresence>
        {isOpen && (
          <AddTaskModal
            isOpen={isOpen}
            onClose={onClose}
            taskToEdit={taskToEdit}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            modalVariants={modalVariants}
          />
        )}
      </AnimatePresence>
    </Box>
  );
};

export default DashboardView;