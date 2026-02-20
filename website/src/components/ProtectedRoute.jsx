import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if the student token exists in storage
  const token = localStorage.getItem('studentToken');

  if (!token) {
    // If no token, redirect to Login Page
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected page (The Child Component)
  return children;
};

export default ProtectedRoute;