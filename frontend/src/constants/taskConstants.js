// src/constants/taskConstants.js

/**
 * Shared constants for task status and priority options.
 * Keep these in sync with any backend/API enumerations to avoid mismatches.
 */

// Task status options
export const STATUS_OPTIONS = ["PENDING", "DONE"];

// Task priority options
export const PRIORITY_OPTIONS = [
  { value: 1, label: "High Priority" },
  { value: 2, label: "Medium Priority" },
  { value: 3, label: "Low Priority" }
];
