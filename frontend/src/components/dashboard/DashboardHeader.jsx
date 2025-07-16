import React from "react";

const DashboardHeader = ({ title, bucketName, onLogout, userName }) => (
  <header className="w-full flex items-center justify-between px-8 py-4 bg-[#18181b] border-b border-[#23232a] shadow-md">
    <div className="flex items-center gap-3">
      <span className="text-2xl font-extrabold text-white flex items-center gap-2">
        <span className="inline-block w-7 h-7 bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 mx-auto" fill="none" viewBox="0 0 24 24"><path d="M7 17l5-5 5 5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
        {title || "CloudVault"}
      </span>
      {bucketName && (
        <span className="ml-4 px-3 py-1 rounded bg-[#23232a] text-green-400 text-sm font-mono">{bucketName}</span>
      )}
    </div>
    <div className="flex items-center gap-4">
      {userName && <span className="text-gray-300 font-semibold text-base">{userName}</span>}
      <button onClick={onLogout} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition">Disconnect</button>
    </div>
  </header>
);

export default DashboardHeader; 