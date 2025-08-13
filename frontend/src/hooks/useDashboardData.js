// src/hooks/useDashboardData.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../services/api';

export const useDashboardData = (isAuthenticated, isGuest, selectedDate, activePeriod) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const fetchDashboardData = useCallback(async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[useDashboardData] fetchDashboardData called',
        { isAuthenticated, isGuest, selectedDate, activePeriod }
      );
    }

    // Abort any in-flight requests
    if (abortControllerRef.current) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDashboardData] Aborting previous request');
      }
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      if (isGuest) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useDashboardData] Returning simulated guest dashboard data');
        }
        setData({
          dailySummary: {
            focusWork: { hours: 2, minutes: 30 },
            breaks: { hours: 0, minutes: 45 },
            meetingTime: { hours: 1, minutes: 15 },
          },
          tasks: [],
        });
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useDashboardData] User not authenticated');
        }
        setData(null);
        setError('Authentication required for dashboard data.');
        setLoading(false);
        return;
      }

      // Calculate date range
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);

      if (activePeriod === 'week') {
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        endDate.setDate(startDate.getDate() + 6);
      } else if (activePeriod === 'month') {
        startDate.setDate(1);
        endDate.setMonth(startDate.getMonth() + 1);
        endDate.setDate(0);
      } else if (activePeriod === 'year') {
        startDate.setMonth(0, 1);
        endDate.setMonth(11, 31);
      }

      const formattedStartDate = startDate.toISOString().slice(0, 10);
      const formattedEndDate = endDate.toISOString().slice(0, 10);

      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[useDashboardData] Fetching metrics and tasks',
          { formattedStartDate, formattedEndDate }
        );
      }

      // Fetch data in parallel
      const [metricsResponse, tasksResponse] = await Promise.all([
        apiClient.get('/dashboard-metrics/', {
          params: { start_date: formattedStartDate, end_date: formattedEndDate },
          signal: controller.signal,
        }),
        apiClient.get('/tasks/', {
          params: { start_date: formattedStartDate, end_date: formattedEndDate },
          signal: controller.signal,
        }),
      ]);

      const metricsData = metricsResponse?.data || {};
      const tasksData = tasksResponse?.data?.results || [];

      if (process.env.NODE_ENV === 'development') {
        console.log('[useDashboardData] Dashboard data fetched successfully', {
          metricsData,
          tasksDataCount: tasksData.length,
        });
      }

      setData({
        ...metricsData,
        tasks: tasksData,
      });
      setError(null);

    } catch (err) {
      if (err.name === 'AbortError') {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useDashboardData] Request was aborted');
        }
        return;
      }

      console.error('[useDashboardData] Failed to fetch dashboard data:', err);

      let msg = 'Failed to load dashboard data. Please try again.';
      if (err.response) {
        switch (err.response.status) {
          case 401:
            msg = 'Session expired. Please log in again.';
            break;
          case 403:
            msg = 'You do not have permission to view this dashboard.';
            break;
          case 500:
            msg = 'Server error. Please try again later.';
            break;
          default:
            msg = err.response.data?.detail || msg;
        }
      } else if (err.request) {
        msg = 'Network error. Please check your internet connection.';
      }

      setData(null);
      setError(msg);
    } finally {
      setLoading(false);
      if (process.env.NODE_ENV === 'development') {
        console.log('[useDashboardData] Loading state set to false');
      }
    }
  }, [isAuthenticated, isGuest, selectedDate, activePeriod]);

  // trigger fetch
  useEffect(() => {
    fetchDashboardData();
    return () => {
      if (abortControllerRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useDashboardData] Cleaning up: aborting request');
        }
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    error,
    retry: fetchDashboardData // exposing retry for UI
  };
};
