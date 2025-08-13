// src/hooks/useAuth.js
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { apiClient, setTokens } from '../services/api';

/**
 * A custom hook for managing authentication state, user profile, and notifications.
 * It handles login, logout, guest login, registration, and token synchronization with localStorage.
 *
 * @returns {object} An object containing authentication state and related functions.
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Initialize state from localStorage to persist across sessions
  const initialToken = localStorage.getItem("accessToken") || "";
  const initialIsGuest = localStorage.getItem('isGuest') === 'true';
  const initialUsername = initialIsGuest ? "Guest" : localStorage.getItem("username") || "";
  const initialProfileEmail = localStorage.getItem("profileEmail") || "";

  // State for authentication and user info
  const [token, setTokenState] = useState(initialToken);
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [isGuest, setIsGuest] = useState(initialIsGuest);
  const [profileEmail, setProfileEmail] = useState(initialProfileEmail);

  // State for the user's profile page
  const [currentProfileUsername, setCurrentProfileUsername] = useState(initialUsername);
  const [currentProfileEmail, setCurrentProfileEmail] = useState(initialProfileEmail);
  const [originalProfileEmail, setOriginalProfileEmail] = useState(initialProfileEmail);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  // State for password reset
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  // State for error and success messages
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [notificationsError, setNotificationsError] = useState("");

  // Flag to indicate if the initial auth check is complete
  const [isAuthResolved, setIsAuthResolved] = useState(false);

  // Memoized value to check if the user is authenticated (not a guest)
  const isAuthenticated = useMemo(() => !!token && !isGuest, [token, isGuest]);

  // Callback to clear all error messages
  const clearAllErrors = useCallback(() => {
    setError("");
    setProfileError("");
    setNotificationsError("");
  }, []);

  // Callback to clear success messages
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage("");
  }, []);

  // Effect to sync token, guest state, and user info to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
      localStorage.removeItem('isGuest');
      setIsGuest(false);
    } else {
      localStorage.removeItem("accessToken");
    }

    if (isGuest) {
      localStorage.setItem('isGuest', 'true');
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } else {
      localStorage.removeItem('isGuest');
    }

    if (!isGuest && username) {
      localStorage.setItem("username", username);
    } else if (isGuest) {
      localStorage.removeItem("username");
    }

    if (!isGuest && profileEmail) {
      localStorage.setItem("profileEmail", profileEmail);
    } else if (isGuest) {
      localStorage.removeItem("profileEmail");
    }
  }, [token, isGuest, username, profileEmail]);

  // Callback to handle user logout (with optional toast suppression)
  const handleLogout = useCallback((showToast = true) => {
    // Clear all authentication state
    setTokenState("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isGuest");
    localStorage.removeItem("username");
    localStorage.removeItem("profileEmail");
    setIsGuest(false);
    setUsername("");
    // Clear profile and notification state
    setCurrentProfileUsername("");
    setCurrentProfileEmail("");
    setOriginalProfileEmail("");
    setNotifications([]);
    setNotificationsLoading(false);

    // Clear messages and navigate
    clearAllErrors();
    clearSuccessMessage();
    navigate('/login');

    // Only show toast if explicitly requested (for manual logouts)
    if (showToast) {
      toast({
        title: "Logged out.",
        description: "You have been successfully logged out.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [clearAllErrors, clearSuccessMessage, navigate, toast]);

  // Listen for auth logout events from the API client
  useEffect(() => {
    const handleAuthLogoutEvent = (event) => {
      // Check if event carries silent flag from api.js
      const shouldShowToast = !(event.detail && event.detail.silent);
      handleLogout(shouldShowToast);
    };

    window.addEventListener('auth:logout', handleAuthLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleAuthLogoutEvent);
  }, [handleLogout]);

  // Callback to handle guest login
  const handleGuestLogin = useCallback(() => {
    // Clear all authentication tokens and set guest state
    setTokenState("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem("username");
    localStorage.removeItem("profileEmail");
    setIsGuest(true);
    setUsername("Guest");
    // Clear profile and notification state
    setCurrentProfileUsername("Guest");
    setCurrentProfileEmail("");
    setOriginalProfileEmail("");
    setNotifications([]);
    setNotificationsLoading(false);

    // Clear messages
    clearAllErrors();
    clearSuccessMessage();
  }, [clearAllErrors, clearSuccessMessage]);

  // Effect to show a toast message when in guest mode
  useEffect(() => {
    if (isGuest) {
      if (!toast.isActive('guest-mode-toast')) {
        toast({
          id: 'guest-mode-toast',
          title: "Guest Mode.",
          description: "You are in guest mode. Some features are limited.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
      navigate('/dashboard');
    }
  }, [isGuest, navigate, toast]);

  // Callback to fetch user profile data from the API
  const fetchProfile = useCallback(async () => {
    clearSuccessMessage();

    if (!isAuthenticated) {
      setCurrentProfileUsername(isGuest ? "Guest" : "");
      setCurrentProfileEmail("");
      setOriginalProfileEmail("");
      setProfileLoading(false);
      setProfileError(isGuest ? "" : "Please log in to view your profile.");
      return;
    }

    setIsLoadingAuth(true);
    setProfileLoading(true);
    setProfileError("");

    try {
      const res = await apiClient.get(`/users/me/`);
      setCurrentProfileUsername(res.data.username);
      setCurrentProfileEmail(res.data.email || "");
      setOriginalProfileEmail(res.data.email || "");
      setUsername(res.data.username);
      setProfileEmail(res.data.email || "");
    } catch (err) {
      if (err.response?.status !== 401) {
        setProfileError("Failed to load profile. Please try again.");
      } else {
        if (localStorage.getItem("accessToken")) {
          handleLogout(false); // Silent logout for 401 errors
        }
      }
    } finally {
      setProfileLoading(false);
      setIsLoadingAuth(false);
    }
  }, [clearSuccessMessage, isAuthenticated, isGuest, handleLogout]);

  // Callback to fetch notifications from the API
  const fetchNotifications = useCallback(async () => {
    clearSuccessMessage();

    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationsLoading(false);
      setNotificationsError(isGuest ? "" : "Please log in to view your notifications.");
      return;
    }

    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const res = await apiClient.get(`/notifications/`);
      const fetchedNotifications = Array.isArray(res.data)
        ? res.data
        : (Array.isArray(res.data.results) ? res.data.results : []);
      setNotifications(fetchedNotifications);
    } catch (err) {
      if (err.response?.status !== 401) {
        setNotificationsError("Failed to load notifications. Please try again.");
      } else {
        if (localStorage.getItem("accessToken")) {
          handleLogout(false); // Silent logout for 401 errors
        }
      }
    } finally {
      setNotificationsLoading(false);
    }
  }, [clearSuccessMessage, isAuthenticated, isGuest, handleLogout]);

  // Effect to trigger data fetching when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchNotifications();
    } else if (isGuest) {
      fetchProfile();
      setNotifications([]);
    } else {
      setCurrentProfileUsername("");
      setCurrentProfileEmail("");
      setOriginalProfileEmail("");
      setNotifications([]);
    }
  }, [isAuthenticated, isGuest, fetchProfile, fetchNotifications]);

  // Effect to perform an initial authentication check
  useEffect(() => {
    const checkAuth = async () => {
      if (isGuest) {
        setIsAuthResolved(true);
        return;
      }

      if (token) {
        try {
          await apiClient.get('/users/me/');
        } catch (err) {
          console.error("Auth check failed:", err);
          if (err.response?.status === 401) {
            handleLogout(false); // Silent logout for failed auth check
          }
        }
      }

      setIsAuthResolved(true);
    };

    checkAuth();
  }, [token, isGuest, handleLogout]);

  // Updated login handler awaits profile fetch before navigation
  const handleLogin = async (usernameParam, passwordParam) => {
    clearAllErrors();
    clearSuccessMessage();

    try {
      const res = await apiClient.post(`/token/`, {
        username: usernameParam,
        password: passwordParam,
      });

      setTokens(res.data.access, res.data.refresh);
      setTokenState(res.data.access);
      localStorage.removeItem('isGuest');
      setIsGuest(false);

      setUsername(usernameParam);
      setProfileEmail(res.data.email || "");
      localStorage.setItem("username", usernameParam);
      localStorage.setItem("profileEmail", res.data.email || "");

      await fetchProfile();

      navigate('/dashboard');

      toast({
        title: "Login Successful.",
        description: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      let errorMessage = "Login failed. Invalid credentials or network error.";
      if (err.response && err.response.data && err.response.data.detail) {
        errorMessage = `Login failed: ${err.response.data.detail}`;
      }
      setError(errorMessage);
      toast({
        title: "Login Failed.",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // New registration handler
  const handleRegister = async (usernameParam, passwordParam, emailParam, confirmPasswordParam) => {
    clearAllErrors();
    clearSuccessMessage();

    if (passwordParam !== confirmPasswordParam) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast({
        title: "Registration Failed.",
        description: msg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await apiClient.post('/register/', {
        username: usernameParam,
        email: emailParam,
        password: passwordParam,
        password2: confirmPasswordParam,
      });

      setSuccessMessage("Registration successful! Please log in.");
      setUsername('');
      setPassword('');
      setProfileEmail('');
      setConfirmPassword('');

      toast({
        title: "Registration Successful.",
        description: "You can now log in with your credentials.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

    } catch (err) {
      let errorMessage = "Registration failed. Please try again.";
      if (err.response?.data) {
        const errors = err.response.data;
        errorMessage = Object.values(errors).flat().join(' ');
      }
      setError(errorMessage);

      toast({
        title: "Registration Failed.",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return {
    token,
    setToken: setTokenState,
    username,
    setUsername,
    password,
    setPassword,
    isGuest,
    setIsGuest,
    profileEmail,
    setProfileEmail,
    currentProfileUsername,
    setCurrentProfileUsername,
    currentProfileEmail,
    setCurrentProfileEmail,
    originalProfileEmail,
    setOriginalProfileEmail,
    profileLoading,
    setProfileLoading,
    isLoadingAuth,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    notifications,
    setNotifications,
    notificationsLoading,
    setNotificationsLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    profileError,
    setProfileError,
    notificationsError,
    setNotificationsError,
    isAuthenticated,
    isAuthResolved,
    clearAllErrors,
    clearSuccessMessage,
    handleLogout,
    handleGuestLogin,
    fetchProfile,
    fetchNotifications,
    handleLogin,
    handleRegister,
  };
};
