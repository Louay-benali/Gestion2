import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      // Redirection en fonction du rôle
      switch (user.role) {
        case "admin":
          navigate("/admin-dashboard");
          break;
        case "operateur":
          navigate("/operateur-dashboard");
          break;
        case "responsable":
          navigate("/responsable-dashboard");
          break;
        case "technicien":
          navigate("/technicien-dashboard");
          break;
        case "magasinier":
          navigate("/magasinier-dashboard");
          break;
        default:
          navigate("/");
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3b80aa]"></div>
      </div>
    );
  }

  // If not authenticated, show the children (login page)
  if (!isAuthenticated()) {
    return children;
  }

  // Return null during redirect
  return null;
};

export default RedirectIfAuthenticated; 