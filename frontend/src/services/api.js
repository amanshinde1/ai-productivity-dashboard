// src/services/api.js

import axios from 'axios';

// Use environment variable for API URL in production
const apiBaseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/';

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: 10000, // 10 seconds timeout to prevent hanging requests
  // withCredentials: true, // uncomment if backend uses cookie auth
});

// LocalStorage helpers for token management
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const setTokens = (access, refresh) => {
  if (access) {
    localStorage.setItem('accessToken', access);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access}`;
  }
  if (refresh) {
    localStorage.setItem('refreshToken', refresh);
  }
};

/**
 * Logout handler triggered by API failure.
 * @param {boolean} silent - if true, no logout toast will show.
 */
const handleAuthFailure = (silent = true) => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  // Emit event with silent flag so AuthContext can suppress toast if needed
  window.dispatchEvent(
    new CustomEvent('auth:logout', { detail: { silent } })
  );
};

// Add Authorization header to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.metadata = { startTime: Date.now() };
    return config;
  },
  (error) => Promise.reject(error)
);

// Token refresh handling
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

// Response interceptor to handle 401s and refresh token
apiClient.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;

    // Retry once on network error
    if (error.code === 'NETWORK_ERROR' && !originalRequest._networkRetry) {
      originalRequest._networkRetry = true;
      return apiClient(originalRequest);
    }

    if (!originalRequest._retry && error.response && error.response.status === 401) {
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // No refresh token → silent logout
        handleAuthFailure(true);
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const response = await axios.post(`${apiBaseURL}token/refresh/`, {
          refresh: refreshToken,
        });
        const { access } = response.data;
        setTokens(access, refreshToken);
        isRefreshing = false;
        onRefreshed(access);

        originalRequest.headers['Authorization'] = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        // Refresh failed → silent logout
        handleAuthFailure(true);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export {
  getAccessToken,
  getRefreshToken,
  setTokens,
  handleAuthFailure, // Can be used if manual API-triggered logout needed
};
