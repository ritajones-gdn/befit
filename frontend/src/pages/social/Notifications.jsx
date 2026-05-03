import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../../api/notifications';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      follow: '👤',
      like: '❤️',
      comment: '💬',
      streak_milestone: '🔥',
      friend_request: '👥',
      friend_accepted: '🤝',
      calorie_goal_reached: '🎯',
      workout_milestone: '💪'
    };
    return icons[type] || '🔔';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now - created) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return 'Yesterday';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-900 text-lg font-medium">Loading alerts... 🔔</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">💪</span>
          </div>
          <h1 className="text-gray-900 font-bold text-lg">BeFit</h1>
        </div>
      </div>

      <div className="px-4 md:px-8 lg:px-12 py-6 max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Alerts</h2>
            <p className="text-gray-400 text-sm mt-1">
              Your sanctuary of activity and community.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-red-900 text-sm font-medium hover:opacity-70 transition mt-1"
            >
              <span>✓✓</span>
              <span className="hidden md:block">Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-700 font-semibold">No alerts yet</p>
            <p className="text-gray-400 text-sm mt-1">
              When someone follows you or likes your posts you'll see it here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.is_read && handleMarkRead(notification.id)}
                className={`group bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition ${
                  !notification.is_read ? 'border-l-4 border-red-900' : ''
                }`}
              >
                {/* Avatar or Icon */}
                <div className="flex-shrink-0">
                  {notification.actor_username ? (
                    <div className="w-12 h-12 bg-red-900 rounded-full flex items-center justify-center">
                      {notification.actor_avatar ? (
                        <img
                          src={notification.actor_avatar}
                          alt={notification.actor_username}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <span className="text-white text-sm font-bold">
                          {getInitials(notification.actor_username)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                      <span className="text-2xl">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {notification.message}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {getTimeAgo(notification.created_at)}
                  </p>
                </div>

                {/* Unread dot + Delete */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!notification.is_read && (
                    <div className="w-2.5 h-2.5 bg-red-900 rounded-full" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notification.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                  >
                    <span className="text-gray-300 hover:text-red-500 text-xs">✕</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;