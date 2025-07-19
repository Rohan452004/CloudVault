import React, { useState, useEffect, useCallback } from "react";
import { useAws } from "../../contexts/AwsContext";
import axiosInstance from "../../utils/axiosInstance";
import FilePreviewModal from "./FilePreviewModal";
import ShareModal from "./ShareModal";
import { toast } from "react-hot-toast";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileArchive, FaFileAlt, FaFileImage, FaFileVideo, FaFileAudio, FaFileCode, FaFile, FaEdit, FaTrash, FaDownload, FaFolder, FaShareAlt } from "react-icons/fa";

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
  if (ext === 'mov') return "video/mov";
  if (ext === "mp3") return "audio/mpeg";
  // Add more as needed
  return "";
};

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext)) return <FaFileImage className="text-blue-300" />;
  if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return <FaFileVideo className="text-purple-400" />;
  if (["mp3", "wav", "ogg", "aac"].includes(ext)) return <FaFileAudio className="text-pink-400" />;
  if (["pdf"].includes(ext)) return <FaFilePdf className="text-red-500" />;
  if (["doc", "docx"].includes(ext)) return <FaFileWord className="text-blue-500" />;
  if (["xls", "xlsx", "csv"].includes(ext)) return <FaFileExcel className="text-green-500" />;
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <FaFileArchive className="text-yellow-500" />;
  if (["js", "ts", "jsx", "tsx", "json", "html", "css", "py", "java", "c", "cpp", "cs", "go", "rb", "php", "sh"].includes(ext)) return <FaFileCode className="text-orange-400" />;
  if (["txt", "md", "rtf"].includes(ext)) return <FaFileAlt className="text-gray-400" />;
  return <FaFile className="text-gray-500" />;
};

