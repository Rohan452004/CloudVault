import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    //   console.log("User set in localStorage:", user);
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const logout = async () => {
    try {
      // Only call logout API if user is logged in (platform user)
      if (user) {
        const res = await axiosInstance.post("/auth/logout");
        if (res.status === 200) {
          toast.success("Logout Successful!");
        } else {
          toast.error("Logout error");
        }
      }
      
      // Clear all authentication data
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("s3Credentials");
      
      // Clear AWS credentials from localStorage
      const awsCredentials = localStorage.getItem("s3Credentials");
      if (awsCredentials) {
        localStorage.removeItem("s3Credentials");
      }
      
    } catch (error) {
      console.error("Logout failed", error);
      // Even if API call fails, clear local data
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("s3Credentials");
    }
  };

  // Check if user has any type of credentials
  const hasCredentials = () => {
    const storedUser = localStorage.getItem("user");
    const storedAws = localStorage.getItem("s3Credentials");
    
    if (storedUser) return true;
    if (storedAws) {
      try {
        const awsData = JSON.parse(storedAws);
        return awsData && awsData.accessKeyId && awsData.secretAccessKey && awsData.bucket && awsData.region;
      } catch {
        return false;
      }
    }
    return false;
  };

  //mode 
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('mode') || 'platform'; // default fallback
  });

  useEffect(() => {
    localStorage.setItem('mode', mode);
  }, [mode]);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, mode, setMode, hasCredentials }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 