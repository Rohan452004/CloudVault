import React, { useRef } from "react";

const FileDropzone = ({ onDrop, onClick }) => {
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    if (onDrop) onDrop(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (inputRef.current) inputRef.current.click();
    if (onClick) onClick();
  };

  const handleFileChange = (e) => {
    if (onDrop) onDrop(e.target.files);
  };

  return (
    <div
      className="w-full min-h-[100px] flex flex-col items-center justify-center border-2 border-dashed border-gray-600 bg-[#18181b] rounded-xl text-gray-400 text-lg cursor-pointer hover:border-emerald-400 transition p-6"
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={handleClick}
    >
      <input
        type="file"
        multiple
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <svg className="w-7 h-7 mb-2 text-emerald-400" fill="none" viewBox="0 0 24 24"><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="16" width="16" height="4" rx="2" fill="#23232a"/></svg>
      <span>Drop files or click to upload</span>
    </div>
  );
};

export default FileDropzone; 