// src/components/FileDropzone.jsx
import React, { useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAws } from "../../contexts/AwsContext";

const FileDropzone = ({ onUploadSuccess, currentPath = "", refreshKey }) => {
  const {aws} = useAws();
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleDrop = async (e) => {
    e.preventDefault();
    if (uploading) return;
    const files = e.dataTransfer.files;
    await uploadFiles(files);
  };

  const handleClick = () => {
    if (uploading) return;
    if (inputRef.current) inputRef.current.click();
  };

  const handleFileChange = async (e) => {
    if (uploading) return;
    const files = e.target.files;
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const file = files[0];
    const formData = new FormData();
    // Compose the S3 key: currentPath + file.name
    let key = currentPath ? currentPath : "";
    if (key && !key.endsWith('/')) key += '/';
    key += file.name;
    formData.append("file", file);
    formData.append("accessKeyId", aws.accessKeyId);
    formData.append("secretAccessKey", aws.secretAccessKey);
    formData.append("bucket", aws.bucket);
    formData.append("region", aws.region);
    formData.append("key", key); // Pass the S3 key to the backend

    try {
      const res = await axios.post("http://localhost:3000/api/s3/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success("File uploaded successfully");
      console.log("Uploaded:", res.data);
      // Call the callback to refresh the file list
      onUploadSuccess?.();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className={`w-full min-h-[100px] flex flex-col items-center justify-center border-2 border-dashed border-gray-600 bg-[#18181b] rounded-xl text-gray-400 text-lg cursor-pointer hover:border-emerald-400 transition p-6 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={handleClick}
    >
      <input
        type="file"
        multiple
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading ? (
        <div className="flex flex-col items-center">
          <svg className="animate-spin w-8 h-8 text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span>Uploading...</span>
        </div>
      ) : (
        <>
          <svg
            className="w-7 h-7 mb-2 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M12 16V4m0 0l-4 4m4-4l4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="4"
              y="16"
              width="16"
              height="4"
              rx="2"
              fill="#23232a"
            />
          </svg>
          <span>Drop files or click to upload</span>
        </>
      )}
    </div>
  );
};

export default FileDropzone;
