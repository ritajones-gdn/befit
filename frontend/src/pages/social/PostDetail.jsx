import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPost, getComments, addComment, deleteComment, likePost, unlikePost } from '../../api/posts';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        getPost(id),
        getComments(id)
      ]);
      setPost(postRes.data.post);
      setComments(commentsRes.data.comments);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (post.liked_by_me) {
        await unlikePost(post.id);
        setPost({ ...post, like_count: post.like_count - 1, liked_by_me: false });
      } else {
        await likePost(post.id);
        setPost({ ...post, like_count: post.like_count + 1, liked_by_me: true });
      }
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await addComment(id, { content: newComment });
      setComments([...comments, {
        ...response.data.comment,
        username: user.username,
        full_name: user.full_name
      }]);
      setNewComment('');
      setPost({ ...post, comment_count: post.comment_count + 1 });
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(id, commentId);
      setComments(comments.filter(c => c.id !== commentId));
      setPost({ ...post, comment_count: post.comment_count - 1 });
      toast.success('Comment deleted!');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-900 text-lg font-medium">Loading... 💬</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Post not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-red-900 font-medium"
        >
          <span>←</span>
          <span>Post</span>
        </button>
      </div>

      <div className="px-4 md:px-8 py-4 max-w-2xl mx-auto">

        {/* Post */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">

          {/* Post Header */}
          <div className="flex items-center gap-3 p-4">
            <button onClick={() => navigate(`/profile/${post.user_id}`)}>
              <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {getInitials(post.full_name)}
                </span>
              </div>
            </button>
            <div>
              <p className="text-gray-900 font-semibold text-sm">{post.username}</p>
            </div>
          </div>

          {/* Post Image */}
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post"
              className="w-full object-cover max-h-80"
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

          {/* Like */}
          <div className="flex items-center gap-4 px-4 py-3 border-t border-gray-50">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5"
            >
              <span className={post.liked_by_me ? 'text-red-500' : 'text-gray-400'}>
                {post.liked_by_me ? '❤️' : '🤍'}
              </span>
              <span className="text-gray-500 text-sm">{post.like_count}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">💬</span>
              <span className="text-gray-500 text-sm">{post.comment_count}</span>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <h3 className="text-gray-900 font-bold">
              Comments ({comments.length})
            </h3>
          </div>

          {comments.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              No comments yet. Be the first! 💬
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="flex items-start gap-3 p-4 border-b border-gray-50 last:border-0"
              >
                <div className="w-8 h-8 bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {getInitials(comment.full_name)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-sm">
                    <span className="font-semibold">{comment.username}</span>{' '}
                    {comment.content}
                  </p>
                </div>
                {comment.user_id === user?.id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-gray-300 hover:text-red-500 text-xs"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <form onSubmit={handleAddComment} className="flex gap-3">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 px-4 py-3 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm shadow-sm"
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="px-5 py-3 bg-red-900 text-white rounded-xl font-medium text-sm hover:bg-red-800 transition disabled:opacity-50"
          >
            Post
          </button>
        </form>

      </div>

      <BottomNav />
    </div>
  );
};

export default PostDetail;