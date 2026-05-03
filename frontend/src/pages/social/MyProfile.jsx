import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getTodayMeals } from '../../api/meals';
import { getWorkoutHistory } from '../../api/workouts';
import { getUserPosts, getFollowers, getFollowing } from '../../api/social';
import { getStreak } from '../../api/checkins';
import { updateProfile } from '../../api/users';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const fitnessGoals = [
  { value: 'lose_weight', label: 'Lose Weight', description: 'Focus on calorie deficit and cardio.', calories: 1800 },
  { value: 'maintain', label: 'Maintain', description: 'Steady energy levels and balance.', calories: 2000 },
  { value: 'build_muscle', label: 'Build Muscle', description: 'Strength training and high protein.', calories: 2500 },
];

const MyProfile = () => {
  const navigate = useNavigate();
  const { user, login, token } = useAuth();

  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [meals, setMeals] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [streak, setStreak] = useState({ current_streak: 0 });
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    calorie_goal: user?.calorie_goal || 2000,
    fitness_goal: user?.fitness_goal || 'maintain'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    const [postsRes, mealsRes, workoutsRes, streakRes, followersRes, followingRes] = await Promise.all([
      getUserPosts(user?.id),
      getTodayMeals(),
      getWorkoutHistory(),
      getStreak(),
      getFollowers(),
      getFollowing()
    ]);
    setPosts(postsRes.data.posts);
    setMeals(mealsRes.data);
    setWorkouts(workoutsRes.data.workouts);
    setStreak(streakRes.data);
    setFollowersCount(followersRes.data.total_followers);
    setFollowingCount(followingRes.data.total_following);
  } catch (error) {
    console.error('Error fetching profile data:', error);
  } finally {
    setLoading(false);
  }
};
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await updateProfile(editForm);
      // Update auth context with new user data
      login(response.data.user, token);
      toast.success('Profile updated! ✅');
      setShowEdit(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getWorkoutEmoji = (type) => {
    const emojis = {
      strength: '💪', cardio: '🏃', yoga: '🧘',
      cycling: '🚴', flexibility: '🤸', sports: '⚽', other: '🏋️'
    };
    return emojis[type] || '🏋️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-900 text-lg font-medium">Loading profile... 👤</div>
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
        <button
          onClick={() => setShowEdit(true)}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition"
        >
          <span className="text-lg">⚙️</span>
        </button>
      </div>

      <div className="px-4 md:px-8 lg:px-12 py-6 max-w-3xl mx-auto">

        {/* Profile Header */}
        <div className="text-center mb-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-red-900 mx-auto mb-3 overflow-hidden flex items-center justify-center bg-red-900">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-full h-full object-cover"
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {getInitials(user?.full_name)}
              </span>
            )}
          </div>

          {/* Name and Bio */}
          <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
          <p className="text-gray-400 text-sm mt-1">@{user?.username}</p>
          {user?.bio && (
            <p className="text-gray-600 text-sm mt-2 max-w-xs mx-auto">{user.bio}</p>
          )}

          {/* Stats */}
<div className="flex justify-center gap-6 mt-4">
  <div className="text-center">
    <p className="text-xl font-bold text-gray-900">{workouts.length}</p>
    <p className="text-gray-400 text-xs uppercase tracking-wide">Workouts</p>
  </div>
  <div className="text-center">
    <p className="text-xl font-bold text-gray-900">{posts.length}</p>
    <p className="text-gray-400 text-xs uppercase tracking-wide">Posts</p>
  </div>
  <div className="text-center">
    <p className="text-xl font-bold text-gray-900">{followersCount}</p>
    <p className="text-gray-400 text-xs uppercase tracking-wide">Followers</p>
  </div>
  <div className="text-center">
    <p className="text-xl font-bold text-gray-900">{followingCount}</p>
    <p className="text-gray-400 text-xs uppercase tracking-wide">Following</p>
  </div>
