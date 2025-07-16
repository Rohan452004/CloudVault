import React from "react";

const PathBar = ({ path = "/", onNavigate }) => {
  // Split path into parts for breadcrumbs
  const parts = typeof path === "string"
    ? path.split("/").filter(Boolean)
    : Array.isArray(path) ? path : [];
  const fullParts = ["/", ...parts];

  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-[#23232a] rounded-t-2xl text-gray-200 text-lg font-mono">
      {fullParts.map((part, idx) => (
        <span key={idx} className="flex items-center gap-2">
          {idx > 0 && <span className="text-gray-500">/</span>}
          <button
            className={`hover:underline ${idx === fullParts.length - 1 ? 'text-white font-bold' : 'text-blue-400'}`}
            onClick={() => onNavigate && onNavigate(fullParts.slice(1, idx + 1).join("/"))}
            disabled={idx === fullParts.length - 1}
          >
            {part === "/" ? "/" : part}
          </button>
        </span>
      ))}
    </div>
  );
};

export default PathBar; 