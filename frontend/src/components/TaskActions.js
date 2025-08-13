// src/components/TaskActions.js
import React from "react";
import { HStack, Tooltip, IconButton } from "@chakra-ui/react";
import { CheckCircle, Edit, Trash } from "lucide-react";

const TaskActions = ({ task, isGuest, onToggleStatus, onEdit, onDelete }) => {
  return (
    <HStack spacing={2} mt={{ base: 4, md: 0 }}>
      <Tooltip label={task.status === "DONE" ? "Mark as Pending" : "Mark as Done"}>
        <IconButton
          aria-label="Toggle task status"
          icon={<CheckCircle />}
          size="md"
          colorScheme={task.status === "DONE" ? "orange" : "green"}
          isDisabled={isGuest}
          onClick={() => onToggleStatus(task)}
        />
      </Tooltip>

      <Tooltip label="Edit Task">
        <IconButton
          aria-label="Edit task"
          icon={<Edit />}
          size="md"
          colorScheme="blue"
          isDisabled={isGuest}
          onClick={() => onEdit(task)}
        />
      </Tooltip>

      <Tooltip label="Delete Task">
        <IconButton
          aria-label="Delete task"
          icon={<Trash />}
          size="md"
          colorScheme="red"
          isDisabled={isGuest}
          onClick={() => onDelete(task.id, task.title)}
        />
      </Tooltip>
    </HStack>
  );
};

export default TaskActions;
