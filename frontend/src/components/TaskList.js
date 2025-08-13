// src/components/TaskList.js
import React from 'react';
import {
  Td, IconButton, Badge, Checkbox, useColorModeValue, Tag,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { Pencil, Trash2, GripVertical } from 'lucide-react';

const rowVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

// This component is the sortable item used in the DndContext
export const SortableItem = ({ task, onEditTask, onDeleteTask, onToggleComplete }) => {
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
    boxShadow: isDragging ? 'md' : 'none',
    backgroundColor: useColorModeValue('white', 'gray.700'),
    borderRadius: 'md',
    position: 'relative',
  };

  return (
    <motion.tr
      ref={setNodeRef}
      style={style}
      variants={rowVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      _hover={{
        backgroundColor: useColorModeValue('gray.50', 'gray.600'),
      }}
      data-task-id={task.id}
    >
      {/* Drag handle */}
      <Td p={2} width="40px" textAlign="center">
        <IconButton
          icon={<GripVertical size={16} />}
          size="sm"
          variant="ghost"
          aria-label="Drag handle"
          {...listeners}
          {...attributes}
          cursor="grab"
        />
      </Td>

      {/* Title with checkbox */}
      <Td p={2}>
        <Checkbox
          isChecked={task.isCompleted}
          onChange={() => onToggleComplete(task.id)}
          size="md"
          colorScheme="green"
          textDecoration={task.isCompleted ? 'line-through' : 'none'}
          color={task.isCompleted ? 'gray.400' : 'inherit'}
        >
          {task.title}
        </Checkbox>
      </Td>

      {/* Category Tag */}
      <Td p={2}>
        <Tag size="sm" colorScheme="purple">
          {task.category}
        </Tag>
      </Td>

      {/* Priority Badge */}
      <Td p={2}>
        <Badge colorScheme={task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'green'}>
          {task.priority}
        </Badge>
      </Td>

      {/* Status */}
      <Td p={2}>
        <Badge
          colorScheme={task.status === 'Done' ? 'green' : task.status === 'In Progress' ? 'blue' : 'gray'}
        >
          {task.status}
        </Badge>
      </Td>

      {/* Due Date */}
      <Td p={2}>
        {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'N/A'}
      </Td>

      {/* Action Buttons */}
      <Td p={2}>
        <IconButton
          icon={<Pencil size={16} />}
          size="sm"
          variant="ghost"
          aria-label="Edit task"
          onClick={() => onEditTask(task)}
          mr={1}
        />
        <IconButton
          icon={<Trash2 size={16} />}
          size="sm"
          variant="ghost"
          aria-label="Delete task"
          onClick={() => onDeleteTask(task.id)}
        />
      </Td>
    </motion.tr>
  );
};
