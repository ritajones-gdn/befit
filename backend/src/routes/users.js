const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../controllers/userController');

//routes
//gGET /users/profile → get my profile
//protect --> must be logged in to access this
router.get('/profile', protect, getProfile);

//PUT /users/profile → update my profile
router.put('/profile', protect, updateProfile);

module.exports = router;
