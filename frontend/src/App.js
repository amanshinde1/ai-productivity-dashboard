// src/App.js
import React, { useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  ChakraProvider,
  useDisclosure,
  extendTheme,
  Spinner,
  Center,
  SkipNavLink,
  SkipNavContent,
} from '@chakra-ui/react';
import 'chart.js/auto';

import DashboardLayout from './components/DashboardLayout';
import ConfirmationModal from './components/ConfirmationModal';
import AddTaskModal from './components/AddTaskModal';
import ErrorBoundary from './components/ErrorBoundary';
import AiInsightsModal from './components/AiInsightsModal';

import PlannerView from './pages/PlannerView';
import LoginPage from './pages/LoginView';
import RequestPasswordResetPage from './pages/RequestPasswordReset';
import ResetPasswordPage from './pages/ResetPassword';
import DashboardPage from './pages/DashboardView';
import MyTasksPage from './pages/MyTasksView';
import InsightsPage from './pages/InsightsView';
import ProfilePage from './pages/ProfileView';
import NotificationsPage from './pages/Notifications';
import SettingsPage from './pages/SettingsView';
import HelpAndSupportPage from './pages/HelpView';
import NotFoundPage from './pages/NotFoundPage';

import { AuthProvider, useAuthContext } from './context/AuthContext';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConfirmationModalProvider, useConfirmationModal } from './context/ConfirmationModalContext';

// ==== THEME CONFIG ====
const theme = extendTheme({
  config: { initialColorMode: 'dark', useSystemColorMode: false },
  fonts: { heading: 'Inter, sans-serif', body: 'Inter, sans-serif' },
  colors: {
    ai: { purple: "#6A569C", purpleLight: "#8E77B8", blue: "#50BFFF", teal: "#38B2AC" }
  },
  gradients: {
    aiMain: "linear-gradient(135deg, #6A569C 0%, #8E77B8 40%, #50BFFF 100%)",
    aiButton: "linear-gradient(to-r, teal.400, blue.400)",
    aiButtonHover: "linear-gradient(to-r, teal.500, blue.500)"
  },
  components: {
    Button: {
      variants: {
        aiSolid: {
          bgGradient: "linear(to-r, teal.400, blue.400)",
          color: "white", fontWeight: "bold",
          _hover: { bgGradient: "linear(to-r, teal.500, blue.500)", transform: "scale(1.05)" },
          _active: { transform: "scale(0.98)" }
        },
        aiOutline: {
          borderColor: "whiteAlpha.700",
          color: "whiteAlpha.900",
          _hover: { bg: "whiteAlpha.200", transform: "scale(1.03)" }
        }
      }
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "gray.900",
          backgroundImage: "linear-gradient(135deg, #6A569C 0%, #8E77B8 40%, #50BFFF 100%)",
          color: "white",
          borderRadius: "2xl",
          boxShadow: "dark-lg",
          border: "2px solid rgba(255,255,255,0.15)"
        }
      }
    }
  }
});

function MainAppContent() {
  const { isAuthenticated, isAuthResolved, isGuest } = useAuthContext();
  const { handleAddTask } = useTaskContext();
  const { isOpen: isConfirmModalOpen, message, onConfirm, closeModal } = useConfirmationModal();
  const { isOpen: isAddTaskModalOpen, onOpen: onAddTaskModalOpen, onClose: onAddTaskModalClose } = useDisclosure();

  const insightsModalRef = useRef();
  const handleGetInsightsClick = () => insightsModalRef.current.show();

  if (!isAuthResolved) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <SkipNavLink zIndex="tooltip">Skip to main content</SkipNavLink>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage type="register" />} />
        <Route path="/request-password-reset" element={<RequestPasswordResetPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes */}
        {isAuthenticated || isGuest ? (
          <Route
            path="/"
            element={
              <DashboardLayout
                onAddTaskOpen={onAddTaskModalOpen}
                onGetInsightsClick={handleGetInsightsClick}
              />
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="planner" element={<PlannerView />} />
            <Route path="my-tasks" element={<MyTasksPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpAndSupportPage />} />
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        ) : (
          // Redirect only protected base "/" to /login
          <Route path="/" element={<Navigate to="/login" replace />} />
        )}

        {/* Public fallback 404 for everything else */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Global modals */}
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={closeModal} message={message} onConfirm={onConfirm} />
      <AddTaskModal isOpen={isAddTaskModalOpen} onClose={onAddTaskModalClose} handleAddTask={handleAddTask} isGuest={isGuest} />

      {/* AI Insights Modal */}
      <AiInsightsModal ref={insightsModalRef} />

      <SkipNavContent />
    </>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <TaskProvider>
            <NotificationProvider>
              <ConfirmationModalProvider>
                <ErrorBoundary>
                  <MainAppContent />
                </ErrorBoundary>
              </ConfirmationModalProvider>
            </NotificationProvider>
          </TaskProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
