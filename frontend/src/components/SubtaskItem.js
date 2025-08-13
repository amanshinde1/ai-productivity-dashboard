import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  IconButton,
  Input,
  HStack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  CheckSquare,
  Square,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";

function SubtaskItem({ subtask, onToggle, onUpdate, onDelete, isGuest }) {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(subtask?.title || "");

  // Colors for checked/unchecked
  const accentColor = useColorModeValue("#3182CE", "#63B3ED");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const disabledColor = useColorModeValue("gray.400", "gray.600");

  if (!subtask) {
    console.warn("SubtaskItem received null/undefined subtask");
    return null;
  }

  const handleSave = () => {
    const trimmed = editedTitle.trim();
    if (!trimmed) {
      toast({
        title: "Empty subtask title",
        description: "Subtask title cannot be empty.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onUpdate(subtask.id, trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(subtask.title || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <motion.li
      style={{ listStyle: "none", marginBottom: 8, userSelect: "none" }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {isEditing ? (
        <HStack spacing={2}>
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            size="sm"
            aria-label="Edit subtask title"
            disabled={isGuest}
          />
          <IconButton
            size="sm"
            icon={<Save />}
            onClick={handleSave}
            aria-label="Save subtask"
            isDisabled={isGuest}
            colorScheme="teal"
          />
          <IconButton
            size="sm"
            icon={<X />}
            onClick={handleCancel}
            aria-label="Cancel editing"
            isDisabled={isGuest}
          />
        </HStack>
      ) : (
        <HStack spacing={3} justify="space-between">
          <IconButton
            size="sm"
            icon={
              subtask.completed ? (
                <CheckSquare color={accentColor} />
              ) : (
                <Square color={disabledColor} />
              )
            }
            onClick={() => !isGuest && onToggle(subtask.id)}
            aria-label={subtask.completed ? "Mark as incomplete" : "Mark as complete"}
            isDisabled={isGuest}
            variant="ghost"
          />
          <Text
            flex="1"
            ml={2}
            color={subtask.completed ? "gray.500" : textColor}
            textDecoration={subtask.completed ? "line-through" : "none"}
            whiteSpace="normal"
          >
            {subtask.title}
          </Text>
          {!isGuest && (
            <>
              <IconButton
                size="sm"
                icon={<Edit color={accentColor} />}
                onClick={() => setIsEditing(true)}
                aria-label="Edit subtask"
                variant="ghost"
              />
              <IconButton
                size="sm"
                icon={<Trash2 color="red" />}
                onClick={() => onDelete(subtask.id)}
                aria-label="Delete subtask"
                variant="ghost"
              />
            </>
          )}
        </HStack>
      )}
    </motion.li>
  );
}

export default SubtaskItem;
