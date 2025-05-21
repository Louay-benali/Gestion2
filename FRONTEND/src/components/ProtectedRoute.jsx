import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b80aa]"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin-dashboard" />;
      case "operateur":
        return <Navigate to="/operateur-dashboard" />;
      case "responsable":
        return <Navigate to="/responsable-dashboard" />;
      case "technicien":
        return <Navigate to="/technicien-dashboard" />;
      case "magasinier":
        return <Navigate to="/magasinier-dashboard" />;
      default:
        return <Navigate to="/" />;
    }
  }

  // If authenticated and has correct role, render the children
  return children;
};

export default ProtectedRoute; 