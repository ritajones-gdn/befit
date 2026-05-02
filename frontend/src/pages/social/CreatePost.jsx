import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../../api/posts';
import BottomNav from '../../components/BottomNav';
import toast from 'react-hot-toast';

const CreatePost = () => {
  const navigate = useNavigate();

  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!caption && !imageUrl) {
      toast.error('Please add a caption or image URL');
      return;
    }

    setSubmitting(true);
    try {
      await createPost({
        caption: caption || null,
        image_url: imageUrl || null
      });
      toast.success('Post shared! 🎉');
      navigate('/feed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Top Navbar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-30">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-red-900 font-medium"
        >
          <span>←</span>
          <span>Create Post</span>
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="text-red-900 font-semibold text-sm disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Post'}
        </button>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">

        {/* Image URL Input */}
        <div className="bg-gray-100 rounded-2xl p-8 mb-6 flex flex-col items-center justify-center min-h-48">
          {imageUrl ? (
            <div className="w-full">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl mb-3"
                onError={() => toast.error('Invalid image URL')}
              />
              <button
                onClick={() => setImageUrl('')}
                className="w-full text-center text-red-900 text-sm font-medium"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl">📷</span>
              </div>
              <p className="text-gray-700 font-semibold mb-1">Add Photo/Video</p>
              <p className="text-gray-400 text-sm mb-4">Share your wellness journey</p>
              <input
                type="url"
                placeholder="Paste image URL here..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 bg-white rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-900 text-sm text-center"
              />
            </>
          )}
        </div>

        {/* Caption */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
            Caption
          </label>
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            className="w-full px-2 py-2 text-gray-700 placeholder-gray-400 focus:outline-none text-sm resize-none"
          />
        </div>

        {/* Post Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-4 bg-red-900 text-white font-bold rounded-full hover:bg-red-800 transition disabled:opacity-50 text-lg flex items-center justify-center gap-2"
        >
          {submitting ? 'Posting...' : 'Post ➤'}
        </button>

      </div>

      <BottomNav />
    </div>
  );
};

export default CreatePost;