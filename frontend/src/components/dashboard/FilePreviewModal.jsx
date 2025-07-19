import React, { useEffect, useState } from "react";

const FilePreviewModal = ({ open, onClose, fileUrl, fileType, fileName }) => {
  const [textContent, setTextContent] = useState("");
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (open && fileType && (fileType.startsWith("text/") || fileType === "application/json" || fileType === "application/xml")) {
      setLoadingText(true);
      fetch(fileUrl)
        .then(res => res.text())
        .then(text => setTextContent(text))
        .catch(() => setTextContent("Failed to load text preview."))
        .finally(() => setLoadingText(false));
    } else {
      setTextContent("");
      setLoadingText(false);
    }
  }, [open, fileUrl, fileType]);

  if (!open) return null;

  const isImage = fileType && fileType.startsWith("image/");
  const isVideo = fileType && fileType.startsWith("video/");
  const isAudio = fileType && fileType.startsWith("audio/");
  const isPdf = fileType === "application/pdf";
  const isText = fileType && (fileType.startsWith("text/") || fileType === "application/json" || fileType === "application/xml");
  const isOffice = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.ms-excel",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
    "application/vnd.ms-powerpoint.presentation.macroEnabled.12" // .pptm
  ].includes(fileType);

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
        <div className="flex items-center justify-center min-h-[300px] mt-8">
          {isImage ? (
            <img src={fileUrl} alt={fileName} className="max-h-[400px] max-w-full rounded shadow" />
          ) : isVideo ? (
            <video controls width="100%" style={{ maxHeight: 400 }}>
              <source src={fileUrl} type={fileType} />
              Your browser does not support the video tag.
            </video>
          ) : isAudio ? (
            <audio controls className="w-full">
              <source src={fileUrl} type={fileType} />
              Your browser does not support the audio tag.
            </audio>
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full"
              style={{ minHeight: 400, border: 0 }}
            />
          ) : isText ? (
            <div className="w-full max-h-[400px] overflow-auto bg-black text-green-200 rounded p-3 text-xs font-mono">
              {loadingText ? "Loading..." : textContent}
            </div>
          ) : isOffice ? (
            <div className="text-gray-400 text-center w-full flex flex-col items-center gap-2">
              <span>Preview not available for this file type.</span>
              <a href={fileUrl} download={fileName} className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 transition">Download</a>
            </div>
          ) : (
            <div className="text-gray-400 text-center w-full flex flex-col items-center gap-2">
              <span>Preview not available for this file type.</span>
              <a href={fileUrl} download={fileName} className="bg-blue-600 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 transition">Download</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal; 