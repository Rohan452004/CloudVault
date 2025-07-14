import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/auth/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  if (!user) {
    navigate("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      <div className="bg-white/90 p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 w-full max-w-md border border-blue-100">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-2">Welcome, {user.username || user.email}!</h1>
        <p className="text-gray-600">You are now logged in to your CloudVault dashboard.</p>
        <div className="w-full flex flex-col gap-2 mt-4">
          <div className="text-gray-700"><b>Email:</b> {user.email}</div>
          <div className="text-gray-700"><b>User ID:</b> {user._id}</div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard; 