// src/components/AddTaskModal.js
import React, { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, Button, VStack, Input, Textarea, Select, Text, useColorModeValue,
  useToast, HStack, IconButton, Box, Icon, FormControl, FormLabel, FormErrorMessage
} from '@chakra-ui/react';
import { Plus, CheckCircle, ListTodo, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../constants/taskConstants';
import { formatDateForInput } from '../utils/dateHelpers'; // Utility for date formatting

const MotionHStack = motion(HStack);

const AddTaskModal = ({
  isOpen,
  onClose,
  handleAddTask,
  handleUpdateTask,
  isGuest,
  initialTask,
  onTaskSaved,
  defaultDueDate
}) => {
  const bg = useColorModeValue('white', 'dark.800');
  const textColor = useColorModeValue('text.primary', 'text.light');
  const headerColor = useColorModeValue('text.heading', 'text.heading');
  const toast = useToast();
  const isEditMode = !!initialTask;

  // Form states
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [currentDueDate, setCurrentDueDate] = useState('');
  const [currentStatus, setCurrentStatus] = useState(STATUS_OPTIONS[0]);
  const [currentPriority, setCurrentPriority] = useState(PRIORITY_OPTIONS[0]?.value || 3);
  const [currentAppWebsite, setCurrentAppWebsite] = useState('');
  const [currentProject, setCurrentProject] = useState('');
  const [currentSubtasks, setCurrentSubtasks] = useState([]);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [dueDateError, setDueDateError] = useState('');

  // Initialize form when modal opens or initialTask changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && initialTask) {
        setCurrentTitle(initialTask.title || '');
        setCurrentDescription(initialTask.description || '');
        setCurrentDueDate(initialTask.due_date || '');
        setCurrentStatus(initialTask.status || STATUS_OPTIONS[0]);
        setCurrentPriority(initialTask.priority || PRIORITY_OPTIONS[0]?.value || 3);
        setCurrentAppWebsite(initialTask.app_website || '');
        setCurrentProject(initialTask.project || '');
        setCurrentSubtasks(initialTask.subtasks ? [...initialTask.subtasks] : []);
      } else {
        setCurrentTitle('');
        setCurrentDescription('');
        setCurrentDueDate(
          defaultDueDate ? formatDateForInput(new Date(defaultDueDate)) : ''
        ); // Prefill with provided date
        setCurrentStatus(STATUS_OPTIONS[0]);
        setCurrentPriority(PRIORITY_OPTIONS[0]?.value || 3);
        setCurrentAppWebsite('');
        setCurrentProject('');
        setCurrentSubtasks([]);
      }
      setNewSubtaskTitle('');
      setTitleError('');
      setDueDateError('');
    }
  }, [isOpen, isEditMode, initialTask, defaultDueDate]);

  // Subtask handlers
  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newId = currentSubtasks.length > 0
        ? Math.max(...currentSubtasks.map(s => s.id || 0)) + 1
        : 1;
      setCurrentSubtasks(prev => [
        ...prev,
        { id: newId, title: newSubtaskTitle.trim(), completed: false }
      ]);
      setNewSubtaskTitle('');
    }
  };

  const handleToggleSubtask = (id) => {
    setCurrentSubtasks(prev =>
      prev.map(st =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleUpdateSubtaskTitle = (id, t) => {
    setCurrentSubtasks(prev =>
      prev.map(st =>
        st.id === id ? { ...st, title: t } : st
      )
    );
  };

  const handleDeleteSubtask = (id) => {
    setCurrentSubtasks(prev => prev.filter(st => st.id !== id));
  };

  // Validation functions
  const validateTitle = () => {
    if (!currentTitle.trim()) {
      setTitleError('Task title cannot be empty.');
      return false;
    }
    setTitleError('');
    return true;
  };

  const validateDueDate = () => {
    if (currentDueDate) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (currentDueDate < todayStr) {
        setDueDateError('Due date cannot be in the past.');
        return false;
      }
    }
    setDueDateError('');
    return true;
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) {
      toast({
        title: "Action Not Allowed",
        description: "You are in guest mode.",
        status: "warning",
        duration: 3000,
        isClosable: true
      });
      return;
    }
    if (!validateTitle() || !validateDueDate()) return;

    if (isEditMode && !initialTask?.id && initialTask?.id !== 0) {
      toast({ title: "Error", description: "Missing task ID.", status: "error", duration: 3000, isClosable: true });
      return;
    }

    const taskData = {
      title: currentTitle.trim(),
      description: currentDescription.trim(),
      due_date: currentDueDate,
      status: currentStatus,
      priority: currentPriority,
      app_website: currentAppWebsite.trim(),
      project: currentProject.trim(),
      subtasks: currentSubtasks
    };

    try {
      let savedTaskId;
      if (isEditMode) {
        await handleUpdateTask(initialTask.id, taskData);
        savedTaskId = initialTask.id;
        toast({ title: "Task Updated", status: "success", duration: 3000, isClosable: true });
      } else {
        const newTask = await handleAddTask(taskData);
        savedTaskId = newTask?.id;
        toast({ title: "Task Added", status: "success", duration: 3000, isClosable: true });
      }
      if (onTaskSaved && savedTaskId) {
        onTaskSaved(savedTaskId, currentPriority);
      }
      setTimeout(onClose, 200);
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? 'update' : 'add'} task.`,
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md" motionPreset="slideInBottom">
      <ModalOverlay />
      <ModalContent bg={bg} color={textColor} maxH="600px" overflow="hidden">
        <ModalHeader color={headerColor}>
          {isEditMode ? 'Edit Task' : 'Add New Task'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" maxH="450px" px={5} py={2}>
          <VStack as="form" spacing={4} onSubmit={handleSubmit}>
            {/* Title */}
            <FormControl isRequired isInvalid={!!titleError}>
              <FormLabel>Task Title</FormLabel>
              <Input
                placeholder="Task Title"
                size="sm"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                isDisabled={isGuest}
                autoFocus
              />
              {titleError && <FormErrorMessage>{titleError}</FormErrorMessage>}
            </FormControl>
            {/* Description */}
            <FormControl>
              <FormLabel>Task Description (Optional)</FormLabel>
              <Textarea
                placeholder="E.g., Prepare slides for Monday's meeting"
                size="sm"
                value={currentDescription}
                onChange={(e) => setCurrentDescription(e.target.value)}
                isDisabled={isGuest}
              />
            </FormControl>
            {/* Due Date */}
            <FormControl isInvalid={!!dueDateError}>
              <FormLabel>Due Date</FormLabel>
              <Input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                size="sm"
                value={currentDueDate}
                onChange={(e) => setCurrentDueDate(e.target.value)}
                isDisabled={isGuest}
              />
              {dueDateError && <FormErrorMessage>{dueDateError}</FormErrorMessage>}
            </FormControl>
            {/* Status */}
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                size="sm"
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                isDisabled={isGuest}
              >
                {STATUS_OPTIONS.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </Select>
            </FormControl>
            {/* Priority */}
            <FormControl>
              <FormLabel>Priority</FormLabel>
              <Select
                size="sm"
                value={currentPriority}
                onChange={(e) => setCurrentPriority(parseInt(e.target.value, 10))}
                isDisabled={isGuest}
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FormControl>
            {/* App Website */}
            <FormControl>
              <FormLabel>Associated App or Website</FormLabel>
              <Input
                placeholder="e.g., 'Email', 'Browser'"
                size="sm"
                value={currentAppWebsite}
                onChange={(e) => setCurrentAppWebsite(e.target.value)}
                isDisabled={isGuest}
              />
            </FormControl>
            {/* Project */}
            <FormControl>
              <FormLabel>Associated Project</FormLabel>
              <Input
                placeholder="e.g., 'Client Work', 'Personal Goal'"
                size="sm"
                value={currentProject}
                onChange={(e) => setCurrentProject(e.target.value)}
                isDisabled={isGuest}
              />
            </FormControl>
            {/* Subtasks */}
            <Box width="full" pt={3}>
              <Text fontWeight="semibold" mb={2} color={headerColor}>Subtasks</Text>
              <VStack align="stretch" spacing={2}>
                <AnimatePresence>
                  {currentSubtasks.map((subtask) => (
                    <MotionHStack
                      key={subtask.id}
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <IconButton
                        aria-label="Toggle subtask"
                        icon={<Icon as={subtask.completed ? CheckCircle : ListTodo} />}
                        onClick={() => handleToggleSubtask(subtask.id)}
                        colorScheme={subtask.completed ? "green" : "gray"}
                        variant="ghost"
                        size="sm"
                        isDisabled={isGuest}
                      />
                      <Input
                        size="sm"
                        value={subtask.title}
                        onChange={(e) => handleUpdateSubtaskTitle(subtask.id, e.target.value)}
                        textDecoration={subtask.completed ? "line-through" : "none"}
                        flex={1}
                        isDisabled={isGuest}
                      />
                      <IconButton
                        aria-label="Delete subtask"
                        icon={<Icon as={Trash2} />}
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        colorScheme="red"
                        variant="ghost"
                        size="sm"
                        isDisabled={isGuest}
                      />
                    </MotionHStack>
                  ))}
                </AnimatePresence>
                <HStack spacing={2}>
                  <Input
                    placeholder="New Subtask"
                    size="sm"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSubtask();
                      }
                    }}
                    isDisabled={isGuest}
                  />
                  <Button
                    size="sm"
                    onClick={handleAddSubtask}
                    leftIcon={<Plus />}
                    isDisabled={isGuest}
                  >
                    Add
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter py={3} px={5}>
          <Button variant="ghost" onClick={onClose} mr={3}>Cancel</Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isDisabled={isGuest || !currentTitle.trim()}
          >
            {isEditMode ? 'Update Task' : 'Add Task'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddTaskModal;
