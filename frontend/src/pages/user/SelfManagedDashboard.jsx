import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SelfManagedDashboard = () => {
  const [aws, setAws] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const creds = localStorage.getItem('selfS3');
    if (!creds) {
      navigate('/');
    } else {
      setAws(JSON.parse(creds));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('selfS3');
    navigate('/');
  };

  if (!aws) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      <div className="bg-white/90 backdrop-blur-2xl p-10 rounded-3xl shadow-2xl flex flex-col gap-6 w-full max-w-lg border border-gray-200 z-10 mt-12 relative">
        <button onClick={handleLogout} className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 px-4 py-2 rounded-lg shadow-sm">Logout</button>
        <h2 className="text-3xl font-extrabold text-blue-700 text-center mb-2">Self-Managed S3 Dashboard</h2>
        <p className="text-gray-600 text-center mb-4">Welcome! You are using your own AWS S3 bucket.</p>
        <div className="bg-blue-50 rounded-lg p-4 text-blue-800 text-center">
          <div><span className="font-semibold">Bucket:</span> {aws.bucket}</div>
          <div><span className="font-semibold">Region:</span> {aws.region}</div>
        </div>
        {/* TODO: Add S3 file operations here */}
      </div>
    </div>
  );
};

export default SelfManagedDashboard;
