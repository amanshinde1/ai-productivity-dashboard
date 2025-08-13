// src/components/TaskMeta.js
import React from "react";
import { Text } from "@chakra-ui/react";

const TaskMeta = ({ label, value, color }) => {
  if (!value) return null; // Skip rendering if no value
  return (
    <Text whiteSpace="nowrap">
      {label}:{" "}
      <Text as="span" fontWeight="semibold" color={color || "inherit"}>
        {value}
      </Text>
    </Text>
  );
};

export default TaskMeta;
