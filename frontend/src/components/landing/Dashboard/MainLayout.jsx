import { useState, useEffect } from 'react';
import Sidebar from '../../../pages/user/Sidebar';
import TopBar from '../../../pages/user/TopBar';
import ContentArea from '../../../pages/user/ContentArea';
import UploadModal from '../../../pages/user/UploadModal';
import ShareModal from '../../../pages/user/ShareModal';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('myFiles');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setSidebarOpen(false);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setShowUploadModal={setShowUploadModal}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
      />
      
      <div className="flex-1 overflow-auto">
        <TopBar 
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />
        
        <ContentArea
          activeTab={activeTab}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          setShowShareModal={setShowShareModal}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>
      
      <UploadModal 
        showUploadModal={showUploadModal}
        setShowUploadModal={setShowUploadModal}
      />
      
      <ShareModal 
        showShareModal={showShareModal}
        setShowShareModal={setShowShareModal}
      />
    </div>
  );
};

export default MainLayout;