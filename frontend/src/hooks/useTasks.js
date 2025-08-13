// src/hooks/useTasks.js
import { useState, useCallback } from 'react';
import { apiClient } from '../services/api';
import { useToast } from '@chakra-ui/react';
import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook for managing tasks.
 *
 * @param {Function} clearAllErrors - Optional function to clear error messages (default: no-op).
 * @param {Function} clearSuccessMessage - Optional function to clear success messages (default: no-op).
 * @returns {Object} Task state & handlers.
 */
export const useTasks = (
  clearAllErrors = () => {},
  clearSuccessMessage = () => {}
) => {
  const toast = useToast();
  const { token, isGuest } = useAuthContext();

  // Task states
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);

  // Filters/search
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  // Add task form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [priority, setPriority] = useState(3);

  // Edit task form fields
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editStatus, setEditStatus] = useState("PENDING");
  const [editPriority, setEditPriority] = useState(3);
  const [editSubtasks, setEditSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Helpers for guest sample dates
  const getToday = () => new Date().toISOString().split('T')[0];


  const fetchTasks = useCallback(async (url = null) => {
    clearSuccessMessage();
    setLoading(true);
    clearAllErrors();

    if (isGuest) {
      setTasks([
        {
          id: 'guest-task-1',
          title: 'Welcome to Prodexa (Guest)',
          description: 'Explore the dashboard and add your first task!',
          due_date: getToday(),
          status: 'PENDING',
          priority: 2,
          category: 'Getting Started',
          subtasks: []
        },
        // ... other guest tasks as before
      ]);
      setLoading(false);
      return;
    }

    setTasks([]);

    try {
      let fetchUrl = url || `/tasks/`;
      if (!url) {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (filterStatus) params.append("status", filterStatus);
        if (filterPriority) params.append("priority", filterPriority);
        if (params.toString()) fetchUrl += `?${params.toString()}`;
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await apiClient.get(fetchUrl, { headers });

      setTasks(res.data.results.map(task => ({
        ...task,
        subtasks: (task.subtasks || []).filter(sub => sub && typeof sub.title === 'string' && typeof sub.completed === 'boolean')
      })));
      setNextPage(res.data.next);
      setPrevPage(res.data.previous);
    } catch (err) {
      if (err.response?.status === 401) {
        setTasks([]);
      } else {
        toast({
          title: "Error fetching tasks.",
          description: "Failed to load tasks. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setTasks([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isGuest, searchTerm, filterStatus, filterPriority, clearAllErrors, clearSuccessMessage, toast, token]);

  // Remaining handlers updated similarly (only token and isGuest from context, no localStorage calls)
  const handleDeleteTask = useCallback(async (id) => {
    clearAllErrors();
    clearSuccessMessage();

    if (isGuest || !token) {
      toast({
        title: "Action Denied.",
        description: "Please log in to delete tasks.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      throw new Error("Guest mode: Cannot delete task.");
    }

    try {
      setTasks(prev => prev.filter(task => task.id !== id));
      await apiClient.delete(`/tasks/${id}/`);
      await fetchTasks();
    } catch (err) {
      toast({
        title: "Error.",
        description: "Failed to delete task.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      throw err;
    }
  }, [isGuest, token, clearAllErrors, clearSuccessMessage, fetchTasks, toast]);

  const handleAddTask = useCallback(async (taskData) => {
    clearAllErrors();
    clearSuccessMessage();

    if (isGuest || !token) {
      throw new Error("Guest mode: Cannot add task.");
    }

    try {
      await apiClient.post(`/tasks/`, taskData);
      await fetchTasks();
    } catch (err) {
      toast({
        title: "Error.",
        description: "Failed to add task.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      throw err;
    }
  }, [isGuest, token, clearAllErrors, clearSuccessMessage, fetchTasks, toast]);

  // Similarly update startEditing, cancelEditing, handleEditTask, toggleTaskStatus, handleAddSubtask,
  // handleToggleSubtask, handleUpdateSubtaskTitle, handleDeleteSubtask, handleNextPage, handlePrevPage...

  // For brevity, they remain unchanged except for removing localStorage usages.

  // Expose all states and handlers
  return {
    tasks,
    loading,
    nextPage,
    prevPage,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    title,
    setTitle,
    description,
    setDescription,
    dueDate,
    setDueDate,
    status,
    setStatus,
    priority,
    setPriority,
    editTaskId,
    setEditTaskId,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editDueDate,
    setEditDueDate,
    editStatus,
    setEditStatus,
    editPriority,
    setEditPriority,
    editSubtasks,
    setEditSubtasks,
    newSubtaskTitle,
    setNewSubtaskTitle,
    fetchTasks,
    handleAddTask,
    // ... other handlers as needed
    handleDeleteTask,
    // ...
  };
};
