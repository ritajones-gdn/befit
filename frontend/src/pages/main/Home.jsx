import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTodayMeals } from '../../api/meals';
import { getStreak, checkIn } from '../../api/checkins';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [todaySummary, setTodaySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const disciplines = [
    { name: 'Pilates', emoji: '🧘', color: 'bg-rose-100', type: 'flexibility' },
    { name: 'Cardio', emoji: '🏃', color: 'bg-red-100', type: 'cardio' },
    { name: 'Yoga', emoji: '🧘‍♀️', color: 'bg-pink-100', type: 'yoga' },
    { name: 'Strength', emoji: '💪', color: 'bg-red-200', type: 'strength' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [streakRes, mealsRes] = await Promise.all([
        getStreak(),
        getTodayMeals()
      ]);
      setStreak(streakRes.data);
      setTodaySummary(mealsRes.data);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const response = await checkIn({ mood: 'good' });
      toast.success(response.data.message);
      setStreak(response.data.streak);
    } catch (error) {
      const message = error.response?.data?.message;
      if (message?.includes('already checked in')) {
        toast.error('Already checked in today! Come back tomorrow 💪');
      } else {
        toast.error('Check-in failed. Please try again.');
      }
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-900 text-lg font-medium">Loading... 💪</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">💪</span>
        </div>
        <h1 className="text-gray-900 font-bold text-lg">BeFit</h1>
        <button
          onClick={() => navigate('/my-profile')}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 lg:px-12 py-6 max-w-7xl mx-auto">

        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome Back, {user?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">Ready to find your flow today?</p>
        </div>

        {/* Top Row — Streak + Summary side by side on tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Streak Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-5xl font-bold text-gray-900">
                  {streak.current_streak}
                </span>
                <span className="text-3xl">🔥</span>
              </div>
              <p className="text-gray-600 text-sm font-medium mt-1">Current Day Streak</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-gray-400 text-xs">📍</span>
                <span className="text-gray-400 text-xs">
                  Longest streak: {streak.longest_streak} days
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs mb-2 italic max-w-24">
                "Keep your consistency going!"
              </p>
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="bg-red-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-800 transition disabled:opacity-50"
              >
                {checkingIn ? 'Checking in...' : 'Check in Today'}
              </button>
            </div>
          </div>

          {/* Today's Summary Card */}
          {todaySummary && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="text-gray-900 font-bold mb-4">Today's Summary 🍽️</h3>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-900">
                    {todaySummary.total_calories_eaten}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Eaten</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {todaySummary.total_calories_burned}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Burned</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {todaySummary.calories_remaining}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Remaining</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Daily Goal Progress</span>
                  <span>{todaySummary.total_calories_eaten} / {todaySummary.calorie_goal} kcal</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-red-900 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((todaySummary.total_calories_eaten / todaySummary.calorie_goal) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Explore Disciplines */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900 font-bold text-lg">Explore Disciplines</h3>
            <button
              onClick={() => navigate('/log-workout')}
              className="text-red-900 text-sm font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {disciplines.map((discipline) => (
              <button
                key={discipline.name}
                onClick={() => navigate('/log-workout')}
                className={`${discipline.color} rounded-2xl p-4 flex flex-col items-center justify-center aspect-square hover:opacity-80 transition`}
              >
                <span className="text-3xl mb-2">{discipline.emoji}</span>
                <span className="text-xs font-medium text-gray-700">
                  {discipline.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-gray-900 font-bold text-lg mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => navigate('/log-meal')}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition"
            >
              <span className="text-2xl">🥗</span>
              <span className="text-sm font-medium text-gray-700">Log Meal</span>
            </button>
            <button
              onClick={() => navigate('/log-workout')}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition"
            >
              <span className="text-2xl">🏋️</span>
              <span className="text-sm font-medium text-gray-700">Log Workout</span>
            </button>
            <button
              onClick={() => navigate('/feed')}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition"
            >
              <span className="text-2xl">📱</span>
              <span className="text-sm font-medium text-gray-700">View Feed</span>
            </button>
            <button
              onClick={() => navigate('/checkin')}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition"
            >
              <span className="text-2xl">✅</span>
              <span className="text-sm font-medium text-gray-700">Check In</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;