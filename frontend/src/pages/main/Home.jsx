import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTodayMeals } from '../../api/meals';
import { getStreak, checkIn } from '../../api/checkins';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const moods = [
  { value: 'great', emoji: '😁', label: 'Great' },
  { value: 'good', emoji: '😊', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'tired', emoji: '😴', label: 'Tired' },
  { value: 'bad', emoji: '😔', label: 'Bad' },
];

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  const [todaySummary, setTodaySummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check in popup states
  const [showCheckinPopup, setShowCheckinPopup] = useState(false);
  const [showStreakPopup, setShowStreakPopup] = useState(false);
  const [selectedMood, setSelectedMood] = useState('good');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [streakData, setStreakData] = useState(null);

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
    setSubmitting(true);
    try {
      const response = await checkIn({
        mood: selectedMood,
        note: note || null
      });
      setStreakData(response.data.streak);
      setShowCheckinPopup(false);
      setShowStreakPopup(true);
      setStreak(response.data.streak);
      setNote('');
    } catch (error) {
      const message = error.response?.data?.message;
      if (message?.includes('already checked in')) {
        toast.error('Already checked in today! Come back tomorrow 💪');
        setShowCheckinPopup(false);
      } else {
        toast.error('Check-in failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Circle progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const maxStreak = 30;
  const progress = Math.min(
    ((streakData?.current_streak || 0) / maxStreak) * circumference,
    circumference
  );
  const strokeDashoffset = circumference - progress;

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

      <div className="px-4 md:px-8 lg:px-12 py-6 max-w-7xl mx-auto">

        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome Back, {user?.full_name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-500 text-sm mt-1">Ready to find your flow today?</p>
        </div>

        {/* Top Row */}
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
                onClick={() => setShowCheckinPopup(true)}
                className="bg-red-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-800 transition"
              >
                Check in Today
              </button>
            </div>
          </div>

          {/* Today's Summary */}
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
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-3">
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
              onClick={() => navigate('/feed')}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 hover:bg-gray-50 transition"
            >
              <span className="text-2xl">🔍</span>
              <span className="text-sm font-medium text-gray-700">Find Friends</span>
            </button>
          </div>
        </div>

      </div>

      {/* ── Check In Mood Popup ── */}
      {showCheckinPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Daily Check-In 🔥</h2>
              <button
                onClick={() => setShowCheckinPopup(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Mood Selector */}
            <p className="text-gray-500 text-sm mb-3">How are you feeling today?</p>
            <div className="flex justify-between gap-2 mb-5">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`flex-1 flex flex-col items-center py-3 rounded-xl transition ${
                    selectedMood === mood.value
                      ? 'bg-red-900 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl mb-1">{mood.emoji}</span>
                  <span className={`text-xs font-medium ${
                    selectedMood === mood.value ? 'text-white' : 'text-gray-600'
                  }`}>
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Note */}
            <textarea
              placeholder="Add a note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm resize-none mb-4"
            />

            {/* Check In Button */}
            <button
              onClick={handleCheckIn}
              disabled={submitting}
              className="w-full py-3 bg-red-900 text-white font-semibold rounded-full hover:bg-red-800 transition disabled:opacity-50"
            >
              {submitting ? 'Checking in...' : '🔥 Check In'}
            </button>

          </div>
        </div>
      )}

      {/* ── Streak Updated Popup ── */}
      {showStreakPopup && streakData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">

            {/* Fire Icon */}
            <div className="text-4xl mb-2">🔥</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Streak Updated!
            </h2>

            {/* Circle Progress */}
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#7f1d1d"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">
                    {streakData.current_streak}
                  </span>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    days
                  </span>
                </div>
              </div>
            </div>

            {/* Longest Streak */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 mb-4">
              <span className="text-gray-500 text-sm">Longest streak</span>
              <span className="text-red-900 font-bold text-sm">
                {streakData.longest_streak} days
              </span>
            </div>

            {/* Quote */}
            <p className="text-gray-400 text-sm italic mb-6">
              "Keep your consistency going!"
            </p>

            {/* Continue Button */}
            <button
              onClick={() => setShowStreakPopup(false)}
              className="w-full py-3 bg-red-900 text-white font-semibold rounded-full hover:bg-red-800 transition"
            >
              Continue
            </button>

          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Home;