import { useState } from 'react';
import FilesDisplay from './FilesDisplay';
import RecentActivity from './RecentActivity';

const ContentArea = ({ 
  activeTab, 
  selectedFiles, 
  setSelectedFiles, 
  setShowShareModal, 
  viewMode, 
  setViewMode 
}) => {
  const [files] = useState([
    { id: 1, name: 'Project Proposal.pdf', type: 'pdf', size: '2.4 MB', lastModified: '2023-05-15', starred: true },
    { id: 2, name: 'Vacation Photos', type: 'folder', size: '156 MB', lastModified: '2023-05-10', starred: false },
    { id: 3, name: 'Presentation.pptx', type: 'ppt', size: '8.7 MB', lastModified: '2023-05-08', starred: false },
    { id: 4, name: 'Budget.xlsx', type: 'sheet', size: '1.2 MB', lastModified: '2023-05-05', starred: true },
    { id: 5, name: 'Team Photo.jpg', type: 'image', size: '3.5 MB', lastModified: '2023-05-01', starred: false },
    { id: 6, name: 'Meeting Recording.mp4', type: 'video', size: '245 MB', lastModified: '2023-04-28', starred: false },
  ]);

  const recentActivities = [
    { action: 'upload', file: 'Project Proposal.pdf', time: '2 hours ago' },
    { action: 'download', file: 'Budget.xlsx', time: '1 day ago' },
    { action: 'share', file: 'Team Photo.jpg', time: '3 days ago' },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          {selectedFiles.length > 0 && (
            <>
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
              >
                <FiShare2 size={16} />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition">
                <FiDownload size={16} />
                <span>Download</span>
              </button>
              <button className="flex items-center space-x-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition">
                <FiTrash2 size={16} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <FilesDisplay 
        files={files}
        viewMode={viewMode}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
      />
      
      <RecentActivity activities={recentActivities} />
    </div>
  );
};

export default ContentArea;