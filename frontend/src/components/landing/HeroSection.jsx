import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaCloud, FaUserShield } from "react-icons/fa";
import { BsFillPersonFill } from "react-icons/bs";
import { useAuth } from "../../contexts/AuthContext";
import { useAws } from "../../contexts/AwsContext";
import { toast } from "react-hot-toast";


const HeroSection = () => {
  const {aws, setAws} = useAws();
  const navigate = useNavigate();
  const { mode, setMode } = useAuth();

  const handleSelfSubmit = async (e) => {
    e.preventDefault();

    const payload = {
     mode: mode,
     accessKeyId: aws.accessKeyId,
     secretAccessKey: aws.secretAccessKey,
     bucket: aws.bucket,
     region: aws.region,
    };

    

    try {

    const res = await fetch('http://localhost:3000/api/s3/self-connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    const data = await res.json();

    if(res.ok){
      console.log("Connected to self-managed S3:", data);
       setAws(payload);
       console.log("AWS credentials set in context:", aws);
       toast.success("Connected to your AWS S3 bucket successfully!");
       navigate('/self/dashboard');
    } 
    else{
      alert(data.message || 'Error connecting AWS');
    }

  }catch(err){
    console.error(err);
    toast.error("Failed to connect to AWS S3. Please check your credentials.");
  }

  };

  return (
    <section className="relative w-full bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 overflow-hidden pt-12 pb-24">
      {/* Animated Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-[400px] h-[400px] bg-gradient-to-br from-blue-400 via-blue-200 to-blue-100 opacity-40 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute top-1/2 right-0 w-60 h-60 bg-gradient-to-tr from-blue-300 via-blue-200 to-blue-100 opacity-30 rounded-full blur-2xl animate-pulse -z-10" />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-10 relative z-10">
        {/* Left: Headline and Description */}
        <div className="flex-1 flex flex-col gap-6 items-start justify-center">
          <span className="uppercase tracking-widest text-xs text-blue-500 font-semibold mb-2">Your Secure Cloud</span>
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-700 leading-tight mb-2 drop-shadow-lg">
            Effortless <span className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-300 text-transparent bg-clip-text">Cloud Storage</span>
          </h1>
          <p className="text-xl text-gray-700 mb-4 max-w-lg">
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
        {/* Right: Illustration */}
        <div className="flex-1 flex justify-center items-center">
          <div className="relative">
            <svg className="w-96 h-96 drop-shadow-2xl" fill="none" viewBox="0 0 96 96">
              <ellipse cx="48" cy="60" rx="32" ry="20" fill="#3B82F6" fillOpacity="0.12"/>
              <path d="M72 54a20 20 0 10-39.2-5.8A14 14 0 0024 72h48a14 14 0 000-28z" fill="#3B82F6" fillOpacity="0.25"/>
              <ellipse cx="48" cy="66" rx="24" ry="12" fill="#3B82F6" fillOpacity="0.08"/>
              <circle cx="48" cy="38" r="18" fill="#3B82F6" fillOpacity="0.18"/>
              <path d="M40 48l8 8 16-16" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-blue-100 px-6 py-3 rounded-full shadow text-blue-700 font-semibold text-lg">
              End-to-end encrypted
            </div>
          </div>
        </div>
      </div>
      {/* Storage Mode Selection */}
      <div id="storage-mode" onClick={() => setMode('self')} className="max-w-4xl mx-auto mt-20 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-blue-700 mb-8">Choose Your Storage Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Self-Managed Card */}
          <div className={`relative bg-white/90 border-2 rounded-2xl shadow-lg p-8 flex flex-col items-center transition-all duration-300 cursor-pointer ${mode === 'self' ? 'border-blue-600 scale-105 ring-4 ring-blue-100' : 'border-blue-100 hover:scale-105'}`} onClick={() => setMode('self')}>
            <div className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full ${mode === 'self' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}><FaUserShield size={22} /></div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">Self-Managed S3</h3>
            <p className="text-gray-600 text-center mb-4">Connect your own AWS S3 bucket for full control and privacy. You manage your own storage and credentials.</p>
            
            {mode === 'self' && (
              <form className="w-full flex flex-col gap-3 mt-2" onClick={e => e.stopPropagation()} onSubmit={handleSelfSubmit}>
                <input type="text" placeholder="AWS Access Key ID" value={aws.accessKeyId} onChange={e => setAws(a => ({ ...a, accessKeyId: e.target.value }))} className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                <input type="password" placeholder="AWS Secret Access Key" value={aws.secretAccessKey} onChange={e => setAws(a => ({ ...a, secretAccessKey: e.target.value }))} className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                <input type="text" placeholder="S3 Bucket Name" value={aws.bucket} onChange={e => setAws(a => ({ ...a, bucket: e.target.value }))} className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                <input type="text" placeholder="AWS Region (e.g. us-east-1)" value={aws.region} onChange={e => setAws(a => ({ ...a, region: e.target.value }))} className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition" required />
                <button type="submit" className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-2">Continue</button>
              </form>
            )}


          </div>
          {/* Platform-Managed Card */}
          <div
            onClick={() => {
              setMode('platform');
              navigate('/auth/login'); // or '/auth/register'
            }}
            className={`relative bg-white/90 border-2 rounded-2xl shadow-lg p-8 flex flex-col items-center transition-all duration-300 cursor-pointer ${mode === 'platform' ? 'border-blue-600 scale-105 ring-4 ring-blue-100' : 'border-blue-100 hover:scale-105'}`}
          >
            <div className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full ${mode === 'platform' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-600'}`}><FaCloud size={22} /></div>
            <h3 className="text-xl font-bold text-blue-700 mb-2">Platform-Managed S3</h3>
            <p className="text-gray-600 text-center mb-4">Let CloudVault manage your storage securely. Sign up or log in to use our managed S3 bucket with your own private folder.</p>
            {/* Always show the login/register buttons for platform mode */}
            {mode === 'platform' && (
              <div className="w-full flex flex-col gap-3 mt-2 items-center">
                <Link to="/auth/register">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Sign Up</button>
                </Link>
                <Link to="/auth/login">
                  <button className="bg-white text-blue-700 border border-blue-400 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">Login</button>
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection; 