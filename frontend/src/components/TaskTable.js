// src/components/TaskTable.js
import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Edit, GripVertical } from 'lucide-react';

// Helper to format date to something human-readable
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? dateString
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const TaskTable = ({ tasks = [], onTaskUpdate, onDragEnd }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.200');
  const headerBg = useColorModeValue('gray.100', 'gray.900');
  const draggingBgColor = useColorModeValue('#e0f7fa', '#2d3748');

  return (
    <Box overflowX="auto" border="1px solid" borderColor={borderColor} borderRadius="md">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="task-table-droppable">
          {(provided) => (
            <Table
              variant="simple"
              size="md"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <Thead bg={headerBg}>
                <Tr>
                  <Th w="40px" />
                  <Th>Title</Th>
                  <Th>Status</Th>
                  <Th>Due Date</Th>
                  <Th textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {tasks && tasks.length > 0 ? (
                  tasks.map((task, index) => (
                    <Draggable
                      key={String(task.id)}
                      draggableId={String(task.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <Tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          style={{
                            ...provided.draggableProps.style,
                            backgroundColor: snapshot.isDragging
                              ? draggingBgColor
                              : 'transparent',
                          }}
                        >
                          {/* Drag handle */}
                          <Td
                            {...provided.dragHandleProps}
                            cursor="grab"
                            textAlign="center"
                          >
                            <GripVertical size={18} />
                          </Td>

                          {/* Title */}
                          <Td color={textColor} fontWeight="medium">
                            {task.title || 'Untitled Task'}
                          </Td>

                          {/* Status */}
                          <Td color={textColor}>{task.status || '—'}</Td>

                          {/* Due date */}
                          <Td color={textColor}>{formatDate(task.due_date)}</Td>

                          {/* Edit action */}
                          <Td textAlign="center">
                            <IconButton
                              aria-label="Edit Task"
                              icon={<Edit size={16} />}
                              size="sm"
                              variant="outline"
                              onClick={() => onTaskUpdate(task)}
                            />
                          </Td>
                        </Tr>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" py={6}>
                      <Text color={textColor} opacity={0.7}>
                        No tasks available
                      </Text>
                    </Td>
                  </Tr>
                )}
                {provided.placeholder}
              </Tbody>
            </Table>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
};

export default TaskTable;
