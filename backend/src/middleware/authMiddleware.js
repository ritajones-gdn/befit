const jwt = require('jsonwebtoken');

// ─── PROTECT ROUTE ──────────────────────────────────────────
//checks every protected route to make sure the user is logged in
//and as a valid token (ex: bouncer at the door)
const protect = (req, res, next) => {

  // 1. Get the token from the request header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'No token. Access denied.' 
    });
  }

  // 2. Grab just the token part after "Bearer "
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify the token is real and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach the user info to the request
    req.user = decoded;

    // 5. Move on to the actual route
    next();

  } catch (error) {
    return res.status(401).json({ 
      message: 'Invalid or expired token.' 
    });
  }
};

//ADMIN ONLY 
//checks if the user is an admin (we use later for admin features)
const adminOnly = (req, res, next) => {

  if (!req.user.is_admin) {
    return res.status(403).json({ 
      message: 'Access denied. Admins only.' 
    });
  }

  next();
};

module.exports = { protect, adminOnly };