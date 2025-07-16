import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import PathBar from "../../components/dashboard/PathBar";
import SearchBar from "../../components/dashboard/SearchBar";
import ActionsBar from "../../components/dashboard/ActionsBar";
import FileDropzone from "../../components/dashboard/FileDropzone";
import FileList from "../../components/dashboard/FileList";

const SelfManagedDashboard = () => {
  const [aws, setAws] = useState(null);
  const [path, setPath] = useState("/");
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState([]); // Dummy files for now
  const navigate = useNavigate();

  useEffect(() => {
    const creds = localStorage.getItem('selfS3');
    if (!creds) {
      navigate('/');
    } else {
      setAws(JSON.parse(creds));
      // Dummy files for UI
      setFiles([
        { id: 1, name: "Documents", type: "folder" },
        { id: 2, name: "Resume.pdf", type: "file" },
        { id: 3, name: "Photos", type: "folder" },
        { id: 4, name: "Invoice.xlsx", type: "file" },
      ]);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('selfS3');
    navigate('/');
  };

  const handleNavigate = (newPath) => setPath("/" + newPath);
  const handleSearch = (val) => setSearch(val);
  const handleNewFolder = () => alert("New Folder Clicked");
  const handleFilter = () => alert("Filter Clicked");
  const handleDrop = (files) => alert(`Dropped ${files.length} file(s)`);
  const handleFileClick = (file) => alert(`Open file: ${file.name}`);
  const handleFolderClick = (folder) => alert(`Open folder: ${folder.name}`);
  const handleAction = (action, file) => alert(`${action} ${file.name}`);

  if (!aws) return null;

  return (
    <div className="min-h-screen bg-[#111113]">
      <DashboardHeader title="CloudVault" bucketName={aws.bucket} onLogout={handleLogout} />
      <main className="max-w-4xl mx-auto mt-10 rounded-2xl overflow-hidden shadow-xl bg-[#18181b]">
        <PathBar path={path} onNavigate={handleNavigate} />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 bg-[#18181b]">
          <SearchBar value={search} onChange={handleSearch} />
          <ActionsBar onNewFolder={handleNewFolder} onFilter={handleFilter} />
        </div>
        <FileDropzone onDrop={handleDrop} />
        <FileList files={files} onFileClick={handleFileClick} onFolderClick={handleFolderClick} onAction={handleAction} />
      </main>
    </div>
  );
};

export default SelfManagedDashboard;
