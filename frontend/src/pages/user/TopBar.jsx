import { FiMenu, FiSearch } from 'react-icons/fi';

const TopBar = ({ 
  activeTab, 
  searchQuery, 
  setSearchQuery, 
  sidebarOpen, 
  setSidebarOpen, 
  isMobile 
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex items-center w-full md:w-auto">
        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="mr-4 text-gray-600 hover:text-gray-800"
          >
            <FiMenu size={24} />
          </button>
        )}
        <h2 className="text-xl font-semibold text-gray-800 capitalize">
          {activeTab === 'myFiles' ? 'My Files' : activeTab}
        </h2>
      </div>
      
      <div className="w-full md:w-64 relative">
        <input
          type="text"
          placeholder="Search files..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
    </div>
  );
};

export default TopBar;