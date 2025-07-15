const StorageInfo = ({ used, total }) => {
  const percentage = (used / total) * 100;

  return (
    <div className="p-4 border-t border-gray-200 absolute bottom-0 w-full bg-white">
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-gray-600">Storage</span>
        <span className="font-medium">{used} GB of {total} GB </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StorageInfo;