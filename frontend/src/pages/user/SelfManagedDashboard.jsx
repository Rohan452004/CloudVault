import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAws } from "../../contexts/AwsContext";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import PathBar from "../../components/dashboard/PathBar";
import SearchBar from "../../components/dashboard/SearchBar";
import ActionsBar from "../../components/dashboard/ActionsBar";
import FileDropzone from "../../components/dashboard/FileDropzone";
import FileList from "../../components/dashboard/FileList";
import axios from "axios";

const SelfManagedDashboard = () => {
  const { aws, disconnectAws } = useAws();
  const [path, setPath] = useState(() => localStorage.getItem('cloudvault_path') || "");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
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
      await axios.post('http://localhost:3000/api/s3/create-folder', {
        accessKeyId: aws.accessKeyId,
        secretAccessKey: aws.secretAccessKey,
        bucket: aws.bucket,
        region: aws.region,
        folderPath,
      }, { withCredentials: true });
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
    console.log(`Opening folder: ${folder.name}`);
  };
  const handleAction = (action, file) => alert(`${action} ${file.name}`);

  if (!aws.accessKeyId) return null;

  return (
    <div className="min-h-screen bg-[#111113]">
      <DashboardHeader title="CloudVault" bucketName={aws.bucket} onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto mt-10 rounded-2xl overflow-hidden shadow-xl bg-[#18181b]">
        <PathBar path={path} onNavigate={handleNavigate} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 bg-[#18181b]">
          <SearchBar value={search} onChange={handleSearch} />
          <ActionsBar onNewFolder={handleNewFolder} onFilterChange={handleFilterChange} />
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
        />
      </main>
    </div>
  );
};

export default SelfManagedDashboard;