</div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          {['posts', 'meals', 'activities'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition capitalize ${
                activeTab === tab
                  ? 'bg-red-900 text-white shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Recent Posts</h3>
            {posts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <p className="text-4xl mb-3">📝</p>
                <p className="text-gray-700 font-semibold">No posts yet</p>
                <button
                  onClick={() => navigate('/create-post')}
                  className="mt-4 px-6 py-2 bg-red-900 text-white rounded-full text-sm font-medium"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {getInitials(user?.full_name)}
                      </span>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm">{user?.username}</p>
                  </div>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post"
                      className="w-full object-cover max-h-64"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  {post.caption && (
                    <div className="px-4 py-3">
                      <p className="text-gray-800 text-sm">{post.caption}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-50">
                    <span className="text-gray-400 text-sm">❤️ {post.like_count}</span>
                    <span className="text-gray-400 text-sm">💬 {post.comment_count}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Meals Tab */}
        {activeTab === 'meals' && meals && (
          <div>
            <h3 className="text-gray-900 font-bold text-lg mb-4">Today's Nutrition</h3>
            <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">
                Total Daily Progress
              </p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">
                  {meals.total_calories_eaten}
                </span>
                <span className="text-gray-400 text-sm">/ {meals.calorie_goal} kcal</span>
              </div>
              <p className="text-gray-400 text-xs mb-4">
                {meals.calories_remaining} calories remaining
              </p>

              {/* Macros */}
              {[
                { label: 'Protein', value: meals.total_protein, goal: 150, color: 'bg-red-900' },
                { label: 'Carbs', value: meals.total_carbs, goal: 250, color: 'bg-gray-800' },
                { label: 'Fats', value: meals.total_fats, goal: 70, color: 'bg-red-300' },
              ].map((macro) => (
                <div key={macro.label} className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{macro.label}</span>
                    <span>{macro.value}g</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`${macro.color} h-2 rounded-full`}
                      style={{ width: `${Math.min((macro.value / macro.goal) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Today's Meals List */}
            {meals.meals?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50">
                  <h4 className="text-gray-900 font-bold">Today's Meals</h4>
                </div>
                {meals.meals.map((meal) => (
                  <div key={meal.id} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-gray-800 text-sm font-medium">{meal.name}</p>
                      <p className="text-gray-400 text-xs capitalize">{meal.meal_type}</p>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">{meal.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-bold text-lg">Recent Activity</h3>
            </div>
            {workouts.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <p className="text-4xl mb-3">🏋️</p>
                <p className="text-gray-700 font-semibold">No workouts yet</p>
                <button
                  onClick={() => navigate('/log-workout')}
                  className="mt-4 px-6 py-2 bg-red-900 text-white rounded-full text-sm font-medium"
                >
                  Log Your First Workout
                </button>
              </div>
            ) : (
              workouts.map((workout) => (
                <div key={workout.id} className="bg-white rounded-2xl p-4 shadow-sm mb-3 flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{getWorkoutEmoji(workout.workout_type)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-semibold text-sm">{workout.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(workout.logged_date).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric'
                      })}
                      {workout.duration_minutes && ` • ${workout.duration_minutes} min`}
                      {workout.calories_burned > 0 && ` • ${workout.calories_burned} kcal`}
                    </p>
                  </div>
                  <span className="text-gray-300">›</span>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* ── Edit Profile Modal ── */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center py-8 px-4">
            <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden">

              {/* Edit Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <button
                  onClick={() => setShowEdit(false)}
                  className="flex items-center gap-2 text-red-900 font-medium"
                >
                  <span>←</span>
                  <span>Edit Profile</span>
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* Avatar Preview */}
                <div className="flex flex-col items-center mb-2">
                  <div className="w-20 h-20 rounded-full bg-red-900 flex items-center justify-center overflow-hidden border-4 border-red-900 mb-2">
                    {editForm.avatar_url ? (
                      <img
                        src={editForm.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {getInitials(editForm.full_name)}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">Tap to change avatar</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm resize-none"
                  />
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={editForm.avatar_url}
                    onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm"
                  />
                </div>

                {/* Daily Calorie Goal */}
                <div>
                  <h3 className="text-gray-900 font-bold text-lg mb-3">Daily Calorie Goal</h3>
                  <div className="bg-gray-50 rounded-2xl p-4 mb-3">
                    <p className="text-gray-400 text-xs mb-1">Current Target</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {editForm.calorie_goal}
                      </span>
                      <span className="text-gray-400 text-sm">kcal</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { label: 'Lose Weight', calories: 1800 },
                      { label: 'Maintain', calories: 2000 },
                      { label: 'Build Muscle', calories: 2500 },
                    ].map((option) => (
                      <button
                        key={option.label}
                        onClick={() => setEditForm({ ...editForm, calorie_goal: option.calories })}
                        className={`flex-1 py-3 rounded-xl text-xs font-medium transition ${
                          editForm.calorie_goal === option.calories
                            ? 'bg-red-900 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <p>{option.label}</p>
                        <p className="opacity-70">{option.calories} kcal</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fitness Focus */}
                <div>
                  <h3 className="text-gray-900 font-bold text-lg mb-3">Fitness Focus</h3>
                  <div className="space-y-2">
                    {fitnessGoals.map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => setEditForm({ ...editForm, fitness_goal: goal.value })}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition ${
                          editForm.fitness_goal === goal.value
                            ? 'border-red-900 bg-red-50'
                            : 'border-gray-100 bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          editForm.fitness_goal === goal.value
                            ? 'border-red-900 bg-red-900'
                            : 'border-gray-300'
                        }`}>
                          {editForm.fitness_goal === goal.value && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-gray-900 font-medium text-sm">{goal.label}</p>
                          <p className="text-gray-400 text-xs">{goal.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full py-4 bg-red-900 text-white font-bold rounded-full hover:bg-red-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Saving...' : 'Save Changes ✅'}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MyProfile;