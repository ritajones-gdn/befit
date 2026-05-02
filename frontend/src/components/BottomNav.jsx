import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleFabAction = (path) => {
    setFabOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* FAB Overlay */}
      {fabOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* FAB Actions */}
      {fabOpen && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center gap-2">
          <button
            onClick={() => handleFabAction('/log-workout')}
            className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-lg text-gray-800 font-medium text-sm hover:bg-gray-50 transition"
          >
            🏋️ Log Workout
          </button>
          <button
            onClick={() => handleFabAction('/create-post')}
            className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-lg text-gray-800 font-medium text-sm hover:bg-gray-50 transition"
          >
          📝 Post
          </button>
          <button
            onClick={() => handleFabAction('/log-meal')}
            className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full shadow-lg text-gray-800 font-medium text-sm hover:bg-gray-50 transition"
          >
            🥗 Log Meal
          </button>
        </div>
      )}

      {/* Bottom Navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
        <div className="bg-white rounded-t-3xl shadow-lg border border-gray-100">
          <div className="flex items-center justify-around px-4 py-2 max-w-lg mx-auto">

            {/* Home */}
            <Link to="/home" className="flex flex-col items-center py-1.5 px-3">
              <span className={`text-xl ${isActive('/home') ? 'opacity-100' : 'opacity-40'}`}>
                🏠
              </span>
              <span className={`text-xs mt-0.5 ${isActive('/home') ? 'text-red-900 font-semibold' : 'text-gray-400'}`}>
                Home
              </span>
            </Link>

            {/* Friends */}
            <Link to="/feed" className="flex flex-col items-center py-1.5 px-3">
              <span className={`text-xl ${isActive('/feed') ? 'opacity-100' : 'opacity-40'}`}>
                👥
              </span>
              <span className={`text-xs mt-0.5 ${isActive('/feed') ? 'text-red-900 font-semibold' : 'text-gray-400'}`}>
                Friends
              </span>
            </Link>

            {/* FAB */}
            <button
              onClick={() => setFabOpen(!fabOpen)}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition -mt-6 ${fabOpen ? 'bg-gray-800' : 'bg-red-900'}`}
            >
              <span className="text-white text-2xl font-light">
                {fabOpen ? '✕' : '+'}
              </span>
            </button>

            {/* Alerts */}
            <Link to="/notifications" className="flex flex-col items-center py-1.5 px-3">
              <span className={`text-xl ${isActive('/notifications') ? 'opacity-100' : 'opacity-40'}`}>
                🔔
              </span>
              <span className={`text-xs mt-0.5 ${isActive('/notifications') ? 'text-red-900 font-semibold' : 'text-gray-400'}`}>
                Alerts
              </span>
            </Link>

            {/* Profile */}
            <Link to="/my-profile" className="flex flex-col items-center py-1.5 px-3">
              <span className={`text-xl ${isActive('/my-profile') ? 'opacity-100' : 'opacity-40'}`}>
                👤
              </span>
              <span className={`text-xs mt-0.5 ${isActive('/my-profile') ? 'text-red-900 font-semibold' : 'text-gray-400'}`}>
                Profile
              </span>
            </Link>

          </div>
        </div>
      </div>
    </>
  );
};

export default BottomNav;