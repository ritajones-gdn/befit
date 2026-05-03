const db = require('../config/database');

//search users
const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const [users] = await db.query(
      `SELECT id, username, full_name, avatar_url, bio, fitness_goal
       FROM users 
       WHERE username LIKE ? AND id != ?`,
      [`%${username}%`, req.user.id]
    );

    return res.status(200).json({ users });

  } catch (error) {
    console.error('Search users error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//view any user's profile
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    //get user info
    const [users] = await db.query(
      `SELECT id, username, full_name, avatar_url, bio, fitness_goal
       FROM users WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    //get follower count
    const [followers] = await db.query(
      'SELECT COUNT(*) as count FROM follows WHERE following_id = ?',
      [id]
    );

    //get following count
    const [following] = await db.query(
      'SELECT COUNT(*) as count FROM follows WHERE follower_id = ?',
      [id]
    );

    //get total posts
    const [posts] = await db.query(
      'SELECT COUNT(*) as count FROM posts WHERE user_id = ?',
      [id]
    );

    //get total workouts
    const [workouts] = await db.query(
      'SELECT COUNT(*) as count FROM workouts WHERE user_id = ?',
      [id]
    );

    //get streak
    const [streak] = await db.query(
      'SELECT current_streak, longest_streak FROM streaks WHERE user_id = ?',
      [id]
    );

    //Check if logged in user already follows this person
    const [isFollowing] = await db.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, id]
    );

    return res.status(200).json({
      user,
      stats: {
        followers: followers[0].count,
        following: following[0].count,
        total_posts: posts[0].count,
        total_workouts: workouts[0].count,
        current_streak: streak.length > 0 ? streak[0].current_streak : 0,
        longest_streak: streak.length > 0 ? streak[0].longest_streak : 0
      },
      is_following: isFollowing.length > 0
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//follow a user
const followUser = async (req, res) => {
  try {
    const { id } = req.params;

    //Can't follow yourself obv
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: "You can't follow yourself!" });
    }

    //check if user exists
    const [user] = await db.query(
      'SELECT id, username FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    //check if already following
    const [existing] = await db.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: 'You already follow this user' });
    }

    //follow the user
    await db.query(
      'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
      [req.user.id, id]
    );

    //send notification to the followed user
    await db.query(
      `INSERT INTO notifications (user_id, actor_id, type, message)
       VALUES (?, ?, 'follow', ?)`,
      [id, req.user.id, `${req.user.username} started following you`]
    );

    return res.status(201).json({
      message: `You are now following ${user[0].username}!`
    });

  } catch (error) {
    console.error('Follow user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;

    //check if actually following
    const [existing] = await db.query(
      'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "You don't follow this user" });
    }

    await db.query(
      'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      [req.user.id, id]
    );

    return res.status(200).json({ message: 'Unfollowed successfully' });

  } catch (error) {
    console.error('Unfollow user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get my followers
const getFollowers = async (req, res) => {
  try {
    const [followers] = await db.query(
      `SELECT u.id, u.username, u.full_name, u.avatar_url
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.following_id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      total_followers: followers.length,
      followers
    });

  } catch (error) {
    console.error('Get followers error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get who im following
const getFollowing = async (req, res) => {
  try {
    const [following] = await db.query(
      `SELECT u.id, u.username, u.full_name, u.avatar_url
       FROM follows f
       JOIN users u ON f.following_id = u.id
       WHERE f.follower_id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      total_following: following.length,
      following
    });

  } catch (error) {
    console.error('Get following error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get user's post
const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;

    const [posts] = await db.query(
      `SELECT p.*, u.username, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [id]
    );

    return res.status(200).json({
      total_posts: posts.length,
      posts
    });

  } catch (error) {
    console.error('Get user posts error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get users workouts
const getUserWorkouts = async (req, res) => {
  try {
    const { id } = req.params;

    const [workouts] = await db.query(
      `SELECT * FROM workouts 
       WHERE user_id = ? 
       ORDER BY logged_date DESC
       LIMIT 10`,
      [id]
    );

    return res.status(200).json({
      total_workouts: workouts.length,
      workouts
    });

  } catch (error) {
    console.error('Get user workouts error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  searchUsers, 
  getUserProfile, 
  followUser, 
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserPosts,
  getUserWorkouts
};