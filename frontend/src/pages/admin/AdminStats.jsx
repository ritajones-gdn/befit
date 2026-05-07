import { useState, useEffect } from 'react';
import { getStats } from '../../api/admin';
import AdminNav from '../../components/AdminNav';

const StatCard = ({ icon, label, value, wide }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm ${wide ? 'flex items-center gap-4' : ''}`}>
    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-4 flex-shrink-0">
      <span className="text-xl">{icon}</span>
    </div>
    <div>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900">
        {value?.toLocaleString()}
      </p>
    </div>
  </div>
);

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-900 text-lg font-medium">Loading stats... 📊</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="px-4 md:px-8 lg:px-12 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-red-900">Platform Overview</h2>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back. Here is a curated view of BeFit's ecosystem performance.
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon="👥"
            label="Total Users"
            value={stats?.total_users}
          />
          <StatCard
            icon="🏋️"
            label="Total Workouts"
            value={stats?.total_workouts}
          />
          <StatCard
            icon="🍽️"
            label="Total Meals Logged"
            value={stats?.total_meals_logged}
          />
          <StatCard
            icon="📝"
            label="Total Posts"
            value={stats?.total_posts}
          />
          <StatCard
            icon="✅"
            label="Total Check-ins"
            value={stats?.total_checkins}
          />
          <StatCard
            icon="🔗"
            label="Total Follows"
            value={stats?.total_follows}
          />
        </div>

        {/* Activity Insights */}
        <div className="mb-6">
          <h3 className="text-gray-900 font-bold text-xl mb-4">Activity Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              icon="🆕"
              label="New Users Today"
              value={stats?.new_users_today}
              wide={true}
            />
            <StatCard
              icon="📈"
              label="Active Users This Week"
              value={stats?.active_users_this_week}
              wide={true}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminStats;