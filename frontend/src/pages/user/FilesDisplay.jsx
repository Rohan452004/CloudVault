import { FiFile, FiImage, FiVideo, FiMusic, FiFolder, FiStar, FiShare2, FiDownload } from 'react-icons/fi';

const FilesDisplay = ({ files, viewMode, selectedFiles, setSelectedFiles }) => {
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FiFile className="text-red-500" />;
      case 'image': return <FiImage className="text-blue-500" />;
      case 'video': return <FiVideo className="text-purple-500" />;
      case 'music': return <FiMusic className="text-green-500" />;
      case 'folder': return <FiFolder className="text-yellow-500" />;
      default: return <FiFile className="text-gray-500" />;
    }
  };

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
        {files.map(file => (
          <div 
            key={file.id}
            onClick={() => setSelectedFiles(prev => 
              prev.includes(file.id) 
                ? prev.filter(id => id !== file.id) 
                : [...prev, file.id]
            )}
            className={`relative p-3 md:p-4 rounded-lg border hover:border-blue-400 cursor-pointer transition ${selectedFiles.includes(file.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="text-2xl md:text-3xl mb-1 md:mb-2">
                {getFileIcon(file.type)}
              </div>
              <p className="text-xs md:text-sm font-medium text-gray-800 truncate w-full">{file.name}</p>
              <p className="text-xs text-gray-500">{file.size}</p>
              <p className="text-xs text-gray-400 mt-1 hidden md:block">{file.lastModified}</p>
            </div>
            {file.starred && (
              <div className="absolute top-2 right-2 text-yellow-400">
                <FiStar size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {files.map(file => (
            <tr 
              key={file.id}
              onClick={() => setSelectedFiles(prev => 
                prev.includes(file.id) 
                  ? prev.filter(id => id !== file.id) 
                  : [...prev, file.id]
              )}
              className={`cursor-pointer ${selectedFiles.includes(file.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center text-xl">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{file.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.size}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file.lastModified}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-3">Share</button>
                <button className="text-blue-600 hover:text-blue-900">Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FilesDisplay;