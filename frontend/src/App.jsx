import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContextProvider, useAuth } from "./contexts/AuthContext";
import { useAws } from "./contexts/AwsContext";
import LoginPage from "./pages/auth/LoginPage";
import RegistrationPage from "./pages/auth/RegistrationPage";
import LandingPage from "./pages/LandingPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import SelfManagedDashboard from "./pages/user/SelfManagedDashboard";
import PlatformDashboard from "./pages/user/PlatformDashboard";
import { AwsContextProvider } from './contexts/AwsContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Route that prevents authenticated users from accessing public pages
function PublicRoute({ children }) {
  const { user } = useAuth();
  const { aws } = useAws();
  
  // Check if user has platform credentials OR self-managed credentials
  const hasCredentials = user || (aws && aws.accessKeyId && aws.secretAccessKey && aws.bucket && aws.region);
  
  if (hasCredentials) {
    // Redirect to appropriate dashboard based on what credentials they have
    if (user) {
      return <Navigate to="/user/dashboard" replace />;
    } else if (aws && aws.accessKeyId && aws.secretAccessKey && aws.bucket && aws.region) {
      return <Navigate to="/self/dashboard" replace />;
    }
  }
  
  return children;
}

// Route that requires platform authentication
function PlatformProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
  return children;
}

// Route that requires self-managed AWS credentials
function SelfManagedProtectedRoute({ children }) {
  const { aws } = useAws();
  const hasCredentials = aws && aws.accessKeyId && aws.secretAccessKey && aws.bucket && aws.region;
  
  if (!hasCredentials) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <AuthContextProvider>
            <AwsContextProvider>
              <Routes>
                {/* Public routes - redirect if authenticated */}
                <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/auth/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/auth/register" element={<PublicRoute><RegistrationPage /></PublicRoute>} />
                
                {/* Protected routes */}
                <Route path="/user/dashboard" element={<PlatformProtectedRoute><PlatformDashboard /></PlatformProtectedRoute>} />
                <Route path="/self/dashboard" element={<SelfManagedProtectedRoute><SelfManagedDashboard /></SelfManagedProtectedRoute>} />
                
                {/* Catch all - redirect to appropriate dashboard or landing */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AwsContextProvider>
          </AuthContextProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
