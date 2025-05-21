import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import OperateurDashboard from "./pages/OperateurDashboard";
import ResponsableDashboard from "./pages/ResponsableDashboard";
import TechnicienDashboard from "./pages/TechnicienDashboard";
import MagasinierDashboard from "./pages/MagasinierDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <AuthProvider>
      <ToastContainer />
      <Router>
        <Routes>
          {/* Public routes that redirect if already authenticated */}
          <Route path="/" element={
            <RedirectIfAuthenticated>
              <AuthPage />
            </RedirectIfAuthenticated>
          } />
          <Route path="/email-verification" element={<EmailVerificationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          {/* Profile route accessible to all authenticated users */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes with role-based access */}
          <Route 
            path="/operateur-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["operateur"]}>
                <OperateurDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/responsable-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["responsable"]}>
                <ResponsableDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/technicien-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["technicien"]}>
                <TechnicienDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/magasinier-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["magasinier"]}>
                <MagasinierDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
