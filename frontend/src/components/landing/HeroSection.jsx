import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => (
  <section className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-4 py-24 gap-10 relative z-10">
    {/* Animated Gradient Blobs */}
    <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-blue-400 via-blue-200 to-blue-100 opacity-40 rounded-full blur-3xl animate-pulse -z-10" />
    <div className="absolute top-1/2 right-0 w-60 h-60 bg-gradient-to-tr from-blue-300 via-blue-200 to-blue-100 opacity-30 rounded-full blur-2xl animate-pulse -z-10" />

    <div className="flex-1 flex flex-col gap-6 items-start justify-center">
      <span className="uppercase tracking-widest text-xs text-blue-500 font-semibold mb-2">Your Secure Cloud</span>
      <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 leading-tight mb-2 drop-shadow-lg">
        Effortless <span className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 text-transparent bg-clip-text">Cloud Storage</span> for Everyone
      </h1>
      <p className="text-lg text-gray-700 mb-4 max-w-md">
        Store, access, and protect your files in the cloud. Fast, secure, and always available.
      </p>
      <div className="flex gap-4 mt-2">
        <Link to="/auth/register">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow hover:bg-blue-700 transition text-lg">Get Started</button>
        </Link>
        <Link to="/auth/login">
          <button className="bg-white text-blue-700 border border-blue-400 px-8 py-3 rounded-xl font-semibold shadow hover:bg-blue-50 transition text-lg">Login</button>
        </Link>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className="text-gray-500 text-sm">Trusted by 1,000+ users</span>
      </div>
    </div>
    <div className="flex-1 flex justify-center items-center">
      <div className="relative">
        <svg className="w-72 h-72 drop-shadow-2xl" fill="none" viewBox="0 0 64 64">
          <ellipse cx="32" cy="40" rx="20" ry="12" fill="#3B82F6" fillOpacity="0.15"/>
          <path d="M48 36a12 12 0 10-23.5-3.5A8 8 0 0016 44h32a8 8 0 000-16z" fill="#3B82F6" fillOpacity="0.3"/>
          <ellipse cx="32" cy="44" rx="16" ry="8" fill="#3B82F6" fillOpacity="0.1"/>
          <circle cx="32" cy="28" r="10" fill="#3B82F6" fillOpacity="0.2"/>
          <path d="M28 32l4 4 8-8" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-100 px-4 py-2 rounded-full shadow text-blue-700 font-semibold text-sm">
          End-to-end encrypted
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection; 