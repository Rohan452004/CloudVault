import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FaHome } from "react-icons/fa";

const RegistrationPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await axiosInstance.post("/auth/register", { username, email, password });
      toast.success("Registration successful! Please login.");
      navigate("/auth/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 overflow-hidden">
      {/* Back to Home Button */}
      <Link to="/" className="fixed top-4 right-4 z-20 flex items-center gap-2 bg-white/90 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-50 transition text-sm">
        <FaHome className="w-4 h-4" />
        Back Home
      </Link>
      {/* Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400 via-blue-200 to-blue-100 opacity-30 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tr from-blue-300 via-blue-200 to-blue-100 opacity-20 rounded-full blur-2xl animate-pulse -z-10" />

      <form
        onSubmit={handleRegister}
        className="bg-white/90 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl flex flex-col gap-6 w-full max-w-md border border-gray-200 z-10"
      >
        <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-0">Create your account</h2>
        <p className="text-gray-500 text-center mb-4">Sign up to get started with CloudVault.</p>
        <input
          type="text"
          placeholder="Name"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          disabled={isLoading}
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
        <p className="text-center text-sm mt-2">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-blue-600 hover:underline font-semibold">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default RegistrationPage; 