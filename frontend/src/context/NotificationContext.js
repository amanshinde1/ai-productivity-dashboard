import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '../services/api';
import { useAuthContext } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, isGuest, handleLogout } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);

  /** Fetch notifications list from the backend */
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || isGuest) {
      setNotifications([]);
      setNotificationsError(null);
      return;
    }
    setNotificationsLoading(true);
    setNotificationsError(null);
    try {
      const response = await apiClient.get('/notifications/');
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data.results)
        ? response.data.results
        : [];
      setNotifications(data);
    } catch (err) {
      console.error("NotificationContext: Error fetching notifications:", err);
      setNotificationsError('Failed to load notifications.');
      if (err.response?.status === 401) handleLogout();
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated, isGuest, handleLogout]);

  /** Mark a single notification as read (optimistic) */
  const markNotificationRead = useCallback(async (id) => {
    if (!isAuthenticated) return;
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await apiClient.put(`/notifications/${id}/mark_read/`);
    } catch (err) {
      setNotificationsError('Failed to mark notification as read.');
      if (err.response?.status === 401) handleLogout();
      fetchNotifications(); // rollback
    }
  }, [isAuthenticated, handleLogout, fetchNotifications]);

  /** Delete a single notification (optimistic) */
  const onDeleteNotification = useCallback(async (id) => {
    if (!isAuthenticated) return;
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await apiClient.delete(`/notifications/${id}/`);
    } catch (err) {
      setNotificationsError('Failed to delete notification.');
      if (err.response?.status === 401) handleLogout();
      fetchNotifications(); // rollback
    }
  }, [isAuthenticated, handleLogout, fetchNotifications]);

  /** Auto-fetch when authentication state changes */
  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      fetchNotifications();
    }
  }, [isAuthenticated, isGuest, fetchNotifications]);

  /** Context value: Exposes `setNotifications` for batch optimistic updates */
  const contextValue = useMemo(() => ({
    notifications,
    setNotifications,           // ✅ For instant UI updates in NotificationsPage
    notificationsLoading,
    notificationsError,
    setNotificationsError,
    fetchNotifications,
    markNotificationRead,
    onDeleteNotification,
  }), [
    notifications,
    setNotifications,
    notificationsLoading,
    notificationsError,
    fetchNotifications,
    markNotificationRead,
    onDeleteNotification
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
