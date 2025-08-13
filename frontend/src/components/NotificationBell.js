// src/components/NotificationBell.js
import React, { useMemo } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext'; // Correct import
import { useToast } from '@chakra-ui/react';

function NotificationBell({ onBellClick }) {
  const { isAuthenticated } = useAuthContext();
  const { notifications } = useNotificationContext(); // Get notifications from NotificationContext

  const toast = useToast();

  const unreadCount = useMemo(() => {
    if (isAuthenticated && Array.isArray(notifications)) {
      return notifications.filter(notification => !notification.is_read).length;
    }
    return 0;
  }, [notifications, isAuthenticated]);

  const handleClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Guest Mode",
        description: "Please log in to view your notifications.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onBellClick();
  };

  return (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleClick}>
      <svg
        style={{ width: '24px', height: '24px', color: 'var(--text-medium)' }}
        xmlns="http://www.w3.org/2000/svg"
        fill="none" stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '12px',
            minWidth: '18px',
            textAlign: 'center',
            lineHeight: '1',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {unreadCount}
        </span>
      )}
    </div>
  );
}

export default NotificationBell;
