// src/components/FileDropzone.jsx
import React, { useRef, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useAws } from "../../contexts/AwsContext";

const FileDropzone = ({ onUploadSuccess, currentPath = "", refreshKey }) => {
  const {aws} = useAws();
  const inputRef = useRef();
  const folderInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleFolderClick = () => {
    if (uploading) return;
    if (folderInputRef.current) folderInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    if (uploading) return;
    const files = e.target.files;
    await uploadFiles(files);
  };

  const handleFolderChange = async (e) => {
    if (uploading) return;
    const files = e.target.files;
    await uploadFiles(files, true);
  };

  const PART_SIZE = 5 * 1024 * 1024; // 5MB

  const uploadFiles = async (files, isFolder = false) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let key = currentPath ? currentPath : "";
      if (key && !key.endsWith('/')) key += '/';
      // If folder upload, use webkitRelativePath to preserve structure
      if (isFolder && file.webkitRelativePath) {
        key += file.webkitRelativePath;
      } else {
        key += file.name;
      }
      let uploadId = null;
      try {
        if (file.size < PART_SIZE) {
          // Normal upload for files < 5MB
          const presignRes = await axiosInstance.post("/self/s3/get-upload-url", {
            accessKeyId: aws.accessKeyId,
            secretAccessKey: aws.secretAccessKey,
            bucket: aws.bucket,
            region: aws.region,
            key,
            contentType: file.type || 'application/octet-stream',
          });
          const uploadUrl = presignRes.data.url;
          const uploadRes = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type || 'application/octet-stream' },
          });
          if (!uploadRes.ok) throw new Error('S3 upload failed');
          setProgress(100);
          toast.success(`File \"${file.name}\" uploaded successfully!`);
          onUploadSuccess?.();
        } else {
          // Multipart upload for files >= 5MB
          const { data: { uploadId: newUploadId } } = await axiosInstance.post("/self/s3/initiate-multipart-upload", {
            accessKeyId: aws.accessKeyId,
            secretAccessKey: aws.secretAccessKey,
            bucket: aws.bucket,
            region: aws.region,
            key,
            contentType: file.type,
          });
          uploadId = newUploadId;
          const parts = [];
          for (let start = 0, partNumber = 1; start < file.size; start += PART_SIZE, partNumber++) {
            parts.push({ partNumber, start, end: Math.min(start + PART_SIZE, file.size) });
          }
          const { data: { urls } } = await axiosInstance.post("/self/s3/get-multipart-upload-urls", {
            accessKeyId: aws.accessKeyId,
            secretAccessKey: aws.secretAccessKey,
            bucket: aws.bucket,
            region: aws.region,
            key,
            uploadId,
            parts: parts.map(p => p.partNumber),
            contentType: file.type,
          });
          const etags = [];
          for (let j = 0; j < parts.length; j++) {
            const { partNumber, start, end } = parts[j];
            const url = urls.find(u => u.partNumber === partNumber).url;
            const blob = file.slice(start, end);
            const res = await fetch(url, {
              method: "PUT",
              body: blob,
              headers: { "Content-Type": file.type },
            });
            if (!res.ok) throw new Error(`Upload failed for part ${partNumber}`);
            const etag = res.headers.get("ETag")?.replace(/"/g, "");
            etags.push({ ETag: etag, PartNumber: partNumber });
            setProgress(Math.round(((j + 1) / parts.length) * 100));
          }
          await axiosInstance.post("/self/s3/complete-multipart-upload", {
            accessKeyId: aws.accessKeyId,
            secretAccessKey: aws.secretAccessKey,
            bucket: aws.bucket,
            region: aws.region,
            key,
            uploadId,
            parts: etags,
          });
          toast.success(`File \"${file.name}\" uploaded successfully!`);
          onUploadSuccess?.();
        }
      } catch (error) {
        console.error("Upload error:", error);
        if (uploadId) {
          await axiosInstance.post("/self/s3/abort-multipart-upload", {
            accessKeyId: aws.accessKeyId,
            secretAccessKey: aws.secretAccessKey,
            bucket: aws.bucket,
            region: aws.region,
            key,
            uploadId,
          });
        }
        toast.error(`Upload failed for \"${file.name}\"`);
      }
      setProgress(0); // Reset progress for next file
    }
    setUploading(false);
  };

  return (
    <div
      className={`w-full min-h-[100px] flex flex-col items-center justify-center border-2 border-dashed border-gray-600 bg-[#18181b] rounded-xl text-gray-400 text-lg hover:border-emerald-400 transition p-6 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        multiple
        ref={inputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {/* Folder upload input */}
      <input
        type="file"
        ref={folderInputRef}
        className="hidden"
        onChange={handleFolderChange}
        webkitdirectory="true"
        directory="true"
        multiple
        disabled={uploading}
      />
      {/* Upload buttons */}
      {!uploading && (
        <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full">
          {/* Upload Files Half */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#23232a] rounded-l-xl sm:rounded-xl">
            <button
              type="button"
              onClick={handleClick}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow transition w-full justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><rect x="4" y="16" width="16" height="4" rx="2" fill="#23232a" /></svg>
              Upload Files
            </button>
          </div>
          {/* Divider */}
          <div className="hidden sm:flex flex-col justify-center">
            <div className="w-px h-12 bg-gray-700 mx-2" />
          </div>
          {/* Upload Folder Half */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-[#23232a] rounded-r-xl sm:rounded-xl">
            <button
              type="button"
              onClick={handleFolderClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition w-full justify-center"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Upload Folder
            </button>
          </div>
        </div>
      )}
      {uploading && (
        <div className="flex flex-col items-center">
          <svg className="animate-spin w-8 h-8 text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span>Uploading...</span>
        </div>
      )}
      {uploading && (
        <div className="w-full flex flex-col items-center mt-2">
          <div className="w-full bg-gray-700 rounded h-2 mb-2">
            <div className="bg-emerald-500 h-2 rounded" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-gray-300 text-sm mb-1">{progress}%</span>
        </div>
      )}
      {!uploading && (
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