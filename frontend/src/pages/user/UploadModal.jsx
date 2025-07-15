import { FiUpload, FiImage, FiFile, FiVideo, FiX } from 'react-icons/fi';

const UploadModal = ({ showUploadModal, setShowUploadModal }) => {
  if (!showUploadModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upload Files</h3>
            <button 
              onClick={() => setShowUploadModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 md:p-8 text-center bg-blue-50">
            <div className="flex justify-center mb-4">
              <FiUpload className="text-blue-500 text-3xl" />
            </div>
            <p className="text-sm text-gray-600 mb-2">Drag and drop files here or</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm">
              Browse Files
            </button>
            <p className="text-xs text-gray-500 mt-3">Supports: PDF, DOCX, XLSX, JPG, PNG, MP4 up to 2GB</p>
          </div>
          
          <div className="mt-4 md:mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Upload</h4>
            <div className="grid grid-cols-3 gap-2 md:gap-3">
              <button className="flex flex-col items-center p-2 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FiImage className="text-blue-500 mb-1 text-lg md:text-xl" />
                <span className="text-xs">Images</span>
              </button>
              <button className="flex flex-col items-center p-2 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FiFile className="text-blue-500 mb-1 text-lg md:text-xl" />
                <span className="text-xs">Documents</span>
              </button>
              <button className="flex flex-col items-center p-2 md:p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <FiVideo className="text-blue-500 mb-1 text-lg md:text-xl" />
                <span className="text-xs">Videos</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;