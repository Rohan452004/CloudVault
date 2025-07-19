import React from "react";
import { FaThLarge, FaList } from "react-icons/fa";

const ActionsBar = ({ onNewFolder, onFilterChange, viewMode = 'list', onViewModeChange }) => {
  const handleNewFolder = () => {
    const folderName = window.prompt("Enter new folder name:");
    if (folderName && folderName.trim()) {
      onNewFolder?.(folderName.trim());
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <button
        onClick={handleNewFolder}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg font-semibold shadow transition"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        New Folder
      </button>
      <select
        onChange={e => onFilterChange?.(e.target.value)}
        className="bg-[#23232a] text-white px-4 py-2 rounded-lg font-semibold border border-[#333] shadow transition"
        style={{ minWidth: 120 }}
      >
        <option value="all">All</option>
        <option value="files">Files</option>
        <option value="folders">Folders</option>
        <option value="images">Images</option>
        <option value="videos">Videos</option>
      </select>
      <div className="flex gap-2 ml-2">
        <button
          onClick={() => onViewModeChange?.('list')}
          className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-[#23232a] text-gray-300'} hover:bg-blue-500 transition`}
          title="List View"
        >
          <FaList className="w-5 h-5" />
        </button>
        <button
          onClick={() => onViewModeChange?.('grid')}
          className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-[#23232a] text-gray-300'} hover:bg-blue-500 transition`}
          title="Grid View"
        >
          <FaThLarge className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ActionsBar; 