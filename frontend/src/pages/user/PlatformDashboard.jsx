import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // Assumes you have an AuthContext
import DashboardHeader from "../../components/Platformdashboard/DashboardHeader";
import PathBar from "../../components/Platformdashboard/PathBar";
import SearchBar from "../../components/Platformdashboard/SearchBar";
import ActionsBar from "../../components/Platformdashboard/ActionsBar";
import FileDropzone from "../../components/Platformdashboard/FileDropzone";
import FileList from "../../components/Platformdashboard/FileList";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const VIEW_MODE_KEY = 'platform_view_mode';

const PlatformDashboard = () => {
  // Use authentication context to get user info and logout function
  const { user, logout } = useAuth();
  const [path, setPath] = useState(() => localStorage.getItem('platform_path') || "");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  // Storage can be fetched from the user's plan or have a platform default
  const [storage, setStorage] = useState({ used: 0, total: 15 * 1024 * 1024 * 1024 }); // 15 GB default
  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_MODE_KEY) || 'list');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if a user is logged in
    if (!user) {
      navigate('/login'); // Redirect to login if no user
    }
  }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem('platform_path', path);
  }, [path]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    if (!user?._id) return; // Don't fetch if there's no user ID

    const fetchAllFiles = async (prefix = "") => {
      // UPDATED API CALL
    //   console.log("user._id", user._id);
    //   console.log("prefix", prefix);
      const res = await axiosInstance.post(`platform/s3/${user._id}/list-files`, {
        prefix: prefix
      });
      let totalSize = 0;
      const files = res.data.files || [];
      for (const f of files) {
        if (f.type === 'file' && f.size) totalSize += f.size;
        if (f.type === 'folder') {
          // Pass the relative key for recursion
          totalSize += await fetchAllFiles(f.key);
        }
      }
      return totalSize;
    };
    const fetchUsage = async () => {
      try {
        const totalSize = await fetchAllFiles("");
        setStorage(s => ({ ...s, used: totalSize }));
      } catch (err) {
        toast.error('Failed to fetch storage usage');
      }
    };
    
    fetchUsage();
  }, [user, refreshKey]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (newPath) => {
    setPath(newPath);
  };

  const handleNewFolder = async (folderName) => {
    // console.log("Creating new folder with name:", folderName); // 1. Does this log?
    if (!folderName || !user?._id) {
      console.error("Folder name or user ID is missing!"); // 2. Does this error appear?
      return;
    }
    
    let folderPath = path ? path + folderName : folderName;
    if (!folderPath.endsWith('/')) folderPath += '/';
    
    // console.log("Constructed folderPath for API:", folderPath); // 3. Is this path correct?
    
    try {
      // UPDATED API CALL
      await axiosInstance.post(`platform/s3/${user._id}/create-folder`, {
        folderPath,
      });
      toast.success(`Folder '${folderName}' created`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      toast.error('Failed to create folder: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFileChange = () => {
    setRefreshKey(k => k + 1);
  };

  // Render nothing until user is confirmed
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#111113]">
      <DashboardHeader title="CloudVault" onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto mt-10 rounded-2xl overflow-hidden shadow-xl bg-[#18181b]">
        <PathBar path={path} onNavigate={handleNavigate} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 bg-[#18181b]">
          <SearchBar value={search} onChange={setSearch} />
          <ActionsBar 
            onNewFolder={handleNewFolder} 
            onFilterChange={setFilterType} 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
        <div className="w-full max-w-4xl mx-auto mt-6 mb-4 px-6">
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
        <div className="px-6">
          <FileDropzone 
            onUploadSuccess={() => setRefreshKey(k => k + 1)} 
            currentPath={path}
          />
        </div>
        <FileList 
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

export default PlatformDashboard;