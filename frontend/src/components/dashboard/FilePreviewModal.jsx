import React from "react";

const FilePreviewModal = ({ open, onClose, fileUrl, fileType, fileName }) => {
  if (!open) return null;

  const isImage = /image\//.test(fileType);
  const isPdf = fileType === "application/pdf" || fileName?.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#18181b] rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#23232a]">
          <span className="text-lg font-semibold text-gray-200 truncate">{fileName}</span>
          <button onClick={onClose} className="text-gray-400 hover:text-red-400 text-2xl font-bold">&times;</button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          {isImage ? (
            <img src={fileUrl} alt={fileName} className="max-h-[70vh] max-w-full rounded shadow" />
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-[70vh] rounded shadow bg-white"
              frameBorder="0"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <p>Preview not available for this file type.</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal; 