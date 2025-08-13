// src/components/DashboardLayout.js
import React, { useMemo, useCallback } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  IconButton,
  Button,
  Divider,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import {
  Menu,
  Bell,
  Lightbulb,
  LayoutDashboard,
  ListTodo,
  GanttChart,
  LineChart,
  Settings,
  MessageSquare,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import ColorModeSwitcher from './ColorModeSwitcher';
import NavItem from './NavItem';
import { useAuthContext } from '../context/AuthContext';

const SIDEBAR_WIDTH = { base: '70px', md: '230px' };

const DashboardLayout = ({ notifications = [], onGetInsightsClick }) => {
  const glassBg = useColorModeValue('rgba(255,255,255,0.15)', 'rgba(18,18,18,0.95)');
  const accentText = useColorModeValue('#202f42', 'whiteAlpha.900');
  const borderCol = useColorModeValue('rgba(190,235,255,0.12)', 'rgba(100,200,255,0.14)');
  const shadowCol = useColorModeValue(
    '0 0 24px 0 rgba(31,174,255,0.11)',
    '0 0 24px 0 rgba(31,174,255,0.18)'
  );
  const notifBadgeBg = useColorModeValue('red.500', 'red.600');
  const bgPage = useColorModeValue('gray.50', 'gray.900');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isAuthenticated,
    profileLoading,
    currentProfileUsername,
    handleLogout,
    isGuest,
    isAuthResolved,
  } = useAuthContext();

  const isActive = useCallback(
    (path) => location.pathname.startsWith(path),
    [location.pathname]
  );

  const disabledStyle = useMemo(
    () => ({
      pointerEvents: 'none',
      opacity: 0.5,
      userSelect: 'none',
    }),
    []
  );

  const unreadCount = useMemo(
    () => (Array.isArray(notifications) ? notifications.filter((n) => !n?.read).length : 0),
    [notifications]
  );

  // Sidebar (shared between desktop & Drawer)
  const sidebarContent = useMemo(
    () => (
      <VStack align="stretch" spacing={0} py={5} px={3} height="100vh" userSelect="none">
        {/* Logo */}
        <Box>
          <HStack justify="center" mb={8}>
            <Heading
              fontSize="2xl"
              letterSpacing="8px"
              color={accentText}
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              fontWeight="extrabold"
            >
              PRODEXA
            </Heading>
          </HStack>

          {/* Main nav */}
          <VStack align="stretch" spacing={3.5}>
            <NavItem icon={LayoutDashboard} to="/dashboard" closeDrawer={onClose} isActive={isActive('/dashboard')}>
              Dashboard
            </NavItem>
            <NavItem icon={ListTodo} to="/my-tasks" closeDrawer={onClose} isActive={isActive('/my-tasks')} style={isGuest ? disabledStyle : undefined}>
              My Tasks
            </NavItem>
            <NavItem icon={GanttChart} to="/planner" closeDrawer={onClose} isActive={isActive('/planner')} style={isGuest ? disabledStyle : undefined}>
              Planner
            </NavItem>
            <NavItem icon={LineChart} to="/insights" closeDrawer={onClose} isActive={isActive('/insights')} style={isGuest ? disabledStyle : undefined}>
              Insights
            </NavItem>
          </VStack>
        </Box>

        {/* Settings & Support */}
        <Box mt={8}>
          <Divider borderColor={borderCol} opacity={0.23} mb={3.5} />
          <VStack align="stretch" spacing={3.5}>
            <NavItem icon={Settings} to="/settings" closeDrawer={onClose} isActive={isActive('/settings')} style={isGuest ? disabledStyle : undefined}>
              Settings
            </NavItem>
            <NavItem icon={MessageSquare} to="/help" closeDrawer={onClose} isActive={isActive('/help')} style={isGuest ? disabledStyle : undefined}>
              Help & Support
            </NavItem>

            {isAuthenticated ? (
              <NavItem icon={LogOut} handleLogout={handleLogout} closeDrawer={onClose}>
                Log Out
              </NavItem>
            ) : isGuest ? (
              <NavItem icon={LogOut} handleLogout={handleLogout} closeDrawer={onClose}>
                Exit Guest Mode
              </NavItem>
            ) : (
              <Text color="gray.500" px={4} py={2}>
                Please log in
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    ),
    [
      accentText,
      borderCol,
      disabledStyle,
      handleLogout,
      isActive,
      isAuthenticated,
      isGuest,
      onClose
    ]
  );

  const navigateToNotifications = useCallback(() => {
    navigate('/notifications');
    if (isOpen) onClose();
  }, [navigate, isOpen, onClose]);

  const navigateToProfile = useCallback(() => {
    navigate('/profile');
    if (isOpen) onClose();
  }, [navigate, isOpen, onClose]);

  if (!isAuthResolved) {
    return (
      <Flex height="100vh" justify="center" align="center" bg={bgPage}>
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box minHeight="100vh" bg={bgPage} pb={4}>
      <Flex
        minH="100vh"
        bg={glassBg}
        borderRadius="2xl"
        border={`1.5px solid ${borderCol}`}
        boxShadow={shadowCol}
        overflow="hidden"
        backdropFilter="blur(13px)"
        flexDirection={{ base: 'column', md: 'row' }} // mobile-friendly
      >
        {/* Desktop sidebar */}
        <Box
          as="nav"
          width={SIDEBAR_WIDTH}
          minWidth={SIDEBAR_WIDTH}
          flexShrink={0}
          py={5}
          px={3}
          borderRight={`1.5px solid ${borderCol}`}
          bg="inherit"
          height={{ base: 'auto', md: '100vh' }}
          overflowY="auto"
          position="relative"
          display={{ base: 'none', md: 'block' }}
        >
          {sidebarContent}
        </Box>

        {/* Mobile Drawer */}
        <Drawer
          isOpen={isOpen}
          onClose={onClose}
          placement="left"
          size="xs"
          trapFocus
          closeOnEsc
          closeOnOverlayClick
        >
          <DrawerOverlay bg="blackAlpha.600" backdropFilter="blur(8px)" />
          <DrawerContent
            bg={glassBg}
            borderRadius="2xl"
            border={`1.5px solid ${borderCol}`}
            boxShadow={shadowCol}
            backdropFilter="blur(14px)"
          >
            <DrawerCloseButton
              color={accentText}
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
              _active={{ bg: 'rgba(255,255,255,0.15)' }}
            />
            <DrawerHeader>
              <Heading color={accentText}>PRODEXA</Heading>
            </DrawerHeader>
            <DrawerBody p={0}>{sidebarContent}</DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main content */}
        <Flex direction="column" flex="1" minH="100vh" bg="transparent">
          {/* Header */}
          <Flex
            as="header"
            align="center"
            px={{ base: 2, md: 6 }}
            py={3}
            borderBottom={`1.5px solid ${borderCol}`}
            boxShadow={shadowCol}
            position="sticky"
            top={0}
            zIndex={10}
            bg={glassBg}
            gap={3}
          >
            <IconButton
              icon={<Menu />}
              aria-label="Open navigation menu"
              onClick={onOpen}
              display={{ base: 'inline-flex', md: 'none' }}
              fontSize="xl"
              variant="ghost"
              color={accentText}
            />

            {/* Right-aligned header actions */}
            <HStack spacing={2} ml="auto" whiteSpace="nowrap">
              <Button
                leftIcon={<Lightbulb />}
                colorScheme="teal"
                size="sm"
                onClick={onGetInsightsClick}
                isDisabled={isGuest}
              >
                Get Insights
              </Button>
              <Box position="relative">
                <IconButton
                  aria-label={`You have ${unreadCount} unread notifications`}
                  icon={<Bell />}
                  variant="ghost"
                  color={accentText}
                  onClick={navigateToNotifications}
                  fontSize="lg"
                />
                {unreadCount > 0 && (
                  <Box
                    position="absolute"
                    top={0}
                    right={0}
                    bg={notifBadgeBg}
                    borderRadius="full"
                    width="8px"
                    height="8px"
                  />
                )}
              </Box>
              <HStack
                cursor="pointer"
                onClick={navigateToProfile}
                role="button"
                tabIndex={0}
                borderRadius="full"
                px={2}
                py={1}
                _hover={{ bg: glassBg }}
                transition="all 0.18s"
              >
                <Box
                  bg="gray.800"
                  borderRadius="full"
                  boxSize={8}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <UserCircle size={24} color="white" />
                </Box>
                {profileLoading ? (
                  <Spinner size="sm" color={accentText} />
                ) : (
                  <Text color={accentText} maxW="32" isTruncated fontWeight="semibold">
                    {isGuest ? 'Guest' : currentProfileUsername || 'User'}
                  </Text>
                )}
              </HStack>
              <ColorModeSwitcher />
            </HStack>
          </Flex>

          {/* Main Page Content */}
          <Box
            flex="1"
            p={{ base: 3, sm: 4, md: 6 }}
            overflow="auto"
            bg="transparent"
            minHeight="0"
          >
            <Outlet />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default React.memo(DashboardLayout);
