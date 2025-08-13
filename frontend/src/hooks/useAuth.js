// src/hooks/useAuth.js
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@chakra-ui/react';
import { apiClient, setTokens } from '../services/api';

/**
 * A custom hook for managing authentication state, user profile, and notifications.
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // Initialize state
  const initialToken = localStorage.getItem("accessToken") || "";
  const initialIsGuest = localStorage.getItem('isGuest') === 'true';
  const initialUsername = initialIsGuest ? "Guest" : localStorage.getItem("username") || "";
  const initialProfileEmail = localStorage.getItem("profileEmail") || "";

  const [token, setTokenState] = useState(initialToken);
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [isGuest, setIsGuest] = useState(initialIsGuest);
  const [profileEmail, setProfileEmail] = useState(initialProfileEmail);

  const [currentProfileUsername, setCurrentProfileUsername] = useState(initialUsername);
  const [currentProfileEmail, setCurrentProfileEmail] = useState(initialProfileEmail);
  const [originalProfileEmail, setOriginalProfileEmail] = useState(initialProfileEmail);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [notificationsError, setNotificationsError] = useState("");

  const [isAuthResolved, setIsAuthResolved] = useState(false);

  const isAuthenticated = useMemo(() => !!token && !isGuest, [token, isGuest]);

  const clearAllErrors = useCallback(() => {
    setError("");
    setProfileError("");
    setNotificationsError("");
  }, []);

  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage("");
  }, []);

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

  const handleLogout = useCallback((showToast = true) => {
    setTokenState("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("isGuest");
    localStorage.removeItem("username");
    localStorage.removeItem("profileEmail");
    setIsGuest(false);
    setUsername("");

    setCurrentProfileUsername("");
    setCurrentProfileEmail("");
    setOriginalProfileEmail("");
    setNotifications([]);
    setNotificationsLoading(false);

    clearAllErrors();
    clearSuccessMessage();
    navigate('/login');

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

  useEffect(() => {
    const handleAuthLogoutEvent = (event) => {
      const shouldShowToast = !(event.detail && event.detail.silent);
      handleLogout(shouldShowToast);
    };

    window.addEventListener('auth:logout', handleAuthLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleAuthLogoutEvent);
  }, [handleLogout]);

  const handleGuestLogin = useCallback(() => {
    setTokenState("");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem("username");
    localStorage.removeItem("profileEmail");
    setIsGuest(true);
    setUsername("Guest");

    setCurrentProfileUsername("Guest");
    setCurrentProfileEmail("");
    setOriginalProfileEmail("");
    setNotifications([]);
    setNotificationsLoading(false);

    clearAllErrors();
    clearSuccessMessage();
  }, [clearAllErrors, clearSuccessMessage]);

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
          handleLogout(false);
        }
      }
    } finally {
      setProfileLoading(false);
      setIsLoadingAuth(false);
    }
  }, [clearSuccessMessage, isAuthenticated, isGuest, handleLogout]);

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
          handleLogout(false);
        }
      }
    } finally {
      setNotificationsLoading(false);
    }
  }, [clearSuccessMessage, isAuthenticated, isGuest, handleLogout]);

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
            handleLogout(false);
          }
        }
      }
      setIsAuthResolved(true);
    };

    checkAuth();
  }, [token, isGuest, handleLogout]);

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
      if (err.response?.data?.detail) {
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
      // Removed unused variable "res"
      await apiClient.post('/register/', {
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
        errorMessage = Object.values(err.response.data).flat().join(' ');
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
    token, setToken: setTokenState,
    username, setUsername,
    password, setPassword,
    isGuest, setIsGuest,
    profileEmail, setProfileEmail,
    currentProfileUsername, setCurrentProfileUsername,
    currentProfileEmail, setCurrentProfileEmail,
    originalProfileEmail, setOriginalProfileEmail,
    profileLoading, setProfileLoading,
    isLoadingAuth,
    oldPassword, setOldPassword,
    newPassword, setNewPassword,
    confirmPassword, setConfirmPassword,
    notifications, setNotifications,
    notificationsLoading, setNotificationsLoading,
    error, setError,
    successMessage, setSuccessMessage,
    profileError, setProfileError,
    notificationsError, setNotificationsError,
    isAuthenticated, isAuthResolved,
    clearAllErrors, clearSuccessMessage,
    handleLogout, handleGuestLogin,
    fetchProfile, fetchNotifications,
    handleLogin, handleRegister,
  };
};
