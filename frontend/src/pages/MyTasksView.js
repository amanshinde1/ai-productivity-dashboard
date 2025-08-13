// src/pages/MyTasksView.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Text,
  Heading,
  Flex,
  Button,
  VStack,
  HStack,
  Alert,
  useColorModeValue,
  Select,
  Input,
  IconButton,
  Tag,
  TagLabel,
  TagCloseButton,
  Skeleton
} from "@chakra-ui/react";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTaskContext } from "../context/TaskContext";
import { useAuthContext } from "../context/AuthContext";
import { useConfirmationModal } from "../context/ConfirmationModalContext";
import AddTaskModal from "../components/AddTaskModal";
import TaskMeta from "../components/TaskMeta";
import TaskActions from "../components/TaskActions";
import useDebounce from "../hooks/useDebounce";

const MotionBox = motion(Box);

const MyTasksView = ({ onLoginPrompt }) => {
  const {
    tasks,
    loading,
    error,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    fetchTasks,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    toggleTaskStatus,
    handleNextPage,
    handlePrevPage,
  } = useTaskContext();

  const { isGuest } = useAuthContext();
  const { openModal } = useConfirmationModal();

  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [searchInput, setSearchInput] = useState(searchTerm || "");
  const debouncedSearch = useDebounce(searchInput, 300);

  // Store previous priorities for each task to detect increases
  const prevPrioritiesRef = useRef({});

  const headingColor = useColorModeValue("gray.900", "whiteAlpha.900");
  const textColor   = useColorModeValue("gray.600", "whiteAlpha.700");
  const cardBg      = useColorModeValue("background.cardLight", "background.cardDark");
  const taskItemBg  = useColorModeValue("gray.50", "gray.700");

  const openAddTaskModal = useCallback(() => {
    if (isGuest) { onLoginPrompt(); return; }
    setTaskToEdit(null);
    setIsAddTaskModalOpen(true);
  }, [isGuest, onLoginPrompt]);

  const openEditTaskModal = useCallback((task) => {
    if (isGuest) { onLoginPrompt(); return; }
    setTaskToEdit(task);
    setIsAddTaskModalOpen(true);
  }, [isGuest, onLoginPrompt]);

  const closeAddTaskModal = useCallback(() => {
    setIsAddTaskModalOpen(false);
    setTaskToEdit(null);
  }, []);

  const confirmDeleteTask = useCallback((taskId, taskTitle) => {
    openModal({
      message: `Are you sure you want to delete the task "${taskTitle}"? This action cannot be undone.`,
      onConfirm: () => handleDeleteTask(taskId),
    });
  }, [openModal, handleDeleteTask]);

  // Debounced searchTerm update
  useEffect(() => {
    setSearchTerm(debouncedSearch);
  }, [debouncedSearch, setSearchTerm]);

  // Fetch tasks when filters/search changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, searchTerm, filterStatus, filterPriority]);

  // Update previous priority ref
  useEffect(() => {
    tasks.forEach(t => {
      prevPrioritiesRef.current[t.id] = t.priority;
    });
  }, [tasks]);

  // Utility: get due date urgency color
  const getDueDateColor = useCallback((dueDate) => {
    if (!dueDate) return textColor;
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = (due - today) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return "red.400";       // overdue
    if (diffDays <= 3) return "orange.400";  // due soon
    return textColor;
  }, [textColor]);

  // Filter chips
  const activeFilters = [
    searchTerm && { label: `Search: ${searchTerm}`, onClear: () => { setSearchInput(""); setSearchTerm(""); } },
    filterStatus && { label: `Status: ${filterStatus}`, onClear: () => setFilterStatus("") },
    filterPriority && {
      label: `Priority: ${filterPriority === "1" ? "High" : filterPriority === "2" ? "Medium" : "Low"}`,
      onClear: () => setFilterPriority("")
    }
  ].filter(Boolean);

  return (
    <Box p={{ base:4, md:8 }} minHeight="80vh" maxW="7xl" mx="auto">
      {/* Live region for screen readers */}
      <Box as="span" srOnly aria-live="polite">
        {tasks.length} {tasks.length === 1 ? "task found" : "tasks found"}
      </Box>

      {/* Header */}
      <Flex justify="space-between" align="center" flexWrap="wrap" mb={{ base:4, md:6 }} gap={4}>
        <Heading color={headingColor} size="2xl">My Tasks</Heading>
        <Button
          leftIcon={<PlusCircle />}
          colorScheme="purple"
          px={6} py={3}
          disabled={isGuest}
          onClick={openAddTaskModal}
        >
          Add New Task
        </Button>
      </Flex>

      {/* Filter chips */}
      {activeFilters.length > 0 && (
        <HStack mb={4} spacing={2} flexWrap="wrap">
          {activeFilters.map((f, idx) => (
            <Tag key={idx} size="md" borderRadius="full" variant="subtle" colorScheme="purple">
              <TagLabel>{f.label}</TagLabel>
              <TagCloseButton onClick={f.onClear} />
            </Tag>
          ))}
        </HStack>
      )}

      {/* Alerts */}
      {isGuest && (
        <Alert status="info" mb={4} borderRadius="md">
          <Text fontSize="md" color={textColor}>
            You are in guest mode. Log in to manage tasks.
          </Text>
        </Alert>
      )}
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <Text fontSize="md">{error}</Text>
        </Alert>
      )}

      {/* Filters */}
      <HStack spacing={{ base:2, md:4 }} flexWrap="wrap" mb={6}>
        <Input
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          flex="1"
          minW={{ base: "150px", md: "250px" }}
          bg={cardBg}
          color={textColor}
        />
        <Select
          placeholder="Filter by Status"
          value={filterStatus || ""}
          onChange={(e) => setFilterStatus(e.target.value)}
          minW="140px"
          bg={cardBg}
          color={textColor}
        >
          <option value="PENDING">Pending</option>
          <option value="DONE">Done</option>
        </Select>
        <Select
          placeholder="Filter by Priority"
          value={filterPriority || ""}
          onChange={(e) => setFilterPriority(e.target.value)}
          minW="140px"
          bg={cardBg}
          color={textColor}
        >
          <option value="1">High</option>
          <option value="2">Medium</option>
          <option value="3">Low</option>
        </Select>
      </HStack>

      {/* Loading Skeleton */}
      {loading && (
        <VStack p={8} spacing={4}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} height="100px" width="100%" borderRadius="md" />
          ))}
        </VStack>
      )}

      {/* Task list or empty state */}
      {!loading && (
        <VStack spacing={4} align="stretch">
          {tasks.length === 0 ? (
            <Flex direction="column" align="center" py={12} gap={4} bg={taskItemBg} borderRadius="md">
              <Text color={textColor} fontSize="lg" fontWeight="medium" textAlign="center">
                {isGuest
                  ? "You are in guest mode. Log in to create and manage tasks."
                  : (searchTerm || filterStatus || filterPriority)
                  ? "No tasks match your current filters."
                  : "You have no tasks yet."}
              </Text>
              {isGuest ? (
                <Button colorScheme="purple" onClick={onLoginPrompt}>Log In to Manage Tasks</Button>
              ) : (searchTerm || filterStatus || filterPriority) ? (
                <Button variant="outline" colorScheme="purple" onClick={() => {
                  setSearchInput(""); setSearchTerm(""); setFilterStatus(""); setFilterPriority("");
                }}>
                  Clear Filters
                </Button>
              ) : (
                <Button colorScheme="purple" leftIcon={<PlusCircle />} onClick={openAddTaskModal}>
                  Add Your First Task
                </Button>
              )}
            </Flex>
          ) : (
            <AnimatePresence>
              {tasks.map((task) => {
                const prevPriority = prevPrioritiesRef.current[task.id];
                const priorityIncreased = prevPriority && task.priority < prevPriority;
                return (
                  <MotionBox
                    key={task.id}
                    p={4}
                    bg={taskItemBg}
                    borderRadius="md"
                    boxShadow="sm"
                    initial={{
                      opacity: 0,
                      y: 20,
                      scale: priorityIncreased && task.priority === 1
                        ? 1.05
                        : priorityIncreased && task.priority === 2
                        ? 1.02
                        : 1
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      boxShadow:
                        priorityIncreased && task.priority === 1
                          ? "0 0 8px rgba(255,0,0,0.6)"
                          : priorityIncreased && task.priority === 2
                          ? "0 0 6px rgba(255,165,0,0.5)"
                          : "sm"
                    }}
                    exit={{ opacity: 0, y: -20 }}
                    layout
                    transition={{
                      duration: 0.25,
                      boxShadow: { duration: 0.8, ease: "easeOut" }
                    }}
                  >
                    <Flex direction={{ base: "column", md: "row" }} justify="space-between">
                      <Box flex="1" pr={{ md: 4 }}>
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          color={headingColor}
                          textDecoration={task.status === "DONE" ? "line-through" : "none"}
                          isTruncated
                          maxW={{ base: "100%", md: "350px" }}
                        >
                          {task.title}
                        </Text>
                        {task.description && (
                          <Text fontSize="md" color={textColor} mt={1} noOfLines={3}>
                            {task.description}
                          </Text>
                        )}
                        <HStack spacing={4} mt={3} wrap="wrap" fontSize="sm">
                          {task.due_date && (
                            <Text whiteSpace="nowrap" color={getDueDateColor(task.due_date)}>
                              Due: {new Date(task.due_date).toLocaleDateString()}
                            </Text>
                          )}
                          <TaskMeta label="Status" value={task.status} color={task.status === "DONE" ? "green.500" : "orange.400"} />
                          <TaskMeta
                            label="Priority"
                            value={task.priority === 1 ? "High" : task.priority === 2 ? "Medium" : "Low"}
                            color={task.priority === 1 ? "red.500" : task.priority === 2 ? "orange.500" : "blue.500"}
                          />
                          <TaskMeta label="Category" value={task.category} color={textColor} />
                          <TaskMeta label="Project" value={task.project} color={textColor} />
                        </HStack>
                      </Box>
                      <TaskActions
                        task={task}
                        isGuest={isGuest}
                        onToggleStatus={toggleTaskStatus}
                        onEdit={openEditTaskModal}
                        onDelete={confirmDeleteTask}
                      />
                    </Flex>
                  </MotionBox>
                );
              })}
            </AnimatePresence>
          )}
        </VStack>
      )}

      {/* Pagination */}
      {tasks.length > 0 && (totalPages || 1) > 1 && (
        <Flex justify="center" align="center" mt={8} gap={4} wrap="wrap">
          <IconButton
            aria-label="Previous page"
            icon={<ChevronLeft />}
            onClick={handlePrevPage}
            isDisabled={(currentPage || 1) === 1 || loading}
            isLoading={loading}
            size="lg"
            colorScheme="purple"
            borderRadius="full"
          />
          <Text fontWeight="bold" color={textColor} minW="80px" textAlign="center">
            Page {currentPage || 1} of {totalPages || 1}
          </Text>
          <IconButton
            aria-label="Next page"
            icon={<ChevronRight />}
            onClick={handleNextPage}
            isDisabled={(currentPage || 1) === (totalPages || 1) || loading}
            isLoading={loading}
            size="lg"
            colorScheme="purple"
            borderRadius="full"
          />
        </Flex>
      )}

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={closeAddTaskModal}
        handleAddTask={handleAddTask}
        handleUpdateTask={handleEditTask}
        isGuest={isGuest}
        initialTask={taskToEdit}
      />
    </Box>
  );
};

export default MyTasksView;
