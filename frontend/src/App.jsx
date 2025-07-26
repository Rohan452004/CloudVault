import React, { useEffect, useRef, useState } from "react";
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
  const hasCredentials = user || (aws && aws.accessKeyId && aws.secretAccessKey && aws.bucket && aws.region && aws.connected);
  
  if (hasCredentials) {
    // Redirect to appropriate dashboard based on what credentials they have
    if (user) {
      return <Navigate to="/user/dashboard" replace />;
    } else if (aws && aws.accessKeyId && aws.secretAccessKey && aws.bucket && aws.region && aws.connected) {
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

function CloudCursor() {
  const [pos, setPos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const target = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const raf = useRef();
  const isMobile = useRef(false);

  useEffect(() => {
    // Detect if it's a mobile device
    isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                      ('ontouchstart' in window) || 
                      (navigator.maxTouchPoints > 0);

    const handleMove = (e) => {
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
      
      if (clientX !== undefined && clientY !== undefined) {
        target.current = { x: clientX, y: clientY };
      }
    };

    const handleTouchStart = (e) => {
      handleMove(e);
    };

    const handleTouchMove = (e) => {
      e.preventDefault(); // Prevent scrolling when touching
      handleMove(e);
    };

    // Add event listeners for both mouse and touch
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    const animate = () => {
      setPos((prev) => {
        const dx = target.current.x - prev.x;
        const dy = target.current.y - prev.y;
        return {
          x: prev.x + dx * 0.18,
          y: prev.y + dy * 0.18,
        };
      });
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  // Only hide cursor on desktop devices
  useEffect(() => {
    if (!isMobile.current) {
      document.body.style.cursor = "none";
      return () => {
        document.body.style.cursor = "";
      };
    }
  }, []);

  // Don't render on mobile if user prefers reduced motion
  if (isMobile.current && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 9999,
        width: 0,
        height: 0,
      }}
    >
      <svg
        style={{
          position: "absolute",
          left: pos.x - 24,
          top: pos.y - 18,
          width: 48,
          height: 36,
          filter: "drop-shadow(0 2px 8px rgba(59,130,246,0.15))",
          transition: "filter 0.2s",
          opacity: isMobile.current ? 0.7 : 1, // Slightly transparent on mobile
        }}
        viewBox="0 0 48 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="24" cy="24" rx="16" ry="10" fill="#3B82F6" fillOpacity="0.12"/>
        <path d="M36 20a10 10 0 10-19.6-2.9A7 7 0 0012 32h24a7 7 0 000-14z" fill="#3B82F6" fillOpacity="0.25"/>
        <ellipse cx="24" cy="28" rx="12" ry="6" fill="#3B82F6" fillOpacity="0.08"/>
        <circle cx="24" cy="14" r="9" fill="#3B82F6" fillOpacity="0.18"/>
      </svg>
    </div>
  );
}

function App() {
  return (
    <>
      <CloudCursor />
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
