import { useNavigate, useLocation } from 'react-router-dom';

const AdminNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
      
      {/* Left - Admin Title */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center">
          <span className="text-white text-sm">⚙️</span>
        </div>
        <h1 className="text-gray-900 font-bold text-lg">Admin</h1>
      </div>

      {/* Middle - Navigation Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
        <button
          onClick={() => navigate('/admin/stats')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            isActive('/admin/stats')
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => navigate('/admin/users')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            isActive('/admin/users')
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => navigate('/admin/posts')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
            isActive('/admin/posts')
              ? 'bg-white text-gray-900 shadow'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Community
        </button>
      </div>

      {/* Right - Profile Icon */}
      <button
        onClick={() => navigate('/my-profile')}
        className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center hover:bg-red-800 transition"
      >
        <span className="text-white text-sm">👤</span>
      </button>

    </div>
  );
};

export default AdminNav;