const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');

// ─── REGISTER ───────────────────────────────────────────────
const register = async (req, res) => {

  // 1. Check if validation passed
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // 2. Pull the data the user sent
  const { username, email, password, full_name } = req.body;

  try {
    // 3. Check if email or username already exists
    const [existingUser] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ 
        message: 'Email or username already in use' 
      });
    }

    // 4. Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // 5. Save the new user to the database
    const [result] = await db.query(
      `INSERT INTO users (username, email, password_hash, full_name)
       VALUES (?, ?, ?, ?)`,
      [username, email, password_hash, full_name]
    );

    const newUserId = result.insertId;

    // 6. Create a streak record for this user
    await db.query(
      'INSERT INTO streaks (user_id) VALUES (?)',
      [newUserId]
    );

    // 7. Create a JWT token
    const token = jwt.sign(
      { id: newUserId, username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 8. Send back the token and user info
    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUserId,
        username,
        email,
        full_name
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

// ─── LOGIN ──────────────────────────────────────────────────
const login = async (req, res) => {

  // 1. Check validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // 2. Find the user by email
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    const user = rows[0];

    // 3. Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // 4. Create a JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 5. Send back the token
    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        calorie_goal: user.calorie_goal,
        fitness_goal: user.fitness_goal,
        is_admin: user.is_admin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      message: 'Server error. Please try again.' 
    });
  }
};

module.exports = { register, login };