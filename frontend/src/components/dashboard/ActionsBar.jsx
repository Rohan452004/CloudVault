import React from "react";

const ActionsBar = ({ onNewFolder, onFilter }) => (
  <div className="flex gap-4 items-center">
    <button
      onClick={onNewFolder}
      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold shadow transition"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      New Folder
    </button>
    <button
      onClick={onFilter}
      className="flex items-center gap-2 bg-[#23232a] hover:bg-[#23232a]/80 text-white px-4 py-2 rounded-lg font-semibold border border-[#333] shadow transition"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      Filter
    </button>
  </div>
);

export default ActionsBar; 