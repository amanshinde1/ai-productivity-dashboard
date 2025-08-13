// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuthContext

/**
 * ProtectedRoute Component
 *
 * This component acts as a wrapper for routes that require authentication.
 * It checks the authentication status from AuthContext.
 * If the user is authenticated or in guest mode, it renders the child routes (Outlet).
 * Otherwise, it redirects the user to the login page.
 *
 * Props:
 * - children: React nodes to be rendered if the user is authenticated. (Used with <Outlet />)
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isGuest, profileLoading } = useAuth();

  // Show nothing while authentication status is being determined
  if (profileLoading) {
    // You could also render a small loading spinner here if desired
    return null;
  }

  // If authenticated or in guest mode, render the nested routes
  if (isAuthenticated || isGuest) {
    return <Outlet />;
  }

  // If not authenticated and not in guest mode, redirect to login
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;
