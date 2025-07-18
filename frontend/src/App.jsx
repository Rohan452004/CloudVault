import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContextProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import RegistrationPage from "./pages/auth/RegistrationPage";
import LandingPage from "./pages/LandingPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import SelfManagedDashboard from "./pages/user/SelfManagedDashboard";
import PlatformDashboard from "./pages/user/PlatformDashboard";
import { AwsContextProvider } from './contexts/AwsContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth/login" replace />;
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
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegistrationPage />} />
                <Route path="/user/dashboard" element={<ProtectedRoute><PlatformDashboard /></ProtectedRoute>} />
                <Route path="/self/dashboard" element={<SelfManagedDashboard />} />
                {/* Add more routes as needed */}
              </Routes>
            </AwsContextProvider>
          </AuthContextProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </>
  );
}

export default App;
