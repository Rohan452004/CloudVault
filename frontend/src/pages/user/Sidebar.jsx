import { FiUpload, FiFile, FiUsers, FiStar, FiClock, FiTrash2 } from 'react-icons/fi';
import StorageInfo from './StorageInfo';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  setShowUploadModal, 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile 
}) => {
  const navItems = [
    { id: 'myFiles', icon: <FiFile />, label: 'My Files' },
    { id: 'shared', icon: <FiUsers />, label: 'Shared with me' },
    { id: 'starred', icon: <FiStar />, label: 'Starred' },
    { id: 'recent', icon: <FiClock />, label: 'Recent' },
    { id: 'trash', icon: <FiTrash2 />, label: 'Trash' },
  ];

  return (
    <>
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      <div className={`${isMobile ? 'fixed' : 'relative'} ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 z-30 w-64 bg-white shadow-md transition-transform duration-300 ease-in-out h-full`}>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">CloudVault</h1>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <nav className="p-4 h-[calc(100%-180px)] overflow-y-auto">
          <div className="mb-6">
            <button 
              onClick={() => {
                setShowUploadModal(true);
                if (isMobile) setSidebarOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
            >
              <FiUpload />
              <span>Upload</span>
            </button>
          </div>
          
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 py-2 px-3 rounded-lg ${activeTab === item.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <StorageInfo used={3.8} total={15} />
      </div>
    </>
  );
};

export default Sidebar;