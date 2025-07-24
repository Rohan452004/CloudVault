import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import FilePreviewModal from "../Platformdashboard/FilePreviewModal";
import ShareModal from "../Platformdashboard/ShareModal";
import VirtualizedFileGrid from "../Platformdashboard/VirtualizedFileGrid";
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

const FileList = ({ files = [], onFileClick, onFolderClick, onAction, currentPath = '', onPathChange, refreshKey = 0, search = '', filterType = 'all', viewMode = 'list', onFileChange }) => {
  const { user } = useAuth();
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
  const [operationLoading, setOperationLoading] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState([]);
  // Cache for list requests
  const [listCache, setListCache] = useState({});
  const [cacheTimestamp, setCacheTimestamp] = useState({});

  // Cache invalidation function
  const invalidateCache = (path = null) => {
    if (path) {
      setListCache(prev => {
        const newCache = { ...prev };
        delete newCache[path];
        return newCache;
      });
      setCacheTimestamp(prev => {
        const newTimestamps = { ...prev };
        delete newTimestamps[path];
        return newTimestamps;
      });
    } else {
      setListCache({});
      setCacheTimestamp({});
    }
  };

  // Update cache when files are modified
  const updateCache = (path, files) => {
    setListCache(prev => ({ ...prev, [path]: files }));
    setCacheTimestamp(prev => ({ ...prev, [path]: Date.now() }));
  };

  useEffect(() => {
    if (user?._id) {
      fetchS3Files();
    }
    // eslint-disable-next-line
  }, [user?._id, currentPath, refreshKey]);

  const fetchS3Files = async () => {
    setLoading(true);
    setError(null);
    const cacheKey = currentPath;
    const now = Date.now();
    const cacheAge = now - (cacheTimestamp[cacheKey] || 0);
    const cacheValid = cacheAge < 5 * 60 * 1000; // 5 minutes cache
    if (listCache[cacheKey] && cacheValid && refreshKey === 0) {
      setS3Files(listCache[cacheKey]);
      setLoading(false);
      return;
    }
    try {
      const response = await axiosInstance.post(`platform/s3/${user._id}/list-files`, { prefix: currentPath });
      const files = response.data.files;
      setS3Files(files);
      setListCache(prev => ({ ...prev, [cacheKey]: files }));
      setCacheTimestamp(prev => ({ ...prev, [cacheKey]: now }));
    } catch (err) {
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
    try {
      const res = await axiosInstance.post(`platform/s3/${user._id}/get-signed-url`, { key: file.key });
      setPreview({ open: true, url: res.data.url, type: getMimeType(file.name), name: file.name });
    } catch (err) {
      toast.error('Failed to get file preview URL');
    }
  };

  const handleAction = async (action, file) => {
    if (action === 'delete') {
      if (!window.confirm(`Are you sure you want to delete '${file.name}'? This cannot be undone.`)) return;
      setOperationLoading(true);
      try {
        await axiosInstance.post(`platform/s3/${user._id}/delete`, { key: file.key });
        const updatedFiles = s3Files.filter(f => f.key !== file.key);
        setS3Files(updatedFiles);
        updateCache(currentPath, updatedFiles);
        toast.success('File deleted successfully');
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to delete: ' + (err.response?.data?.message || err.message));
      } finally {
        setOperationLoading(false);
      }
    } else if (action === 'download') {
      setOperationLoading(true);
      try {
        const res = await axiosInstance.post(`platform/s3/${user._id}/get-signed-url`, { key: file.key });
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
      } finally {
        setOperationLoading(false);
      }
    }
    onAction?.(action, file);
  };

  const handleRename = async (file) => {
    const newName = window.prompt('Enter new name:', file.name);
    if (!newName || newName === file.name) return;
    let newKey;
    if (file.type === 'folder') {
      const parent = file.key.slice(0, file.key.lastIndexOf(file.name));
      newKey = parent + newName + '/';
    } else {
      const parent = file.key.slice(0, file.key.lastIndexOf('/') + 1);
      newKey = parent + newName;
    }
    setOperationLoading(true);
    try {
      await axiosInstance.post(`platform/s3/${user._id}/rename`, { oldKey: file.key, newKey });
      setS3Files([]);
      fetchS3Files();
      onFileChange?.();
      invalidateCache(currentPath);
    } catch (err) {
      toast.error('Failed to rename: ' + (err.response?.data?.message || err.message));
    } finally {
      setOperationLoading(false);
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
      setOperationLoading(true);
      try {
        await axiosInstance.post(`platform/s3/${user._id}/rename-folder`, { oldPrefix: file.key, newPrefix });
        toast.success('Folder renamed successfully');
        setRenamingId(null);
        setRenameValue("");
        const updatedFiles = s3Files.map(f => f.key === file.key ? { ...f, name: renameValue, key: newPrefix } : f);
        setS3Files(updatedFiles);
        updateCache(currentPath, updatedFiles);
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to rename folder: ' + (err.response?.data?.message || err.message));
        setRenamingId(null);
      } finally {
        setOperationLoading(false);
      }
    } else {
      let newKey;
      const parent = file.key.slice(0, file.key.lastIndexOf('/') + 1);
      newKey = parent + renameValue;
      setOperationLoading(true);
      try {
        await axiosInstance.post(`platform/s3/${user._id}/rename`, { oldKey: file.key, newKey });
        toast.success('File renamed successfully');
        setRenamingId(null);
        setRenameValue("");
        const updatedFiles = s3Files.map(f => f.key === file.key ? { ...f, name: renameValue, key: newKey } : f);
        setS3Files(updatedFiles);
        updateCache(currentPath, updatedFiles);
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to rename: ' + (err.response?.data?.message || err.message));
        setRenamingId(null);
      } finally {
        setOperationLoading(false);
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
      setOperationLoading(true);
      try {
        await axiosInstance.post(`platform/s3/${user._id}/delete-folder`, { prefix: folder.key });
        toast.success('Folder deleted successfully');
        const updatedFiles = s3Files.filter(f => f.key !== folder.key);
        setS3Files(updatedFiles);
        updateCache(currentPath, updatedFiles);
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to delete folder: ' + (err.response?.data?.message || err.message));
      } finally {
        setFolderActionLoading(false);
        setOperationLoading(false);
      }
    } else if (action === 'rename') {
      const newName = window.prompt('Enter new folder name:', folder.name);
      if (!newName || newName === folder.name) return;
      const parent = folder.key.slice(0, folder.key.lastIndexOf(folder.name));
      const newPrefix = parent + newName + '/';
      setFolderActionLoading(true);
      setOperationLoading(true);
      try {
        await axiosInstance.post(`platform/s3/${user._id}/rename-folder`, { oldPrefix: folder.key, newPrefix });
        toast.success('Folder renamed successfully');
        const updatedFiles = s3Files.map(f => f.key === folder.key ? { ...f, name: newName, key: newPrefix } : f);
        setS3Files(updatedFiles);
        updateCache(currentPath, updatedFiles);
        onFileChange?.();
      } catch (err) {
        toast.error('Failed to rename folder: ' + (err.response?.data?.message || err.message));
      } finally {
        setFolderActionLoading(false);
        setOperationLoading(false);
      }
    } else if (action === 'download') {
      setFolderActionLoading(true);
      setOperationLoading(true);
      try {
        const res = await axiosInstance.post(`platform/s3/${user._id}/download-folder-zip`, { prefix: folder.key }, { responseType: 'blob' });
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
      } finally {
        setFolderActionLoading(false);
        setOperationLoading(false);
      }
    }
  };

  const handleShareFolder = (folder) => {
    setShareFolderModal({ open: true, folder });
  };

  // Recursive folder size calculation with caching
  const fetchFolderSize = useCallback(async (prefix) => {
    if (folderSizes[prefix] !== undefined) {
      return folderSizes[prefix];
    }
    const res = await axiosInstance.post(`platform/s3/${user._id}/list-files`, { prefix });
    let totalSize = 0;
    const files = res.data.files || [];
    for (const f of files) {
      if (f.type === 'file' && f.size) totalSize += f.size;
      if (f.type === 'folder') {
        totalSize += await fetchFolderSize(f.key);
      }
    }
    return totalSize;
  }, [user, folderSizes]);

  useEffect(() => {
    const fetchAllFolderSizes = async () => {
      const folders = s3Files.filter(f => f.type === 'folder');
      const newSizes = {};
      for (const folder of folders) {
        if (folderSizes[folder.key] === undefined) {
          newSizes[folder.key] = await fetchFolderSize(folder.key);
        }
      }
      if (Object.keys(newSizes).length > 0) {
        setFolderSizes(prev => ({ ...prev, ...newSizes }));
      }
    };
    if (s3Files.length > 0) fetchAllFolderSizes();
  }, [s3Files, fetchFolderSize, folderSizes]);

  let displayFiles = s3Files;
  if (search) {
    displayFiles = displayFiles.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  }
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

  // Bulk actions for platform
  const handleBulkDelete = async () => {
    if (!user?._id || selectedKeys.length === 0) return;
    if (!window.confirm(`Delete ${selectedKeys.length} selected item(s)? This cannot be undone.`)) return;
    setOperationLoading(true);
    try {
      await axiosInstance.post(`platform/s3/bulk/${user._id}/bulk-delete`, { keys: selectedKeys });
      const updatedFiles = s3Files.filter(f => !selectedKeys.includes(f.key));
      setS3Files(updatedFiles);
      setSelectedKeys([]);
      updateCache(currentPath, updatedFiles);
      toast.success('Selected items deleted.');
      onFileChange?.();
    } catch (err) {
      toast.error('Bulk delete failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setOperationLoading(false);
    }
  };

  const handleBulkDownload = async () => {
    if (!user?._id || selectedKeys.length === 0) return;
    setOperationLoading(true);
    try {
      const res = await axiosInstance.post(`platform/s3/bulk/${user._id}/bulk-download-zip`, { keys: selectedKeys }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `CloudVault-Selected.zip`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 100);
      toast.success('Selected items downloaded as ZIP.');
    } catch (err) {
      toast.error('Bulk download failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setOperationLoading(false);
    }
  };

  const handleBulkShare = async () => {
    if (!user?._id || selectedKeys.length === 0) return;
    setOperationLoading(true);
    try {
      const res = await axiosInstance.post(`platform/s3/bulk/${user._id}/bulk-share-zip`, { keys: selectedKeys, expires: 3600 });
      setShareFile({ name: 'CloudVault-Selected.zip', url: res.data.url, isZip: true, keys: selectedKeys });
      setShareModalOpen(true);
    } catch (err) {
      toast.error('Bulk share failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setOperationLoading(false);
    }
  };

  // Modular grid view
  if (viewMode === 'grid') {
    return (
      <>
        <div className="w-full bg-[#18181b] rounded-b-2xl shadow-lg p-4 mt-2 min-h-[120px]">
          <VirtualizedFileGrid
            files={[...folders, ...regularFiles]}
            user={user}
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
            onFolderAction={handleFolderAction}
            folderSizes={folderSizes}
          />
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
        {operationLoading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-white text-lg font-semibold">Please wait...</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="w-full bg-[#18181b] rounded-b-2xl shadow-lg p-4 mt-2 min-h-[120px]">
        {(folders.length > 0 || regularFiles.length > 0) && (
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={selectedKeys.length === (folders.length + regularFiles.length) && selectedKeys.length > 0}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedKeys([...folders, ...regularFiles].map(f => f.key));
                } else {
                  setSelectedKeys([]);
                }
              }}
              className="mr-2 accent-emerald-500"
            />
            <span className="text-gray-300">Select All</span>
            {selectedKeys.length > 0 && (
              <>
                <button
                  onClick={handleBulkDelete}
                  className="ml-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Delete Selected ({selectedKeys.length})
                </button>
                <button
                  onClick={handleBulkDownload}
                  className="ml-2 px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
                >
                  Download Selected
                </button>
                <button
                  onClick={handleBulkShare}
                  className="ml-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Share Selected
                </button>
              </>
            )}
          </div>
        )}
        {folders.length === 0 && regularFiles.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No files or folders found.
          </div>
        ) : (
          <ul className="divide-y divide-[#23232a]">
            {/* Folders first */}
            {folders.map((folder, idx) => (
              <li key={folder.id || `folder-${idx}`} className="flex items-center justify-between py-3 px-2 group hover:bg-[#23232a] rounded-lg transition">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(folder.key)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedKeys(prev => [...prev, folder.key]);
                      } else {
                        setSelectedKeys(prev => prev.filter(k => k !== folder.key));
                      }
                    }}
                    className="mr-2 accent-emerald-500"
                  />
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
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(file.key)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedKeys(prev => [...prev, file.key]);
                      } else {
                        setSelectedKeys(prev => prev.filter(k => k !== file.key));
                      }
                    }}
                    className="mr-2 accent-emerald-500"
                  />
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
      {operationLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin w-12 h-12 text-emerald-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-white text-lg font-semibold">Please wait...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default FileList;
