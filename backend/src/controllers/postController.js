const db = require('../config/database');

//create post
const createPost = async (req, res) => {
  try {
    const { caption, image_url } = req.body;

    if (!caption && !image_url) {
      return res.status(400).json({ 
        message: 'Post must have a caption or image' 
      });
    }

    const [result] = await db.query(
      `INSERT INTO posts (user_id, caption, image_url)
       VALUES (?, ?, ?)`,
      [req.user.id, caption || null, image_url || null]
    );

    return res.status(201).json({
      message: 'Post created successfully! 🎉',
      post: {
        id: result.insertId,
        caption,
        image_url,
        like_count: 0,
        comment_count: 0
      }
    });

  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get feed
const getFeed = async (req, res) => {
  try {
    //get posts from people the user follows
    const [posts] = await db.query(
      `SELECT p.*, u.username, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id IN (
         SELECT following_id FROM follows WHERE follower_id = ?
       )
       OR p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT 20`,
      [req.user.id, req.user.id]
    );

    return res.status(200).json({
      total_posts: posts.length,
      posts
    });

  } catch (error) {
    console.error('Get feed error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get one post
const getPost = async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await db.query(
      `SELECT p.*, u.username, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json({ post: posts[0] });

  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//delete a post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    //we have to make sure post belongs to this user
    const [post] = await db.query(
      'SELECT id FROM posts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await db.query('DELETE FROM posts WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Post deleted successfully!' });

  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//like a post
const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    //first we need to check if post exists
    const [post] = await db.query(
      'SELECT * FROM posts WHERE id = ?',
      [id]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    //check if already liked
    const [existing] = await db.query(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'You already liked this post' });
    }

    //Like the post
    await db.query(
      'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
      [id, req.user.id]
    );

    //Update like count on post
    await db.query(
      'UPDATE posts SET like_count = like_count + 1 WHERE id = ?',
      [id]
    );

    //Send notification to post owner (if not liking own post)
    if (post[0].user_id !== req.user.id) {
      await db.query(
        `INSERT INTO notifications (user_id, actor_id, type, message)
         VALUES (?, ?, 'like', ?)`,
        [post[0].user_id, req.user.id, `${req.user.username} liked your post!`]
      );
    }

    return res.status(201).json({ message: 'Post liked!' });

  } catch (error) {
    console.error('Like post error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//unlike a post
const unlikePost = async (req, res) => {
  try {
    const { id } = req.params;

    //Check if liked
    const [existing] = await db.query(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "You haven't liked this post" });
    }

    //unlike
    await db.query(
      'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
      [id, req.user.id]
    );

    //Update like count
    await db.query(
      'UPDATE posts SET like_count = like_count - 1 WHERE id = ?',
      [id]
    );

    return res.status(200).json({ message: 'Post unliked!' });

  } catch (error) {
    console.error('Unlike post error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//add comment
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    //Check if post exists
    const [post] = await db.query(
      'SELECT * FROM posts WHERE id = ?',
      [id]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    //we add comment
    const [result] = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [id, req.user.id, content]
    );

    //then update comment count
    await db.query(
      'UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?',
      [id]
    );

    //Send notification to post owner (if not commenting on own post)
    if (post[0].user_id !== req.user.id) {
      await db.query(
        `INSERT INTO notifications (user_id, actor_id, type, message)
         VALUES (?, ?, 'comment', ?)`,
        [post[0].user_id, req.user.id, 
        `${req.user.username} commented: "${content}"`]
      );
    }

    return res.status(201).json({
      message: 'Comment added!',
      comment: {
        id: result.insertId,
        content,
        user_id: req.user.id,
        username: req.user.username
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get comments
const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const [comments] = await db.query(
      `SELECT c.*, u.username, u.full_name, u.avatar_url
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    );

    return res.status(200).json({
      total_comments: comments.length,
      comments
    });

  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;

    //make sure the comment alr belongs to this user
    const [comment] = await db.query(
      'SELECT id FROM comments WHERE id = ? AND user_id = ?',
      [commentId, req.user.id]
    );

    if (comment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await db.query('DELETE FROM comments WHERE id = ?', [commentId]);

    //update comment count
    await db.query(
      'UPDATE posts SET comment_count = comment_count - 1 WHERE id = ?',
      [id]
    );

    return res.status(200).json({ message: 'Comment deleted!' });

  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  createPost, 
  getFeed, 
  getPost, 
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment
};