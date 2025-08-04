import React, { useRef, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const PART_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CONCURRENT_PARTS = 3;

const FileDropzone = ({ onUploadSuccess, currentPath = "", storage, setStorage }) => {
  const { user } = useAuth();
  const inputRef = useRef();
  const folderInputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState("");

  const isOverLimit = storage && storage.used >= storage.total;

  const handleDrop = async (e) => {
    e.preventDefault();
    if (uploading || isOverLimit) return;
    await uploadFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    if (uploading || isOverLimit) return;
    inputRef.current?.click();
  };

  const handleFolderClick = () => {
    if (uploading || isOverLimit) return;
    folderInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    if (uploading || isOverLimit) return;
    await uploadFiles(e.target.files);
    e.target.value = null;
  };

  const handleFolderChange = async (e) => {
    if (uploading || isOverLimit) return;
    await uploadFiles(e.target.files, true);
    e.target.value = null;
  };

  const uploadFiles = async (files, isFolder = false) => {
    if (!files || files.length === 0 || !user?._id) return;
    // Check if all files fit within the storage cap
    const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    if (storage && storage.used + totalSize > storage.total) {
      toast.error("Cannot upload. Storage limit exceeded!");
      return;
    }
    setUploading(true);
    setProgress(0);
    let totalUploaded = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setCurrentFile(file.name);
      setProgress(0);
      let key = currentPath ? `${currentPath.replace(/\/$/, "")}/` : "";
      if (isFolder && file.webkitRelativePath) {
        key += file.webkitRelativePath;
      } else {
        key += file.name;
      }
      let uploadId = null;
      try {
        if (file.size < PART_SIZE) {
          // Single Part Upload
          const { data } = await axiosInstance.post(
            `platform/s3/${user._id}/get-upload-url`,
            { key, contentType: file.type || 'application/octet-stream' }
          );
          await fetch(data.url, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type || 'application/octet-stream' },
          });
          setProgress(100);
        } else {
          // Multipart Upload
          const { data: { uploadId: newUploadId } } = await axiosInstance.post(
            `platform/s3/${user._id}/initiate-multipart-upload`,
            { key, contentType: file.type }
          );
          uploadId = newUploadId;

          const numParts = Math.ceil(file.size / PART_SIZE);
          const partNumbers = Array.from({ length: numParts }, (_, i) => i + 1);

          const { data: { urls } } = await axiosInstance.post(
            `platform/s3/${user._id}/get-multipart-upload-urls`,
            { key, uploadId, parts: partNumbers }
          );

          // Throttle multipart uploads
          const etags = [];
          let partIndex = 0;
          while (partIndex < urls.length) {
            const batch = urls.slice(partIndex, partIndex + MAX_CONCURRENT_PARTS);
            const results = await Promise.all(batch.map(async ({ partNumber, url }) => {
            const start = (partNumber - 1) * PART_SIZE;
            const end = Math.min(start + PART_SIZE, file.size);
            const blob = file.slice(start, end);
            const res = await fetch(url, { method: "PUT", body: blob });
              if (!res.ok) throw new Error(`Upload failed for part ${partNumber}`);
              setProgress(Math.round(((partNumber) / numParts) * 100));
            return { ETag: res.headers.get("ETag")?.replace(/"/g, ""), PartNumber: partNumber };
          }));
            etags.push(...results);
            partIndex += MAX_CONCURRENT_PARTS;
          }

          await axiosInstance.post(
            `platform/s3/${user._id}/complete-multipart-upload`,
            { key, uploadId, parts: etags }
          );
          setProgress(100);
        }
        toast.success(`"${file.name}" uploaded successfully!`);
        totalUploaded += file.size;
        if (setStorage) setStorage(s => ({ ...s, used: s.used + file.size }));
        onUploadSuccess?.();
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Upload failed for "${file.name}"`);
        if (uploadId) {
          await axiosInstance.post(
            `platform/s3/${user._id}/abort-multipart-upload`,
            { key, uploadId }
          );
        }
      }
    }
    setUploading(false);
    setCurrentFile("");
    setProgress(0);
  };

      return (
    <div
      className={`w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-600 bg-[#18181b] rounded-xl text-gray-400 p-6 transition-all duration-300 ${uploading ? 'opacity-80' : isOverLimit ? 'opacity-60' : 'hover:border-emerald-400'}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input type="file" multiple ref={inputRef} className="hidden" onChange={handleFileChange} disabled={uploading || isOverLimit} />
      <input type="file" ref={folderInputRef} className="hidden" onChange={handleFolderChange} webkitdirectory="true" directory="true" multiple disabled={uploading || isOverLimit} />
      {isOverLimit && (
        <div className="text-red-400 font-semibold mb-2">Storage limit reached. Delete files to upload more.</div>
      )}
      {uploading ? (
        <div className="flex flex-col items-center text-white w-full">
          <svg className="animate-spin w-8 h-8 text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="font-semibold truncate max-w-full px-4">Uploading {currentFile}...</span>
          <div className="w-full flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-700 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-gray-300 text-sm">{progress}%</span>
          </div>
        </div>
      ) : (
      <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full">
          <button type="button" onClick={handleClick} className="flex-1 p-4 bg-[#23232a] rounded-xl flex flex-col items-center justify-center hover:bg-[#333] transition-colors duration-200" disabled={isOverLimit}>
          <svg className="w-8 h-8 mb-2 text-emerald-400" fill="none" viewBox="0 0 24 24"><path d="M12 16V4m0 0l-4 4m4-4l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="text-white font-semibold">Upload Files</span>
          <span className="text-gray-400 text-sm">or drop files here</span>
        </button>
        <div className="sm:flex flex-col justify-center hidden"><div className="w-px h-16 bg-gray-700 mx-2" /></div>
          <button type="button" onClick={handleFolderClick} className="flex-1 p-4 bg-[#23232a] rounded-xl flex flex-col items-center justify-center hover:bg-[#333] transition-colors duration-200" disabled={isOverLimit}>
          <svg className="w-8 h-8 mb-2 text-blue-400" fill="none" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span className="text-white font-semibold">Upload Folder</span>
          <span className="text-gray-400 text-sm">preserves structure</span>
        </button>
      </div>
      )}
    </div>
  );
};

export default FileDropzone;