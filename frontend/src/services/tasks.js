// src/services/tasks.js
import { apiClient } from './api';

/**
 * Fetch paginated tasks.
 * @param {Object} params - { page, search, status, priority }
 */
export function fetchTasksAPI(params) {
  return apiClient.get('/tasks/', { params });
}

/**
 * Add a new task.
 * @param {Object} taskData
 */
export function addTaskAPI(taskData) {
  return apiClient.post('/tasks/', taskData);
}

/**
 * Edit an existing task.
 * @param {string|number} taskId
 * @param {Object} taskData
 */
export function editTaskAPI(taskId, taskData) {
  return apiClient.put(`/tasks/${taskId}/`, taskData);
}

/**
 * Delete an existing task.
 * @param {string|number} taskId
 */
export function deleteTaskAPI(taskId) {
  return apiClient.delete(`/tasks/${taskId}/`);
}

/**
 * Patch task status only.
 * @param {string|number} taskId
 * @param {string} status - New status (ex: "PENDING" or "DONE")
 */
export function patchTaskStatusAPI(taskId, status) {
  return apiClient.patch(`/tasks/${taskId}/`, { status });
}
