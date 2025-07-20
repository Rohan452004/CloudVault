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
      <div
        className="bg-[#23232a] rounded-lg shadow-lg p-0 max-w-[70vw] w-[70vw] max-h-[70vh] h-[70vh] relative flex flex-col"
        style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.7)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-6 text-gray-400 hover:text-white text-3xl font-bold z-10"
        >
          &times;
        </button>
        <h3 className="text-xl font-semibold text-white mb-2 mt-4 ml-8 mr-16 truncate" style={{ maxWidth: "calc(100% - 120px)" }}>{fileName}</h3>
        <div className="flex-1 flex items-center justify-center w-full min-h-0 p-4">
          {isImage ? (
            <img src={fileUrl} alt={fileName} className="max-h-full max-w-full rounded shadow" style={{ objectFit: "contain", width: "100%", height: "100%" }} />
          ) : isVideo ? (
            <video controls className="w-full h-full max-h-full max-w-full rounded bg-black" style={{ objectFit: "contain" }}>
              <source src={fileUrl} type={fileType} />
              Your browser does not support the video tag.
            </video>
          ) : isAudio ? (
            <div className="w-full flex flex-col items-center justify-center">
              <audio controls className="w-full">
                <source src={fileUrl} type={fileType} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          ) : isPdf ? (
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-full rounded"
              style={{ minHeight: 0, border: 0 }}
            />
          ) : isText ? (
            <div className="w-full h-full max-h-full overflow-auto bg-black text-green-200 rounded p-6 text-sm font-mono">
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