import { FiClock, FiUpload, FiDownload, FiShare2 } from 'react-icons/fi';

const RecentActivity = ({ activities }) => {
  const getActivityIcon = (action) => {
    switch (action) {
      case 'upload': return <FiUpload className="text-blue-600" />;
      case 'download': return <FiDownload className="text-green-600" />;
      case 'share': return <FiShare2 className="text-purple-600" />;
      default: return <FiClock className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <FiClock className="mr-2 text-blue-600" />
        Recent Activity
      </h3>
      <div className="space-y-3 md:space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start">
            <div className={`p-2 rounded-full mr-3 ${activity.action === 'upload' ? 'bg-blue-100' : activity.action === 'download' ? 'bg-green-100' : 'bg-purple-100'}`}>
              {getActivityIcon(activity.action)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                {activity.action === 'upload' ? 'Uploaded' : activity.action === 'download' ? 'Downloaded' : 'Shared'} {activity.file}
              </p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;