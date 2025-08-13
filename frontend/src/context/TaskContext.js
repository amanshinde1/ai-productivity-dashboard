// src/context/TaskContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { useAuthContext } from './AuthContext';
import {
  fetchTasksAPI,
  addTaskAPI,
  editTaskAPI,
  deleteTaskAPI,
  patchTaskStatusAPI
} from '../services/tasks';

// Create the context for tasks
const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const toast = useToast();
  const { isGuest, isAuthenticated } = useAuthContext();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Initialize guest vs authenticated state
  useEffect(() => {
    if (isGuest) {
      console.log("TaskContext: Guest mode — setting simulated tasks.");
      setTasks([
        { id: 'guest-1', title: 'Simulated Task A', status: 'PENDING', due_date: new Date().toISOString() },
        { id: 'guest-2', title: 'Simulated Task B', status: 'PENDING', due_date: new Date().toISOString() },
        { id: 'guest-3', title: 'Simulated Task C', status: 'PENDING', due_date: new Date().toISOString() },
      ]);
      setLoading(false);
      setError(null);
    } else {
      console.log("TaskContext: Exiting guest mode — clearing simulated tasks.");
      setTasks([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [isGuest]);

  // Fetch tasks from backend
  const fetchTasks = useCallback(async (page = 1) => {
    console.log("TaskContext: fetchTasks called", { page, isGuest, isAuthenticated });
    setLoading(true);
    setError(null);

    if (isGuest || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const params = { page, search: searchTerm, status: filterStatus, priority: filterPriority };
      const response = await fetchTasksAPI(params);

      const resultsPerPage = response.data.results?.length || 1;
      setTasks(response.data.results);
      setTotalPages(
        response.data.total_pages ||
        Math.max(1, Math.ceil(response.data.count / resultsPerPage))
      );
      setCurrentPage(page);
    } catch (err) {
      console.error("TaskContext: Error fetching tasks:", err);
      const msg =
        err.response?.status === 401
          ? 'Authentication required to fetch tasks. Please log in.'
          : 'Failed to fetch tasks.';
      setError(msg);
      toast({
        title: err.response?.status === 401 ? "Authentication Required" : "Error fetching tasks",
        description: err.response?.data?.detail || msg,
        status: err.response?.status === 401 ? "warning" : "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterStatus, filterPriority, isGuest, isAuthenticated, toast]);

  // Add a task
  const handleAddTask = useCallback(async (taskData) => {
    if (isGuest || !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to add tasks.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    setLoading(true);
    try {
      await addTaskAPI(taskData);
      toast({
        title: "Task Added",
        description: "Your task has been successfully added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchTasks(currentPage);
      return true;
    } catch (err) {
      console.error("TaskContext: Error adding task:", err);
      setError('Failed to add task.');
      toast({
        title: "Error adding task",
        description: err.response?.data?.detail || "Could not add task.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isGuest, isAuthenticated, toast, fetchTasks, currentPage]);

  // Edit a task
  const handleEditTask = useCallback(async (taskId, taskData) => {
    if (isGuest || !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to edit tasks.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    setLoading(true);

    const formatDate = (dateString) => {
      if (!dateString) return null;
      try {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
          date.getDate()
        ).padStart(2, '0')}`;
      } catch {
        return null;
      }
    };

    const formattedTaskData = { ...taskData, due_date: formatDate(taskData.due_date) };
    console.log("TaskContext: Editing task data:", formattedTaskData);

    try {
      await editTaskAPI(taskId, formattedTaskData);
      toast({
        title: "Task Updated",
        description: "Your task has been successfully updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      await fetchTasks(currentPage);
      return true;
    } catch (err) {
      console.error("TaskContext: Error updating task:", err);
      setError('Failed to update task.');
      toast({
        title: "Error updating task",
        description: err.response?.data?.detail || "Could not update task.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [isGuest, isAuthenticated, toast, fetchTasks, currentPage]);

  // Delete a task
  const handleDeleteTask = useCallback(async (taskId) => {
    if (isGuest || !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to delete tasks.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await deleteTaskAPI(taskId);
      toast({
        title: "Task Deleted",
        description: "The task has been successfully deleted.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      await fetchTasks(currentPage);
    } catch (err) {
      console.error("TaskContext: Error deleting task:", err);
      setError('Failed to delete task.');
      toast({
        title: "Error deleting task",
        description: err.response?.data?.detail || "Could not delete task.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [isGuest, isAuthenticated, toast, fetchTasks, currentPage]);

  // Toggle status
  const toggleTaskStatus = useCallback(async (task) => {
    if (isGuest || !isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to update task status.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const newStatus = task.status === 'DONE' ? 'PENDING' : 'DONE';
    setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, status: newStatus } : t)));

    try {
      await patchTaskStatusAPI(task.id, newStatus);
      toast({
        title: "Task Status Updated",
        description: `Task '${task.title}' marked as ${newStatus}.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      console.error("TaskContext: Error toggling status:", err);
      setError('Failed to update task status.');
      setTasks(prev => prev.map(t => (t.id === task.id ? task : t))); // rollback
      toast({
        title: "Error updating status",
        description: err.response?.data?.detail || "Could not update task status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [isGuest, isAuthenticated, toast]);

  // Pagination
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) fetchTasks(currentPage + 1);
  }, [currentPage, totalPages, fetchTasks]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) fetchTasks(currentPage - 1);
  }, [currentPage, fetchTasks]);

  // Fetch on auth change
  useEffect(() => {
    if (isAuthenticated) fetchTasks(1);
  }, [fetchTasks, isAuthenticated]);

  const taskContextValue = {
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
  };

  return <TaskContext.Provider value={taskContextValue}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === null) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
