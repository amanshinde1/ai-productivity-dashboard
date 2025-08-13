// src/pages/PlannerView.js
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  IconButton,
  Tooltip,
  Grid,
  Card,
  useColorModeValue,
  Spinner,
  Alert,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight, Trash2, CheckCircle, PlusCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { isOverdue, formatDateForInput } from '../utils/dateHelpers';
import { useTaskContext } from '../context/TaskContext';
import AddTaskModal from '../components/AddTaskModal';

const MotionFlex = motion(Flex);

const getTaskColor = (status, dueDate, colors) => {
  if (status === 'DONE' || status === 'COMPLETED') return colors.completed;
  if (isOverdue(dueDate)) return colors.overdue;
  if (status === 'IN_PROGRESS') return colors.inProgress;
  return colors.pending;
};

const PlannerView = ({ isGuest, onAddTask, onEditTask, onLoginPrompt }) => {
  const { tasks, loading, error, fetchTasks, toggleTaskStatus, handleDeleteTask } = useTaskContext();

  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('background.cardLight', 'background.cardDark');
  const headingColor = useColorModeValue('gray.900', 'whiteAlpha.900');
  const textColor = useColorModeValue('gray.600', 'whiteAlpha.700');
  const cardHeaderColor = useColorModeValue('gray.800', 'whiteAlpha.800');

  const colors = {
    overdue: useColorModeValue('red.500', 'red.400'),
    completed: useColorModeValue('green.500', 'green.400'),
    pending: useColorModeValue('purple.500', 'purple.400'),
    inProgress: useColorModeValue('blue.500', 'blue.400')
  };

  const todayDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTask, setSelectedTask] = useState(null);
  const [defaultDueDate, setDefaultDueDate] = useState('');
  const [recentlyChangedTask, setRecentlyChangedTask] = useState(null);
  const prevPrioritiesRef = useRef({});

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const firstWeekDay = firstDay.getDay();
    const numDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < firstWeekDay; i++) arr.push(null);
    for (let d = 1; d <= numDays; d++) arr.push(d);
    return arr;
  }, [currentMonth, currentYear]);

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(m => {
      if (m === 0) { setCurrentYear(y => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(m => {
      if (m === 11) { setCurrentYear(y => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, currentMonth, currentYear]);

  useEffect(() => {
    tasks.forEach(t => {
      prevPrioritiesRef.current[t.id] = t.priority;
    });
  }, [tasks]);

  const tasksInMonth = useMemo(() => (
    tasks.filter(task => {
      if (!task.due_date) return false;
      const d = new Date(task.due_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
  ), [tasks, currentMonth, currentYear]);

  const tasksByDay = useMemo(() => {
    const grouped = {};
    tasksInMonth.forEach(task => {
      const day = new Date(task.due_date).getDate();
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(task);
    });
    return grouped;
  }, [tasksInMonth]);

  const openTaskModal = useCallback((task = null, date = null) => {
    if (isGuest) { onLoginPrompt?.(); return; }
    setSelectedTask(task);
    setDefaultDueDate(date ? formatDateForInput(date) : '');
    onOpen();
  }, [isGuest, onLoginPrompt, onOpen]);

  const closeModal = () => {
    onClose();
    fetchTasks();
    setSelectedTask(null);
    setDefaultDueDate('');
  };

  useEffect(() => {
    if (recentlyChangedTask) {
      const t = setTimeout(() => setRecentlyChangedTask(null), 2000);
      return () => clearTimeout(t);
    }
  }, [recentlyChangedTask]);

  return (
    <Box p={6} minH="calc(100vh - 80px)" bg={bg} borderRadius="lg" boxShadow="xl">
      <Box as="span" srOnly aria-live="polite">
        {tasksInMonth.length} tasks this month
      </Box>

      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap">
        <IconButton aria-label="Previous month" icon={<ChevronLeft />} onClick={handlePrevMonth} variant="ghost" />
        <Heading color={headingColor} size="lg" flex="1" textAlign="center">
          {monthNames[currentMonth]} {currentYear}
        </Heading>
        <IconButton aria-label="Next month" icon={<ChevronRight />} onClick={handleNextMonth} variant="ghost" />
      </Flex>

      {loading && (
        <Flex justify="center" align="center" minH={200} direction="column" gap={4}>
          <Spinner size="xl" color="purple.500" />
          <Text color={textColor}>Loading...</Text>
        </Flex>
      )}

      {error && <Alert status="error" mb={6}><Text>{error}</Text></Alert>}

      {!loading && !error && tasks.length === 0 && (
        <Flex direction="column" align="center" py={12} gap={4} bg={cardBg} borderRadius="md">
          <Text color={textColor} fontSize="lg" fontWeight="medium" textAlign="center">
            {isGuest
              ? "You are in guest mode. Log in to create and manage tasks."
              : "You have no tasks yet."}
          </Text>
          {isGuest ? (
            <Button colorScheme="purple" onClick={onLoginPrompt}>Log In to Manage Tasks</Button>
          ) : (
            <Button colorScheme="purple" leftIcon={<PlusCircle />} onClick={() => openTaskModal()}>
              Add Your First Task
            </Button>
          )}
        </Flex>
      )}

      {!loading && !error && tasks.length > 0 && (
        <Grid templateColumns="repeat(7, 1fr)" gap={3} bg={cardBg} p={4} borderRadius="xl" boxShadow="lg" minH={360}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day => (
            <Text key={day} fontWeight="bold" color={cardHeaderColor} textAlign="center" pb={2}>
              {day}
            </Text>
          ))}

          {tasksInMonth.length === 0 && (
            <Text fontSize="md" gridColumn="span 7" textAlign="center" color={textColor}>
              No tasks found for this month.
            </Text>
          )}

          {daysInMonth.map((day, idx) => {
            const today = new Date();
            const isToday = day === today.getDate() &&
                            currentMonth === today.getMonth() &&
                            currentYear === today.getFullYear();
            const dayTasks = day ? tasksByDay[day] || [] : [];

            return (
              <Card
                key={idx}
                minH={120}
                bg={day ? cardBg : 'transparent'}
                p={2}
                borderRadius="md"
                border={day ? (isToday ? '2px solid' : '1px solid') : undefined}
                borderColor={day ? (isToday ? 'purple.500' : 'transparent') : undefined}
                cursor={day && !isGuest ? 'pointer' : 'default'}
                onClick={() =>
                  day && !isGuest ? openTaskModal(null, new Date(currentYear, currentMonth, day)) : null
                }
              >
                {day && (
                  <VStack align="flex-start" spacing={1} h="full">
                    <Text fontWeight="bold" color={cardHeaderColor}>{day}</Text>
                    <VStack w="full" overflowY="auto" maxH={90} spacing={1}>
                      <AnimatePresence initial={false}>
                        {dayTasks.map(task => {
                          const color = getTaskColor(task.status, task.due_date, colors);
                          const prevPriority = prevPrioritiesRef.current[task.id];
                          const priorityIncreased = prevPriority && task.priority < prevPriority;
                          const isHighlighted = recentlyChangedTask?.id === task.id || priorityIncreased;

                          return (
                            <Tooltip key={task.id} label={task.title} placement="top" hasArrow>
                              <MotionFlex
                                justify="space-between"
                                align="center"
                                bg={color}
                                color="white"
                                p={1}
                                borderRadius="md"
                                onClick={e => e.stopPropagation()}
                                initial={isHighlighted ? { scale: 1.05 } : false}
                                animate={{ scale: 1 }}
                                boxShadow={isHighlighted
                                  ? task.priority === 1
                                    ? "0 0 8px rgba(255,0,0,0.6)"
                                    : task.priority === 2
                                    ? "0 0 6px rgba(255,165,0,0.5)"
                                    : "sm"
                                  : "sm"}
                                transition={{ duration: 0.25, boxShadow: { duration: 0.8, ease: "easeOut" } }}
                              >
                                <Text
                                  isTruncated
                                  maxW="calc(100% - 40px)"
                                  cursor={!isGuest ? 'pointer' : 'default'}
                                  onClick={() => !isGuest && openTaskModal(task)}
                                >
                                  {task.title}
                                </Text>
                                <HStack spacing={1}>
                                  <IconButton
                                    size="xs"
                                    icon={<CheckCircle />}
                                    color="white"
                                    variant="ghost"
                                    aria-label={`Toggle completion of ${task.title}`}
                                    onClick={() => !isGuest && toggleTaskStatus(task)}
                                    isDisabled={isGuest}
                                  />
                                  <IconButton
                                    size="xs"
                                    icon={<Trash2 />}
                                    color="white"
                                    variant="ghost"
                                    aria-label={`Delete ${task.title}`}
                                    onClick={() => !isGuest && handleDeleteTask(task.id)}
                                    isDisabled={isGuest}
                                  />
                                </HStack>
                              </MotionFlex>
                            </Tooltip>
                          );
                        })}
                      </AnimatePresence>
                    </VStack>
                  </VStack>
                )}
              </Card>
            );
          })}
        </Grid>
      )}

      <AddTaskModal
        isOpen={isOpen}
        onClose={closeModal}
        handleAddTask={onAddTask}
        handleUpdateTask={onEditTask}
        isGuest={isGuest}
        initialTask={selectedTask}
        defaultDueDate={defaultDueDate}
        onTaskSaved={(id, priority) => {
          setRecentlyChangedTask({ id, priority });
        }}
      />
    </Box>
  );
};

export default PlannerView;
