// No changr

import React from "react";

const PathBar = ({ path = "", onNavigate }) => {
  // Split path into parts for breadcrumbs
  const parts = path ? path.split("/").filter(Boolean) : [];
  const fullParts = ["", ...parts];

  const handlePathClick = (index) => {
    if (index === 0) {
      // Root path
      onNavigate?.("");
    } else {
      // Build path up to this index
      const newPath = parts.slice(0, index).join("/") + "/";
      onNavigate?.(newPath);
    }
  };

  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-[#23232a] rounded-t-2xl text-gray-200 text-lg font-mono">
      {fullParts.map((part, idx) => (
        <span key={idx} className="flex items-center gap-2">
          {idx > 0 && <span className="text-gray-500">/</span>}
          <button
            className={`hover:underline ${idx === fullParts.length - 1 ? 'text-white font-bold' : 'text-blue-400'}`}
            onClick={() => handlePathClick(idx)}
            disabled={idx === fullParts.length - 1}
          >
            {part === "" ? "root" : part}
          </button>
        </span>
      ))}
    </div>
  );
};

export default PathBar; 