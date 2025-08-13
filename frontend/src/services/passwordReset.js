// src/services/passwordReset.js
import { apiClient } from './api'; // reuse your configured Axios instance

// Request reset link
export const requestPasswordReset = (email) => {
  return apiClient.post('/password-reset/request/', { email });
};

// Confirm reset with new password
export const confirmPasswordReset = (uid, token, new_password) => {
  return apiClient.post('/password-reset/confirm/', {
    uid,
    token,
    new_password
  });
};
