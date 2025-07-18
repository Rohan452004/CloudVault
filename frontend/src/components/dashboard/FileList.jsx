import React, { useState, useEffect } from "react";
import { useAws } from "../../contexts/AwsContext";
import axios from "axios";
import FilePreviewModal from "./FilePreviewModal";

// Helper to infer MIME type from file extension
const getMimeType = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (["jpg", "jpeg"].includes(ext)) return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "gif") return "image/gif";
  if (ext === "bmp") return "image/bmp";
  if (ext === "webp") return "image/webp";
  if (ext === "svg") return "image/svg+xml";
  if (ext === "pdf") return "application/pdf";
  if (ext === "txt") return "text/plain";
  if (ext === "csv") return "text/csv";
  if (ext === "mp4") return "video/mp4";
  if (ext === "mp3") return "audio/mpeg";
  // Add more as needed
  return "";
};

const FileList = ({ files = [], onFileClick, onFolderClick, onAction, currentPath = '', onPathChange, refreshKey = 0, search = '', filterType = 'all' }) => {
  const { aws } = useAws();
  const [s3Files, setS3Files] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState({ open: false, url: '', type: '', name: '' });

  // Fetch files from S3 when component mounts, AWS credentials, path, or refreshKey changes
  useEffect(() => {
    if (aws.accessKeyId && aws.secretAccessKey && aws.bucket && aws.region) {
      fetchS3Files();
    }
  }, [aws, currentPath, refreshKey]);

  const fetchS3Files = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:3000/api/s3/list-files', {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
        bucket: aws.bucket,
        region: aws.region,
        prefix: currentPath
      }, {
        withCredentials: true
      });

      setS3Files(response.data.files);
    } catch (err) {
      console.error('Error fetching S3 files:', err);
      setError(err.response?.data?.message || 'Failed to fetch files from S3');
      setS3Files([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    const newPath = folder.key;
    onPathChange?.(newPath);
    onFolderClick?.(folder);
  };

  const handleFileClick = async (file) => {
    // Fetch signed URL for preview
    try {
      const res = await axios.post('http://localhost:3000/api/s3/get-signed-url', {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
        bucket: aws.bucket,
        region: aws.region,
        key: file.key,
      }, { withCredentials: true });
      setPreview({ open: true, url: res.data.url, type: getMimeType(file.name), name: file.name });
    } catch (err) {
      alert('Failed to get file preview URL');
    }
    onFileClick?.(file);
  };

  const handleAction = async (action, file) => {
    if (action === 'delete') {
      // TODO: Implement delete functionality
      console.log('Delete file:', file);
    } else if (action === 'download') {
      // Download using signed URL
      try {
        const res = await axios.post('http://localhost:3000/api/s3/get-signed-url', {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          key: file.key,
        }, { withCredentials: true });
        window.open(res.data.url, '_blank');
      } catch (err) {
        alert('Failed to get download URL');
      }
    }
    onAction?.(action, file);
  };

  // Use S3 files if AWS credentials are available, otherwise use passed files prop
  let displayFiles = aws.accessKeyId ? s3Files : files;

  // Filter by search
  if (search) {
    displayFiles = displayFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  }

  // Filter by filterType
  if (filterType === 'files') {
    displayFiles = displayFiles.filter(f => f.type === 'file');
  } else if (filterType === 'folders') {
    displayFiles = displayFiles.filter(f => f.type === 'folder');
  }

  const folders = displayFiles.filter(f => f.type === 'folder');
  const regularFiles = displayFiles.filter(f => f.type === 'file');

  if (loading) {
    return (
      <div className="w-full bg-[#18181b] rounded-b-2xl shadow-lg p-4 mt-2 min-h-[120px] flex items-center justify-center">
        <div className="text-gray-400">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-[#18181b] rounded-b-2xl shadow-lg p-4 mt-2 min-h-[120px] flex items-center justify-center">
        <div className="text-red-400 text-center">
          <div className="mb-2">Error loading files</div>
          <div className="text-sm text-gray-500">{error}</div>
          <button 
            onClick={fetchS3Files}
            className="mt-2 px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-[#18181b] rounded-b-2xl shadow-lg p-4 mt-2 min-h-[120px]">
        {folders.length === 0 && regularFiles.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {aws.accessKeyId ? 'No files or folders found in S3 bucket.' : 'No files or folders found.'}
          </div>
        ) : (
          <ul className="divide-y divide-[#23232a]">
            {/* Folders first */}
            {folders.map((folder, idx) => (
              <li key={folder.id || `folder-${idx}`} className="flex items-center justify-between py-3 px-2 group hover:bg-[#23232a] rounded-lg transition">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleFolderClick(folder)}>
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-gray-200 font-medium text-base">{folder.name}</span>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  {/* You can add folder actions here if needed */}
                </div>
              </li>
            ))}
            {/* Then files */}
            {regularFiles.map((file, idx) => (
              <li key={file.id || `file-${idx}`} className="flex items-center justify-between py-3 px-2 group hover:bg-[#23232a] rounded-lg transition">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleFileClick(file)}>
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M8 4v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
                  <div className="flex flex-col">
                    <span className="text-gray-200 font-medium text-base">{file.name}</span>
                    {file.size && (
                      <span className="text-gray-500 text-sm">
                        {file.size < 1024 ? `${file.size} B` : 
                         file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` :
                         `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleAction('download', file)} className="text-emerald-400 hover:text-emerald-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button onClick={() => handleAction('delete', file)} className="text-red-500 hover:text-red-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <FilePreviewModal
        open={preview.open}
        onClose={() => setPreview({ open: false, url: '', type: '', name: '' })}
        fileUrl={preview.url}
        fileType={preview.type}
        fileName={preview.name}
      />
    </>
  );
};

export default FileList; 