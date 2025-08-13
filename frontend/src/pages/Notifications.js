import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Heading, VStack, Text, Button, Spinner, Alert, AlertIcon,
  useColorModeValue, Flex, IconButton, Card, CloseButton, HStack,
  Tooltip, useToast,
} from '@chakra-ui/react';
import { Bell, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDateTime } from '../utils/dateHelpers';
import { useAuthContext } from '../context/AuthContext';
import { useNotificationContext } from '../context/NotificationContext';

const MotionCard = motion(Card);

const NotificationsPage = () => {
  const { isGuest } = useAuthContext();
  const {
    notifications, setNotifications, notificationsLoading, notificationsError,
    setNotificationsError, fetchNotifications, markNotificationRead, onDeleteNotification
  } = useNotificationContext();

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const toast = useToast();
  const prevNotificationsRef = useRef([]);

  // Theme UI tokens
  const headingColor = useColorModeValue('gray.900', 'text.heading');
  const textColor = useColorModeValue('gray.600', 'text.dark');
  const readNotificationBg = useColorModeValue('gray.50', 'gray.700');
  const unreadNotificationBg = useColorModeValue('blue.50', 'blue.900');
  const buttonScheme = useColorModeValue('gray', 'purple');
  const emptyStateBg = useColorModeValue('background.cardLight', 'background.cardDark');

  // Filter list
  const filteredNotifications = useMemo(
    () => showUnreadOnly ? notifications.filter(n => !n.is_read) : notifications,
    [notifications, showUnreadOnly]
  );

  // Auto-clear errors
  useEffect(() => {
    if (notificationsError && !notificationsLoading) {
      const t = setTimeout(() => setNotificationsError(''), 5000);
      return () => clearTimeout(t);
    }
  }, [notificationsError, notificationsLoading, setNotificationsError]);

  /** Batch: Mark all as read (optimistic) */
  const handleMarkAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    prevNotificationsRef.current = [...notifications];
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await Promise.all(unreadIds.map(id => markNotificationRead(id)));
      toast({ title: 'All notifications marked as read.', status: 'success', duration: 2500, isClosable: true });
    } catch {
      setNotifications(prevNotificationsRef.current);
      toast({ title: 'Failed to mark all as read.', status: 'error', duration: 2500, isClosable: true });
    }
  };

  /** Batch: Clear all notifications (optimistic) */
  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    prevNotificationsRef.current = [...notifications];
    setNotifications([]);
    try {
      await Promise.all(notifications.map(n => onDeleteNotification(n.id)));
      toast({ title: 'All notifications cleared.', status: 'info', duration: 2500, isClosable: true });
    } catch {
      setNotifications(prevNotificationsRef.current);
      toast({ title: 'Failed to clear all notifications.', status: 'error', duration: 2500, isClosable: true });
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" mb={6} flexWrap="wrap" gap={3}>
        <HStack>
          <Bell size={24} />
          <Heading size="lg" color={headingColor}>Notifications</Heading>
        </HStack>
        <HStack spacing={3}>
          {!isGuest && (
            <>
              <Tooltip label="Mark all as read"><Button
                onClick={handleMarkAllAsRead}
                colorScheme="green" size="sm"
                isDisabled={!notifications.some(n => !n.is_read)}
              >Mark All as Read</Button></Tooltip>
              <Tooltip label="Clear all notifications"><Button
                onClick={handleClearAll}
                colorScheme="red" size="sm" variant="outline"
                isDisabled={notifications.length === 0}
              >Clear All</Button></Tooltip>
            </>
          )}
          <Tooltip label={isGuest ? 'Log in to filter' : 'Toggle unread only'}>
            <Button
              onClick={() => setShowUnreadOnly(p => !p)}
              colorScheme={buttonScheme}
              variant="outline"
              isDisabled={isGuest}
              aria-pressed={showUnreadOnly}
            >{showUnreadOnly ? 'Show All' : 'Show Unread Only'}</Button>
          </Tooltip>
          <Tooltip label={isGuest ? 'Log in to refresh' : 'Refresh notifications'}>
            <IconButton
              aria-label="Refresh Notifications"
              icon={<RefreshCw size={20} />}
              onClick={fetchNotifications}
              colorScheme={buttonScheme}
              isLoading={notificationsLoading}
              variant="ghost"
              isDisabled={isGuest}
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Guest info */}
      {isGuest && (
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          <Text>You are in guest mode. Log in to view your notifications.</Text>
        </Alert>
      )}

      {/* Loading */}
      {notificationsLoading && !isGuest && (
        <Flex justify="center" align="center" minH="100px">
          <Spinner size="lg" color="purple.500" />
          <Text ml={4} color={textColor}>Loading notifications...</Text>
        </Flex>
      )}

      {/* Error */}
      {notificationsError && !isGuest && (
        <Alert status="error" mb={4} borderRadius="md" position="relative">
          <AlertIcon />
          <Text>{notificationsError}</Text>
          <CloseButton position="absolute" right="8px" top="8px"
            onClick={() => setNotificationsError('')} />
        </Alert>
      )}

      {/* Empty state */}
      {!notificationsLoading && filteredNotifications.length === 0 && !notificationsError && !isGuest && (
        <Flex direction="column" align="center" py={12} gap={4} bg={emptyStateBg}
          borderRadius="md" boxShadow="sm">
          <Text color={textColor} fontSize="lg" fontWeight="medium" textAlign="center">
            You have no {showUnreadOnly ? 'unread' : ''} notifications.
          </Text>
          {showUnreadOnly && (
            <Button variant="outline" onClick={() => setShowUnreadOnly(false)}>
              Show All Notifications
            </Button>
          )}
        </Flex>
      )}

      {/* Notifications list with animations */}
      <VStack spacing={4} align="stretch" mt={4}>
        <AnimatePresence>
          {filteredNotifications.map(notification => (
            <MotionCard
              key={notification.id}
              p={4}
              bg={notification.is_read ? readNotificationBg : unreadNotificationBg}
              borderRadius="lg"
              boxShadow="md"
              borderLeft={notification.is_read ? 'none' : '4px solid'}
              borderLeftColor={notification.is_read ? 'transparent' : 'purple.500'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              _hover={!notification.is_read ? { boxShadow: '0 0 10px rgba(128,90,213,0.5)' } : {}}
            >
              <Flex justifyContent="space-between" alignItems="center">
                <Box>
                  <Text fontWeight="medium" color={textColor} mb={1}>
                    {notification.message}
                  </Text>
                  <Text fontSize="sm" color="text.subtle">
                    {formatDateTime(notification.created_at)}
                  </Text>
                </Box>
                {!isGuest && (
                  <HStack spacing={2}>
                    {!notification.is_read && (
                      <Tooltip label="Mark as read">
                        <Button
                          leftIcon={<CheckCircle size={20} />}
                          onClick={() => markNotificationRead(notification.id)}
                          colorScheme="green" size="sm"
                        >Mark as Read</Button>
                      </Tooltip>
                    )}
                    <Tooltip label="Delete notification">
                      <IconButton
                        aria-label="Delete Notification"
                        icon={<Trash2 size={20} />}
                        onClick={() => onDeleteNotification(notification.id)}
                        colorScheme="red" size="sm" variant="ghost"
                      />
                    </Tooltip>
                  </HStack>
                )}
              </Flex>
            </MotionCard>
          ))}
        </AnimatePresence>
      </VStack>
    </Box>
  );
};

export default NotificationsPage;
