import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import { FaHome } from "react-icons/fa";


const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", { email, password });
      toast.success("Login successful!");
      setUser(response.data.user);
      navigate("/user/Dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const response = await axiosInstance.post("/auth/googlelogin", {
          token: tokenResponse.access_token,
        });
        toast.success("Google login successful!");
        setUser(response.data.user);
        navigate("/user/dashboard");
      } catch (error) {
        toast.error(error.response?.data?.message || "Google login failed!");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed!");
    },
    flow: "implicit",
  });

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
        onSubmit={handleLogin}
        className="bg-white/90 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl flex flex-col gap-6 w-full max-w-md border border-gray-200 z-10"
      >
        <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-2">Sign in to CloudVault</h2>
        <p className="text-gray-500 text-center mb-4">Welcome back! Please enter your details.</p>
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
        <button
          type="submit"
          className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          onClick={() => googleLogin()}
          className="bg-white border border-blue-400 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2"
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? "Signing in..." : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.64 2.36 30.21 0 24 0 14.82 0 6.73 5.48 2.69 13.44l7.98 6.2C12.13 13.13 17.62 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.03l7.18 5.59C43.93 37.36 46.1 31.41 46.1 24.55z"/><path fill="#FBBC05" d="M9.67 28.09c-1.13-3.36-1.13-6.97 0-10.33l-7.98-6.2C-1.13 17.09-1.13 30.91 1.69 37.91l7.98-6.2z"/><path fill="#EA4335" d="M24 44c6.21 0 11.64-2.05 15.47-5.59l-7.18-5.59c-2.01 1.35-4.59 2.15-8.29 2.15-6.38 0-11.87-3.63-13.33-8.65l-7.98 6.2C6.73 42.52 14.82 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></g></svg>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
        <p className="text-center text-sm mt-2">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-blue-600 hover:underline font-semibold">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage; 