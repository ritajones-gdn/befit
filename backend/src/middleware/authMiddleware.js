const jwt = require('jsonwebtoken');
const db = require('../config/database');

//updated protect routes
const protect = async (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'No token. Access denied.' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Fetch fresh user data from database every request
    const [rows] = await db.query(
      'SELECT id, username, is_admin, is_active FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    //Check if user is deactivated
    if (!rows[0].is_active) {
      return res.status(401).json({ 
        message: 'Your account has been deactivated.' 
      });
    }

    //Attach fresh user data to request
    req.user = rows[0];

    next();

  } catch (error) {
    return res.status(401).json({ 
      message: 'Invalid or expired token.' 
    });
  }
};

//admin only
const adminOnly = (req, res, next) => {

  if (!req.user.is_admin) {
    return res.status(403).json({ 
      message: 'Access denied. Admins only.' 
    });
  }

  next();
};

module.exports = { protect, adminOnly };