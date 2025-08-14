// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuthContext


const ProtectedRoute = () => {
  const { isAuthenticated, isGuest, profileLoading } = useAuth();


  if (profileLoading) {
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
