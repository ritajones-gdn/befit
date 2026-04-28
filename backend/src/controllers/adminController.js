const db = require('../config/database');

//get app stat
const getStats = async (req, res) => {
  try {
    const [totalUsers] = await db.query(
      'SELECT COUNT(*) as count FROM users'
    );

    const [totalWorkouts] = await db.query(
      'SELECT COUNT(*) as count FROM workouts'
    );

    const [totalMeals] = await db.query(
      'SELECT COUNT(*) as count FROM meals'
    );

    const [totalPosts] = await db.query(
      'SELECT COUNT(*) as count FROM posts'
    );

    const [totalCheckins] = await db.query(
      'SELECT COUNT(*) as count FROM checkins'
    );

    const [totalFollows] = await db.query(
      'SELECT COUNT(*) as count FROM follows'
    );

    const [newUsersToday] = await db.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE DATE(created_at) = CURDATE()`
    );

    const [activeUsersThisWeek] = await db.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM checkins 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`
    );

    return res.status(200).json({
      stats: {
        total_users: totalUsers[0].count,
        total_workouts: totalWorkouts[0].count,
        total_meals_logged: totalMeals[0].count,
        total_posts: totalPosts[0].count,
        total_checkins: totalCheckins[0].count,
        total_follows: totalFollows[0].count,
        new_users_today: newUsersToday[0].count,
        active_users_this_week: activeUsersThisWeek[0].count
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get all users
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, username, email, full_name, 
              is_admin, is_active, created_at 
       FROM users
       ORDER BY created_at DESC`
    );

    return res.status(200).json({
      total_users: users.length,
      users
    });

  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//deactivate a user
const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        message: "You can't deactivate your own account!" 
      });
    }

    const [user] = await db.query(
      'SELECT id, username FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.query(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [id]
    );

    return res.status(200).json({ 
      message: `${user[0].username} has been deactivated` 
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//reactivate user
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query(
      'SELECT id, username FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.query(
      'UPDATE users SET is_active = TRUE WHERE id = ?',
      [id]
    );

    return res.status(200).json({ 
      message: `${user[0].username} has been reactivated` 
    });

  } catch (error) {
    console.error('Reactivate user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//make user admin
const makeAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query(
      'SELECT id, username FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.query(
      'UPDATE users SET is_admin = TRUE WHERE id = ?',
      [id]
    );

    return res.status(200).json({ 
      message: `${user[0].username} is now an admin!` 
    });

  } catch (error) {
    console.error('Make admin error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ 
        message: "You can't delete your own account!" 
      });
    }

    const [user] = await db.query(
      'SELECT id, username FROM users WHERE id = ?',
      [id]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);

    return res.status(200).json({ 
      message: `${user[0].username} has been deleted` 
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get all posts
const getAllPosts = async (req, res) => {
  try {
    const [posts] = await db.query(
      `SELECT p.*, u.username, u.full_name
       FROM posts p
       JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );

    return res.status(200).json({
      total_posts: posts.length,
      posts
    });

  } catch (error) {
    console.error('Get all posts error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//delete any post
const deleteAnyPost = async (req, res) => {
  try {
    const { id } = req.params;

    const [post] = await db.query(
      'SELECT id FROM posts WHERE id = ?',
      [id]
    );

    if (post.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await db.query('DELETE FROM posts WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Post deleted by admin!' });

  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  deactivateUser,
  reactivateUser,
  makeAdmin,
  deleteUser,
  getAllPosts,
  deleteAnyPost
};