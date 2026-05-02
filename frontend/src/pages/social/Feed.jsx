import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFeed, likePost, unlikePost, deletePost } from '../../api/posts';
import { searchUsers } from '../../api/social';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchFeed = async () => {
    try {
      const response = await getFeed();
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      const response = await searchUsers(searchQuery);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleLike = async (post) => {
    try {
      if (post.liked_by_me) {
        await unlikePost(post.id);
        setPosts(posts.map(p => p.id === post.id
          ? { ...p, like_count: p.like_count - 1, liked_by_me: false }
          : p
        ));
      } else {
        await likePost(post.id);
        setPosts(posts.map(p => p.id === post.id
          ? { ...p, like_count: p.like_count + 1, liked_by_me: true }
          : p
        ));
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Post deleted!');
      setActiveMenu(null);
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diff = Math.floor((now - posted) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-900 text-lg font-medium">Loading feed... 📱</div>
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
          onClick={() => navigate('/create-post')}
          className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center hover:bg-red-800 transition"
        >
          <span className="text-white text-xl">+</span>
        </button>
      </div>

      <div className="px-4 md:px-8 lg:px-12 py-4 max-w-3xl mx-auto">

        {/* Search Bar */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-3 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm shadow-sm"
          />
        </div>

        {/* Search Results */}
        {searchQuery.trim().length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
            {searching ? (
              <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No users found</div>
            ) : (
              searchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => navigate(`/profile/${u.id}`)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-50 last:border-0"
                >
                  <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">
                      {getInitials(u.full_name)}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900 font-medium text-sm">{u.username}</p>
                    <p className="text-gray-400 text-xs">{u.full_name}</p>
                  </div>
                  <span className="ml-auto text-red-900">↗</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Suggested Users — only show when not searching */}
        {searchQuery.trim().length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden">
            <div className="p-3 border-b border-gray-50">
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                Suggested Users
              </h3>
            </div>
            <div className="p-2">
              <button
                onClick={() => navigate('/search')}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-900 text-lg">👥</span>
                </div>
                <div className="text-left">
                  <p className="text-gray-900 font-medium text-sm">Find Friends</p>
                  <p className="text-gray-400 text-xs">Discover people to follow</p>
                </div>
                <span className="ml-auto text-red-900">↗</span>
              </button>
            </div>
          </div>
        )}

        {/* Community Feed */}
        <div className="mb-4">
          <h3 className="text-gray-900 font-bold text-lg mb-4">Community Feed</h3>

          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-700 font-semibold">No posts yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Follow people to see their posts here
              </p>
              <button
                onClick={() => navigate('/search')}
                className="mt-4 px-6 py-2 bg-red-900 text-white rounded-full text-sm font-medium hover:bg-red-800 transition"
              >
                Find People to Follow
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">

                {/* Post Header */}
                <div className="flex items-center justify-between p-4">
                  <button
                    onClick={() => navigate(`/profile/${post.user_id}`)}
                    className="flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {getInitials(post.full_name)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-900 font-semibold text-sm">
                        {post.username}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {getTimeAgo(post.created_at)}
                      </p>
                    </div>
                  </button>

                  {/* Three dots menu */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenu(activeMenu === post.id ? null : post.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                    >
                      <span className="text-gray-400">⋮</span>
                    </button>
                    {activeMenu === post.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 z-10 min-w-32">
                        <button
                          onClick={() => navigate(`/profile/${post.user_id}`)}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-t-xl"
                        >
                          View Profile
                        </button>
                        {post.user_id === user?.id && (
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 rounded-b-xl"
                          >
                            Delete Post
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Image */}
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full object-cover max-h-80"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}

                {/* Caption */}
                {post.caption && (
                  <div className="px-4 py-3">
                    <p className="text-gray-800 text-sm">
                      <span className="font-semibold">{post.username}</span>{' '}
                      {post.caption}
                    </p>
                  </div>
                )}

                {/* Like and Comment */}
                <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-50">
                  <button
                    onClick={() => handleLike(post)}
                    className="flex items-center gap-1.5 hover:opacity-70 transition"
                  >
                    <span className={post.liked_by_me ? 'text-red-500' : 'text-gray-400'}>
                      {post.liked_by_me ? '❤️' : '🤍'}
                    </span>
                    <span className="text-gray-500 text-sm">{post.like_count}</span>
                  </button>
                  <button
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="flex items-center gap-1.5 hover:opacity-70 transition"
                  >
                    <span className="text-gray-400">💬</span>
                    <span className="text-gray-500 text-sm">{post.comment_count}</span>
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  );
};

export default Feed;