const FileGrid = ({ files, onFileClick, onFolderClick, onAction, startRename, renamingId, renameValue, setRenameValue, saveRename, cancelRename, handleShare, getFileIcon, getMimeType, aws, onFolderAction, folderSizes }) => {
  const [thumbUrls, setThumbUrls] = useState({});

  useEffect(() => {
    // Preload signed URLs for image/video files
    const fetchThumbs = async () => {
      const newThumbs = {};
      for (const file of files) {
        if (file.type === 'file' && (getMimeType(file.name).startsWith('image/') || getMimeType(file.name).startsWith('video/'))) {
          try {
            const res = await axiosInstance.post('/self/s3/get-signed-url', {
              accessKeyId: aws.accessKeyId,
              secretAccessKey: aws.secretAccessKey,
              bucket: aws.bucket,
              region: aws.region,
              key: file.key,
            });
            newThumbs[file.key] = res.data.url;
          } catch {
            // fallback to icon
          }
        }
      }
      setThumbUrls(newThumbs);
    };
    fetchThumbs();
    // eslint-disable-next-line
  }, [files]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
      {files.map((file, idx) => (
        <div
          key={file.id || file.key || idx}
          className="relative group bg-[#23232a] rounded-xl p-4 flex flex-col items-center justify-between shadow hover:shadow-lg transition cursor-pointer min-h-[140px]"
        >
          {/* Folder */}
          {file.type === 'folder' ? (
            <>
              <div className="flex flex-col items-center w-full" onClick={() => renamingId ? null : onFolderClick(file)}>
                <FaFolder className="w-12 h-12 text-emerald-400 mb-2" />
                {renamingId === (file.id || file.key) ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      className="bg-black text-white border border-orange-500 rounded px-2 py-1 w-full"
                      autoFocus
                      onKeyDown={e => {
                        e.stopPropagation();
                        if (e.key === "Enter") saveRename(file);
                        if (e.key === "Escape") cancelRename();
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                    <button onClick={e => { e.stopPropagation(); saveRename(file); }} className="text-green-500 text-lg px-1" title="Save">✔</button>
                    <button onClick={e => { e.stopPropagation(); cancelRename(); }} className="text-red-500 text-lg px-1" title="Cancel">✖</button>
                  </div>
                ) : (
                  <span className="text-gray-200 font-medium text-base truncate w-full text-center cursor-pointer hover:underline">{file.name}</span>
                )}
                <span className="text-gray-500 text-xs mt-1">{folderSizes[file.key] !== undefined ? (folderSizes[file.key] < 1024 ? `${folderSizes[file.key]} B` : folderSizes[file.key] < 1024 * 1024 ? `${(folderSizes[file.key] / 1024).toFixed(1)} KB` : `${(folderSizes[file.key] / (1024 * 1024)).toFixed(1)} MB`) : '...'}</span>
              </div>
              {/* Folder actions overlay */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                <button onClick={e => { e.stopPropagation(); onFolderAction('download', file); }} className="text-emerald-400 hover:text-emerald-300" title="Download as ZIP"><FaDownload /></button>
                <button onClick={e => { e.stopPropagation(); onFolderAction('delete', file); }} className="text-red-500 hover:text-red-400" title="Delete Folder"><FaTrash /></button>
                {renamingId !== (file.id || file.key) && (
                  <button onClick={e => { e.stopPropagation(); startRename(file); }} className="text-blue-400 hover:text-blue-300" title="Rename Folder"><FaEdit /></button>
                )}
                <button onClick={e => { e.stopPropagation(); handleShareFolder(file); }} className="text-orange-400 hover:text-orange-300" title="Share Folder"><FaShareAlt /></button>
              </div>
            </>
          ) : (
            <>
              {/* File thumbnail or icon */}
              <div className="w-full flex flex-col items-center" onClick={() => renamingId ? null : onFileClick(file)}>
                {getMimeType(file.name).startsWith('image/') && thumbUrls[file.key] ? (
                  <img src={thumbUrls[file.key]} alt={file.name} className="w-16 h-16 object-cover rounded mb-2 border border-gray-700 mt-4" />
                ) : getMimeType(file.name).startsWith('video/') && thumbUrls[file.key] ? (
                  <video src={thumbUrls[file.key]} className="w-16 h-16 object-cover rounded mb-2 border border-gray-700 mt-4" controls={false} />
                ) : (
                  <span className="mb-2 text-4xl mt-4">{getFileIcon(file.name)}</span>
                )}
                {renamingId === (file.id || file.key) ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      className="bg-black text-white border border-orange-500 rounded px-2 py-1 w-full"
                      autoFocus
                      onKeyDown={e => {
                        e.stopPropagation();
                        if (e.key === "Enter") saveRename(file);
                        if (e.key === "Escape") cancelRename();
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                    <button onClick={e => { e.stopPropagation(); saveRename(file); }} className="text-green-500 text-lg px-1" title="Save">✔</button>
                    <button onClick={e => { e.stopPropagation(); cancelRename(); }} className="text-red-500 text-lg px-1" title="Cancel">✖</button>
                  </div>
                ) : (
                  <span className="text-gray-200 font-medium text-base truncate w-full text-center cursor-pointer hover:underline">{file.name}</span>
                )}
                {file.size && (
                  <span className="text-gray-500 text-xs mt-1">
                    {file.size < 1024 ? `${file.size} B` : 
                     file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` :
                     `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                  </span>
                )}
              </div>
              {/* Actions overlay for files */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <button onClick={e => { e.stopPropagation(); onAction('download', file); }} className="text-emerald-400 hover:text-emerald-300" title="Download"><FaDownload /></button>
                <button onClick={e => { e.stopPropagation(); onAction('delete', file); }} className="text-red-500 hover:text-red-400" title="Delete"><FaTrash /></button>
                {renamingId !== (file.id || file.key) && (
                  <button onClick={e => { e.stopPropagation(); startRename(file); }} className="text-blue-400 hover:text-blue-300" title="Rename"><FaEdit /></button>
                )}
                <button onClick={e => { e.stopPropagation(); handleShare(file); }} className="text-orange-400 hover:text-orange-300" title="Share"><FaShareAlt /></button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

const FileList = ({ files = [], onFileClick, onFolderClick, onAction, currentPath = '', onPathChange, refreshKey = 0, search = '', filterType = 'all', viewMode = 'list', onFileChange }) => {
  const { aws } = useAws();
  const [s3Files, setS3Files] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState({ open: false, url: '', type: '', name: '' });
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareFile, setShareFile] = useState(null);
  const [folderActionLoading, setFolderActionLoading] = useState(false);
  const [folderSizes, setFolderSizes] = useState({});
  const [shareFolderModal, setShareFolderModal] = useState({ open: false, folder: null });

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
      const response = await axiosInstance.post('/self/s3/list-files', {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
        bucket: aws.bucket,
        region: aws.region,
        prefix: currentPath
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
      const res = await axiosInstance.post('/self/s3/get-signed-url', {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
        bucket: aws.bucket,
        region: aws.region,
        key: file.key,
      });
      setPreview({ open: true, url: res.data.url, type: getMimeType(file.name), name: file.name });
    } catch (err) {
      toast.error('Failed to get file preview URL');
    }
    // Removed: onFileClick?.(file);
  };

  const handleAction = async (action, file) => {
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete '${file.name}'? This cannot be undone.`)) return;
      try {
        await axiosInstance.post('/self/s3/delete', {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          key: file.key,
        });
        setS3Files(prev => prev.filter(f => f.key !== file.key));
        toast.success('File deleted successfully');
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to delete: ' + (err.response?.data?.message || err.message));
      }
    } else if (action === 'download') {
      try {
        const res = await axiosInstance.post('/self/s3/get-signed-url', {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          key: file.key,
        });
        // Fetch the file as a blob
        const fileRes = await fetch(res.data.url);
        const blob = await fileRes.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 100);
      } catch (err) {
        toast.error('Failed to get download URL');
      }
    }
    onAction?.(action, file);
  };

  const handleRename = async (file) => {
    const newName = window.prompt('Enter new name:', file.name);
    if (!newName || newName === file.name) return;
    let newKey;
    if (file.type === 'folder') {
      // Remove trailing slash, rename, add slash back
      const parent = file.key.slice(0, file.key.lastIndexOf(file.name));
      newKey = parent + newName + '/';
    } else {
      const parent = file.key.slice(0, file.key.lastIndexOf('/') + 1);
      newKey = parent + newName;
    }
    try {
      await axiosInstance.post('/self/s3/rename', {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
        bucket: aws.bucket,
        region: aws.region,
        oldKey: file.key,
        newKey,
      });
      setS3Files([]); // force refresh
      fetchS3Files();
      onFileChange?.();
    } catch (err) {
      toast.error('Failed to rename: ' + (err.response?.data?.message || err.message));
    }
  };

  const startRename = (file) => {
    setRenamingId(file.id || file.key);
    setRenameValue(file.name);
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  const saveRename = async (file) => {
    if (!renameValue || renameValue === file.name) {
      cancelRename();
      return;
    }
    if (file.type === 'folder') {
      const parent = file.key.slice(0, file.key.lastIndexOf(file.name));
      const newPrefix = parent + renameValue + '/';
      try {
        await axiosInstance.post('/self/s3/rename-folder', {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          oldPrefix: file.key,
          newPrefix,
        });
        toast.success('Folder renamed successfully');
        setRenamingId(null);
        setRenameValue("");
        setS3Files([]); // force refresh
        fetchS3Files();
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to rename folder: ' + (err.response?.data?.message || err.message));
        setRenamingId(null);
      }
    } else {
      let newKey;
      const parent = file.key.slice(0, file.key.lastIndexOf('/') + 1);
      newKey = parent + renameValue;
      try {
        await axiosInstance.post('/self/s3/rename', {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          oldKey: file.key,
          newKey,
        });
        toast.success('File renamed successfully');
        setRenamingId(null);
        setRenameValue("");
        setS3Files([]); // force refresh
        fetchS3Files();
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to rename: ' + (err.response?.data?.message || err.message));
        setRenamingId(null);
      }
    }
  };

  const handleShare = (file) => {
    setShareFile(file);
    setShareModalOpen(true);
  };

  const handleFolderAction = async (action, folder) => {
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete the folder '${folder.name}' and all its contents? This cannot be undone.`)) return;
      setFolderActionLoading(true);
      try {
        await axiosInstance.post('/self/s3/delete-folder', {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          prefix: folder.key,
        });
        toast.success('Folder deleted successfully');
        fetchS3Files();
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to delete folder: ' + (err.response?.data?.message || err.message));
      }
      setFolderActionLoading(false);
    } else if (action === 'rename') {
      const newName = window.prompt('Enter new folder name:', folder.name);
      if (!newName || newName === folder.name) return;
      const parent = folder.key.slice(0, folder.key.lastIndexOf(folder.name));
      const newPrefix = parent + newName + '/';
      setFolderActionLoading(true);
      try {
        await axiosInstance.post('/self/s3/rename-folder', {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          oldPrefix: folder.key,
          newPrefix,
        });
        toast.success('Folder renamed successfully');
        fetchS3Files();
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to rename folder: ' + (err.response?.data?.message || err.message));
      }
      setFolderActionLoading(false);
    } else if (action === 'download') {
      setFolderActionLoading(true);
      try {
        const res = await axiosInstance.post('/self/s3/download-folder-zip', {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          prefix: folder.key,
        }, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `${folder.name}.zip`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 100);
      } catch (err) {
        toast.error('Failed to download folder: ' + (err.response?.data?.message || err.message));
      }
      setFolderActionLoading(false);
    }
  };

  const handleShareFolder = (folder) => {
    setShareFolderModal({ open: true, folder });
  };

  // Recursive folder size calculation
  const fetchFolderSize = useCallback(async (prefix) => {
    const res = await axiosInstance.post('/self/s3/list-files', {
      accessKeyId: aws.accessKeyId,
      secretAccessKey: aws.secretAccessKey,
      bucket: aws.bucket,
      region: aws.region,
      prefix
    });
    let totalSize = 0;
    const files = res.data.files || [];
    for (const f of files) {
      if (f.type === 'file' && f.size) totalSize += f.size;
      if (f.type === 'folder') {
        totalSize += await fetchFolderSize(f.key);
      }
    }
    return totalSize;
  }, [aws]);

  useEffect(() => {
    const fetchAllFolderSizes = async () => {
      const folders = s3Files.filter(f => f.type === 'folder');
      const newSizes = {};
      for (const folder of folders) {
        newSizes[folder.key] = await fetchFolderSize(folder.key);
      }
      setFolderSizes(newSizes);
    };
    if (s3Files.length > 0) fetchAllFolderSizes();
  }, [s3Files, fetchFolderSize]);

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
  } else if (filterType === 'images') {
    displayFiles = displayFiles.filter(f => getMimeType(f.name).startsWith('image/'));
  } else if (filterType === 'videos') {
    displayFiles = displayFiles.filter(f => getMimeType(f.name).startsWith('video/'));
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

  // Modular grid view
  if (viewMode === 'grid') {
    return (
      <>
        <div className="w-full bg-[#18181b] rounded-b-2xl shadow-lg p-4 mt-2 min-h-[120px]">
          {folders.length === 0 && regularFiles.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              {aws.accessKeyId ? 'No files or folders found in S3 bucket.' : 'No files or folders found.'}
            </div>
          ) : (
            <FileGrid
              files={[...folders, ...regularFiles]}
              onFileClick={handleFileClick}
              onFolderClick={handleFolderClick}
              onAction={handleAction}
              startRename={startRename}
              renamingId={renamingId}
              renameValue={renameValue}
              setRenameValue={setRenameValue}
              saveRename={saveRename}
              cancelRename={cancelRename}
              handleShare={handleShare}
              getFileIcon={getFileIcon}
              getMimeType={getMimeType}
              aws={aws}
              onFolderAction={handleFolderAction}
              folderSizes={folderSizes}
            />
          )}
        </div>
        <FilePreviewModal
          open={preview.open}
          onClose={() => setPreview({ open: false, url: '', type: '', name: '' })}
          fileUrl={preview.url}
          fileType={preview.type}
          fileName={preview.name}
        />
        <ShareModal
          open={shareModalOpen}
          file={shareFile}
          onClose={() => setShareModalOpen(false)}
        />
        <ShareModal
          open={shareFolderModal.open}
          file={shareFolderModal.folder ? { ...shareFolderModal.folder, isFolder: true } : null}
          onClose={() => setShareFolderModal({ open: false, folder: null })}
        />
      </>
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
                <div className="flex items-center gap-3">
                  <FaFolder className="w-6 h-6 text-emerald-400" />
                  <div className="flex flex-col">
                    {renamingId === (folder.id || folder.key) ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          className="bg-black text-white border border-orange-500 rounded px-2 py-1 w-full"
                          autoFocus
                          onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === "Enter") saveRename(folder);
                            if (e.key === "Escape") cancelRename();
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                        <button onClick={e => { e.stopPropagation(); saveRename(folder); }} className="text-green-500 text-lg px-1" title="Save">✔</button>
                        <button onClick={e => { e.stopPropagation(); cancelRename(); }} className="text-red-500 text-lg px-1" title="Cancel">✖</button>
                      </div>
                    ) : (
                      <span className="text-gray-200 font-medium text-base cursor-pointer hover:underline" onClick={() => { if (!renamingId) handleFolderClick(folder); }}>{folder.name}</span>
                    )}
                    <span className="text-gray-500 text-xs ml-2">{folderSizes[folder.key] !== undefined ? (folderSizes[folder.key] < 1024 ? `${folderSizes[folder.key]} B` : folderSizes[folder.key] < 1024 * 1024 ? `${(folderSizes[folder.key] / 1024).toFixed(1)} KB` : `${(folderSizes[folder.key] / (1024 * 1024)).toFixed(1)} MB`) : '...'}</span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => handleFolderAction('download', folder)} className="text-emerald-400 hover:text-emerald-300" title="Download as ZIP"><FaDownload /></button>
                  <button onClick={() => handleFolderAction('delete', folder)} className="text-red-500 hover:text-red-400" title="Delete Folder"><FaTrash /></button>
                  {renamingId !== (folder.id || folder.key) && (
                    <button onClick={e => { e.stopPropagation(); startRename(folder); }} className="text-blue-400 hover:text-blue-300" title="Rename Folder"><FaEdit /></button>
                  )}
                  <button onClick={e => { e.stopPropagation(); handleShareFolder(folder); }} className="text-orange-400 hover:text-orange-300" title="Share Folder"><FaShareAlt /></button>
                </div>
              </li>
            ))}
            {/* Then files */}
            {regularFiles.map((file, idx) => (
              <li key={file.id || `file-${idx}`} className="flex items-center justify-between py-3 px-2 group hover:bg-[#23232a] rounded-lg transition">
                <div className="flex items-center gap-3">
                  {getFileIcon(file.name)}
                  <div className="flex flex-col">
                    {renamingId === (file.id || file.key) ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          className="bg-black text-white border border-orange-500 rounded px-2 py-1 w-full"
                          autoFocus
                          onKeyDown={e => {
                            e.stopPropagation();
                            if (e.key === "Enter") saveRename(file);
                            if (e.key === "Escape") cancelRename();
                          }}
                          onClick={e => e.stopPropagation()}
                        />
                        <button onClick={e => { e.stopPropagation(); saveRename(file); }} className="text-green-500 text-lg px-1" title="Save">✔</button>
                        <button onClick={e => { e.stopPropagation(); cancelRename(); }} className="text-red-500 text-lg px-1" title="Cancel">✖</button>
                      </div>
                    ) : (
                      <span
                        className="text-gray-200 font-medium text-base cursor-pointer hover:underline"
                        onClick={() => {
                          if (!renamingId) handleFileClick(file);
                        }}
                      >
                        {file.name}
                      </span>
                    )}
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
                  <button onClick={() => handleAction('download', file)} className="text-emerald-400 hover:text-emerald-300" title="Download"><FaDownload /></button>
                  <button onClick={() => handleAction('delete', file)} className="text-red-500 hover:text-red-400" title="Delete"><FaTrash /></button>
                  {renamingId !== (file.id || file.key) && (
                    <button onClick={e => { e.stopPropagation(); startRename(file); }} className="text-blue-400 hover:text-blue-300" title="Rename"><FaEdit /></button>
                  )}
                  <button onClick={e => { e.stopPropagation(); handleShare(file); }} className="text-orange-400 hover:text-orange-300" title="Share"><FaShareAlt /></button>
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
      <ShareModal
        open={shareModalOpen}
        file={shareFile}
        onClose={() => setShareModalOpen(false)}
      />
      <ShareModal
        open={shareFolderModal.open}
        file={shareFolderModal.folder ? { ...shareFolderModal.folder, isFolder: true } : null}
        onClose={() => setShareFolderModal({ open: false, folder: null })}
      />
    </>
  );
};

export default FileList; 