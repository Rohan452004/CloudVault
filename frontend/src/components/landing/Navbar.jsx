import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="w-full flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur border-b border-blue-100 shadow-md sticky top-0 z-30">
    <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-blue-700 tracking-tight">
      <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 32 32"><ellipse cx="16" cy="20" rx="10" ry="6" fill="#3B82F6" fillOpacity="0.15"/><path d="M24 18a6 6 0 10-11.75-1.75A4 4 0 008 22h16a4 4 0 000-8z" fill="#3B82F6" fillOpacity="0.3"/><ellipse cx="16" cy="22" rx="8" ry="4" fill="#3B82F6" fillOpacity="0.1"/></svg>
      <span>CloudVault</span>
    </Link>
    <div className="flex gap-4 items-center">
      <Link to="/auth/login" className="text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-50 transition">Login</Link>
      <Link to="/auth/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Sign Up</Link>
    </div>
  </nav>
);

export default Navbar; 