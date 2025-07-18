import React from "react";

const FilePreviewModal = ({ open, onClose, fileUrl, fileType, fileName }) => {
  if (!open) return null;

  const isImage = fileType && fileType.startsWith("image/");
  const isVideo = fileType && fileType.startsWith("video/");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-[#23232a] rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-2xl font-bold"
        >
          &times;
        </button>
        <h3 className="text-lg font-semibold text-white mb-4">{fileName}</h3>
        <div className="flex items-center justify-center min-h-[300px]">
          {isImage ? (
            <img src={fileUrl} alt={fileName} className="max-h-[400px] max-w-full rounded shadow" />
          ) : isVideo ? (
            <video controls width="100%" style={{ maxHeight: 400 }}>
              <source src={fileUrl} type={fileType} />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-gray-400 text-center w-full">Preview not available for this file type.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal; 