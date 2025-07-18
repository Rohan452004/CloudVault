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
      console.log("User set in localStorage:", user);
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const logout = async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      if (res.status === 200) {
        toast.success("Logout Successful!");
        setUser(null);
        localStorage.removeItem("user");
      } else {
        toast.error("Logout error");
      }
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  //mode 

  const [mode, setMode] = useState(() => {
  return localStorage.getItem('mode') || 'platform'; // default fallback
  });

useEffect(() => {
  localStorage.setItem('mode', mode);
}, [mode]);

  return (
    <AuthContext.Provider value={{ user, setUser, logout, mode,setMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 