import { useState, useEffect } from 'react';
import { getAllPosts, deleteAnyPost } from '../../api/admin';
import AdminNav from '../../components/AdminNav';
import toast from 'react-hot-toast';

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await getAllPosts();
      setPosts(response.data.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await deleteAnyPost(id);
      setPosts(posts.filter(p => p.id !== id));
      toast.success('Post deleted!');
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
    const created = new Date(date);
    const diff = Math.floor((now - created) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return 'Yesterday';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-900 text-lg font-medium">Loading posts... 📝</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="px-4 md:px-8 lg:px-12 py-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-red-900">Community Content</h2>
          <p className="text-gray-400 text-sm mt-1 max-w-lg">
            Reviewing the sanctuary. Maintain the editorial quality and safety of our wellness space by moderating recent user contributions.
          </p>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-700 font-semibold">No posts yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Posts from users will appear here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
              >
                {/* Post Header */}
                <div className="flex items-center gap-3 p-4">
                  <div className="w-9 h-9 bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {getInitials(post.full_name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-semibold text-sm">
                      {post.full_name}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {getTimeAgo(post.created_at)}
                    </p>
                  </div>
                </div>

                {/* Post Image */}
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Post"
                    className="w-full object-cover h-48"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}

                {/* Caption */}
                {post.caption && (
                  <div className="px-4 py-3 flex-1">
                    <p className="text-gray-700 text-sm italic">
                      "{post.caption}"
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="px-4 py-2 flex items-center gap-4 border-t border-gray-50">
                  <span className="text-gray-400 text-xs">❤️ {post.like_count} likes</span>
                  <span className="text-gray-400 text-xs">💬 {post.comment_count} comments</span>
                </div>

                {/* Delete Button */}
                <div className="p-4 pt-2">
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="w-full py-2.5 bg-red-900 text-white font-semibold rounded-xl hover:bg-red-800 transition flex items-center justify-center gap-2 text-sm"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPosts;