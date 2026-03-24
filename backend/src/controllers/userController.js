const db = require('../config/database');

//get the profile 
const getProfile = async (req, res) => {
  try {
    //req.user.id comes from the JWT token via protect middleware
    const [rows] = await db.query(
      `SELECT id, username, email, full_name, avatar_url, 
              bio, calorie_goal, fitness_goal, is_admin, 
              is_active, created_at 
       FROM users 
       WHERE id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: rows[0] });

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//update profile
const updateProfile = async (req, res) => {
  try {
    //only allow these fields to be updated
    const { full_name, bio, avatar_url, calorie_goal, fitness_goal } = req.body;

    await db.query(
      `UPDATE users 
       SET full_name = ?, bio = ?, avatar_url = ?, 
           calorie_goal = ?, fitness_goal = ?
       WHERE id = ?`,
      [full_name, bio, avatar_url, calorie_goal, fitness_goal, req.user.id]
    );

    //fetch the updated profile and send it back
    const [rows] = await db.query(
      `SELECT id, username, email, full_name, avatar_url,
              bio, calorie_goal, fitness_goal
       FROM users 
       WHERE id = ?`,
      [req.user.id]
    );

    return res.status(200).json({
      message: 'Profile updated successfully!',
      user: rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile };