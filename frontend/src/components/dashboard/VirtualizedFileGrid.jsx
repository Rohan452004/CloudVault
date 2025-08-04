import React, { useState, useEffect, useRef } from 'react';
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileArchive, FaFileAlt, FaFileImage, FaFileVideo, FaFileAudio, FaFileCode, FaFile, FaEdit, FaTrash, FaDownload, FaFolder, FaShareAlt } from 'react-icons/fa';
import axiosInstance from '../../utils/axiosInstance';

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

const VirtualizedFileGrid = ({ 
  files, 
  onFileClick, 
  onFolderClick, 
  onAction, 
  startRename, 
  renamingId, 
  renameValue, 
  setRenameValue, 
  saveRename, 
  cancelRename, 
  handleShare, 
  aws, 
  onFolderAction, 
  folderSizes 
}) => {
  // Track thumbnail URLs for the first 20 media files
  const [thumbUrls, setThumbUrls] = useState({});
  const [loadingThumbs, setLoadingThumbs] = useState(new Set());
  // Add a ref to track requested thumbnails
  const requestedThumbsRef = useRef(new Set());

  // Find the first 20 image/video files
  const mediaFiles = files.filter(file => file.type === 'file' && (getMimeType(file.name).startsWith('image/') || getMimeType(file.name).startsWith('video/')));
  const first20Media = mediaFiles.slice(0, 20);
  const first20MediaKeys = new Set(first20Media.map(f => f.key));

  // Load thumbnails for the first 5 media files only, using ref to prevent duplicate requests
  useEffect(() => {
    first20Media.forEach(file => {
      if (
        !thumbUrls[file.key] &&
        !loadingThumbs.has(file.key) &&
        !requestedThumbsRef.current.has(file.key)
      ) {
        requestedThumbsRef.current.add(file.key);
        setLoadingThumbs(prev => new Set(prev).add(file.key));
        axiosInstance.post('/self/s3/get-signed-url', {
          accessKeyId: aws.accessKeyId,
          secretAccessKey: aws.secretAccessKey,
          bucket: aws.bucket,
          region: aws.region,
          key: file.key,
        }).then(res => {
          setThumbUrls(prev => ({ ...prev, [file.key]: res.data.url }));
        }).catch(() => {
          // fallback to icon
        }).finally(() => {
          setLoadingThumbs(prev => {
            const newSet = new Set(prev);
            newSet.delete(file.key);
            return newSet;
          });
        });
      }
    });
    // eslint-disable-next-line
  }, [aws, JSON.stringify(first20Media.map(f => f.key))]);

  return (
    <div className="overflow-auto" style={{ height: '600px' }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {files.map((file, idx) => (
          <div
            key={file.id || file.key || idx}
            className="relative group bg-[#23232a] rounded-xl p-4 flex flex-col items-center justify-between shadow hover:shadow-lg transition cursor-pointer min-h-[140px]"
            data-file-key={file.key}
          >
            {/* Folder */}
            {file.type === 'folder' ? (
              <>
                <div className="flex flex-col items-center w-full" onClick={() => renamingId ? null : onFolderClick(file)}>
                  <FaFolder className="w-12 h-12 text-emerald-400 mb-2 mt-6" />
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
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition z-10">
                  <button onClick={e => { e.stopPropagation(); onFolderAction('download', file); }} className="text-emerald-400 hover:text-emerald-300" title="Download as ZIP"><FaDownload /></button>
                  <button onClick={e => { e.stopPropagation(); onFolderAction('delete', file); }} className="text-red-500 hover:text-red-400" title="Delete Folder"><FaTrash /></button>
                  {renamingId !== (file.id || file.key) && (
                    <button onClick={e => { e.stopPropagation(); startRename(file); }} className="text-blue-400 hover:text-blue-300" title="Rename Folder"><FaEdit /></button>
                  )}
                  <button onClick={e => { e.stopPropagation(); handleShare(file); }} className="text-orange-400 hover:text-orange-300" title="Share Folder"><FaShareAlt /></button>
                </div>
              </>
            ) : (
              <>
                {/* File thumbnail or icon logic */}
                <div className="w-full flex flex-col items-center mt-4" onClick={() => renamingId ? null : onFileClick(file)}>
                  {getMimeType(file.name).startsWith('image/') || getMimeType(file.name).startsWith('video/') ? (
                    first20MediaKeys.has(file.key) && thumbUrls[file.key] ? (
                      getMimeType(file.name).startsWith('image/') ? (
                        <img src={thumbUrls[file.key]} alt={file.name} className="w-16 h-16 object-cover rounded mb-2 border border-gray-700 mt-4" />
                      ) : (
                        <video src={thumbUrls[file.key]} className="w-16 h-16 object-cover rounded mb-2 border border-gray-700 mt-4" controls={false} />
                      )
                    ) : (
                      <span className="mb-2 text-4xl mt-4">{getFileIcon(file.name)}</span>
                    )
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
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
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
    </div>
  );
};

export default VirtualizedFileGrid; 