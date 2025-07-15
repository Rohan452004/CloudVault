import { FiX } from 'react-icons/fi';

const ShareModal = ({ showShareModal, setShowShareModal }) => {
  if (!showShareModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Share Files</h3>
            <button 
              onClick={() => setShowShareModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Share with</label>
            <div className="flex">
              <input
                type="text"
                placeholder="Enter email addresses"
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 rounded-r-lg text-sm md:text-base">
                Add
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Permission</label>
            <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base">
              <option>Can view</option>
              <option>Can edit</option>
              <option>Can comment</option>
            </select>
          </div>
          
          <div className="mb-4 md:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
            <textarea
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
              placeholder="Add a message..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-2 md:space-x-3">
            <button 
              onClick={() => setShowShareModal(false)}
              className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm md:text-base"
            >
              Cancel
            </button>
            <button className="px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm md:text-base">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;