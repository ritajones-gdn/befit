import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, followUser, unfollowUser, getUserPosts, getUserWorkouts } from '../../api/social';
import { getWorkoutHistory } from '../../api/workouts';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    // If viewing own profile redirect to my profile
    if (parseInt(id) === user?.id) {
      navigate('/my-profile');
      return;
    }
    fetchData();
  }, [id]);

  const fetchData = async () => {
  try {
    const [profileRes, postsRes, workoutsRes] = await Promise.all([
      getUserProfile(id),
      getUserPosts(id),
      getUserWorkouts(id)
    ]);
    setProfile(profileRes.data);
    setPosts(postsRes.data.posts);
    setWorkouts(workoutsRes.data.workouts);
  } catch (error) {
    console.error('Error fetching profile:', error);
  } finally {
    setLoading(false);
  }
};

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      if (profile.is_following) {
        await unfollowUser(id);
        setProfile({
          ...profile,
          is_following: false,
          stats: { ...profile.stats, followers: profile.stats.followers - 1 }
        });
        toast.success('Unfollowed!');
      } else {
        await followUser(id);
        setProfile({
          ...profile,
          is_following: true,
          stats: { ...profile.stats, followers: profile.stats.followers + 1 }
        });
        toast.success('Following! 🎉');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setFollowLoading(false);
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">User not found</div>
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
        <div className="w-10" />
      </div>

      <div className="px-4 md:px-8 lg:px-12 py-6 max-w-3xl mx-auto">

        {/* Profile Header */}
        <div className="text-center mb-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-red-900 mx-auto mb-3 overflow-hidden flex items-center justify-center bg-red-900">
            {profile.user?.avatar_url ? (
              <img
                src={profile.user.avatar_url}
                alt={profile.user.full_name}
                className="w-full h-full object-cover"
                onError={(e) => e.target.style.display = 'none'}
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {getInitials(profile.user?.full_name)}
              </span>
            )}
          </div>

          {/* Name and Bio */}
          <h2 className="text-2xl font-bold text-gray-900">{profile.user?.full_name}</h2>
          <p className="text-gray-400 text-sm mt-1">@{profile.user?.username}</p>
          {profile.user?.bio && (
            <p className="text-gray-600 text-sm mt-2 max-w-xs mx-auto">
              {profile.user.bio}
            </p>
          )}

          {/* Follow Button */}
          <button
            onClick={handleFollow}
            disabled={followLoading}
            className={`mt-4 px-8 py-2 rounded-full font-semibold text-sm transition disabled:opacity-50 ${
              profile.is_following
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-red-900 text-white hover:bg-red-800'
            }`}
          >
            {followLoading ? '...' : profile.is_following ? 'Following ✓' : '+ Follow'}
          </button>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-4">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{profile.stats?.total_workouts}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Workouts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{profile.stats?.total_posts}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{profile.stats?.followers}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{profile.stats?.following}</p>
              <p className="text-gray-400 text-xs uppercase tracking-wide">Following</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-6">
          {['posts', 'activities'].map((tab) => (
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
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {getInitials(profile.user?.full_name)}
                      </span>
                    </div>
                    <p className="text-gray-900 font-semibold text-sm">
                      {profile.user?.username}
                    </p>
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

        {/* Activities Tab */}
{activeTab === 'activities' && (
  <div>
    <h3 className="text-gray-900 font-bold text-lg mb-4">Recent Activity</h3>

    {/* Streak Info */}
    {profile.stats?.current_streak > 0 && (
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center gap-4">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-gray-900 font-bold">
            {profile.stats.current_streak} Day Streak!
          </p>
          <p className="text-gray-400 text-xs">
            Longest: {profile.stats.longest_streak} days
          </p>
        </div>
      </div>
    )}

    {/* Workouts List */}
    {workouts.length === 0 ? (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
        <p className="text-4xl mb-3">🏋️</p>
        <p className="text-gray-700 font-semibold">No workouts yet</p>
      </div>
    ) : (
      workouts.map((workout) => (
        <div
          key={workout.id}
          className="bg-white rounded-2xl p-4 shadow-sm mb-3 flex items-center gap-4"
        >
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

      <BottomNav />
    </div>
  );
};

export default Profile;