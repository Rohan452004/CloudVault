import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAws } from "../../contexts/AwsContext";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import PathBar from "../../components/dashboard/PathBar";
import SearchBar from "../../components/dashboard/SearchBar";
import ActionsBar from "../../components/dashboard/ActionsBar";
import FileDropzone from "../../components/dashboard/FileDropzone";
import FileList from "../../components/dashboard/FileList";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const VIEW_MODE_KEY = 'cloudvault_view_mode';

const SelfManagedDashboard = () => {
  const { aws, disconnectAws } = useAws();
  const [path, setPath] = useState(() => localStorage.getItem('cloudvault_path') || "");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [storage, setStorage] = useState({ used: 0, total: 15 * 1024 * 1024 * 1024 }); // 15 GB default
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_MODE_KEY) || 'list');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if AWS credentials are available
    if (!aws.accessKeyId || !aws.secretAccessKey || !aws.bucket || !aws.region) {
      navigate('/');
    }
  }, [aws, navigate]);

  useEffect(() => {
    localStorage.setItem('cloudvault_path', path);
  }, [path]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // Update fetchUsage to recursively sum all file sizes, including inside folders
  useEffect(() => {
    const fetchAllFiles = async (prefix = "") => {
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
          totalSize += await fetchAllFiles(f.key);
        }
      }
      return totalSize;
    };
    const fetchUsage = async () => {
      try {
        // Only fetch usage if we don't have it cached or if refreshKey changed
        if (storage.used === 0 || refreshKey > 0) {
          const totalSize = await fetchAllFiles("");
          setStorage(s => ({ ...s, used: totalSize }));
        }
      } catch (err) {
        toast.error('Failed to fetch storage usage');
      }
    };
    if (aws.accessKeyId) fetchUsage();
  }, [aws, refreshKey, storage.used]);

  const handleLogout = () => {
    disconnectAws();
    navigate('/');
  };

  const handleNavigate = (newPath) => {
    setPath(newPath);
  };

  const handleSearch = (val) => setSearch(val);
  const handleFilterChange = (type) => setFilterType(type);
  const handleNewFolder = async (folderName) => {
    if (!folderName) return;
    // Compose the full folder path
    let folderPath = path ? path + folderName : folderName;
    if (!folderPath.endsWith('/')) folderPath += '/';
    try {
      await axiosInstance.post('/self/s3/create-folder', {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
        bucket: aws.bucket,
        region: aws.region,
        folderPath,
      });
      setRefreshKey(k => k + 1); // force FileList to reload
    } catch (err) {
      alert('Failed to create folder: ' + (err.response?.data?.message || err.message));
    }
  };
  const handleFilter = () => alert("Filter Clicked");
  const handleDrop = (files) => alert(`Dropped ${files.length} file(s)`);
  const handleFileClick = (file) => alert(`Open file: ${file.name}`);
  const handleFolderClick = (folder) => {
    // This will be handled by the FileList component internally
    // console.log(`Opening folder: ${folder.name}`);
  };
  const handleAction = (action, file) => {
    // toast(`${action} ${file.name}`);
  };
  const handleFileChange = () => {
    setRefreshKey(k => k + 1);
    // Force cache invalidation for current path when files change
    // This will be handled by the FileList component's refreshKey change
  };

  if (!aws.accessKeyId) return null;

  return (
    <div className="min-h-screen bg-[#111113]">
      <DashboardHeader title="CloudVault" bucketName={aws.bucket} onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto mt-10 rounded-2xl overflow-hidden shadow-xl bg-[#18181b]">
        <PathBar path={path} onNavigate={handleNavigate} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 bg-[#18181b]">
          <SearchBar value={search} onChange={handleSearch} />
          <ActionsBar 
            onNewFolder={handleNewFolder} 
            onFilterChange={handleFilterChange} 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
        <div className="w-full max-w-4xl mx-auto mt-6 mb-4">
          <div className="bg-[#23232a] rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-white font-semibold">Storage Usage</div>
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
              <div className="w-full md:w-64 bg-gray-700 rounded h-3 overflow-hidden">
                <div className="bg-emerald-500 h-3 rounded" style={{ width: `${(storage.used / storage.total) * 100}%` }} />
              </div>
              <div className="text-gray-300 text-sm md:ml-4">{(storage.used / (1024*1024)).toFixed(0)} MB used</div>
            </div>
          </div>
        </div>
        <FileDropzone 
          onUploadSuccess={() => setRefreshKey(k => k + 1)} 
          currentPath={path} 
          refreshKey={refreshKey}
        />
        <FileList 
          onFileClick={handleFileClick} 
          onFolderClick={handleFolderClick} 
          onAction={handleAction}
          currentPath={path}
          onPathChange={setPath}
          refreshKey={refreshKey}
          search={search}
          filterType={filterType}
          viewMode={viewMode}
          onFileChange={handleFileChange}
        />
      </main>
    </div>
  );
};

export default SelfManagedDashboard;
