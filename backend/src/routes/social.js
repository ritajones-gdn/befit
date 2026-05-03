const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  searchUsers,
  getUserProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserPosts,
  getUserWorkouts
} = require('../controllers/socialController');

//routes 
//GET /social/search?username=john --> search for users
router.get('/search', protect, searchUsers);

//GET /social/users/:id --> view any user's profile
router.get('/users/:id', protect, getUserProfile);

//POST /social/users/:id/follow --> follow a user
router.post('/users/:id/follow', protect, followUser);

//DELETE /social/users/:id/unfollow --> unfollow a user
router.delete('/users/:id/unfollow', protect, unfollowUser);

//GET /social/followers --> get my followers
router.get('/followers', protect, getFollowers);

//GET /social/following --> get who I'm following
router.get('/following', protect, getFollowing);

// GET /social/users/:id/posts → get user's posts
router.get('/users/:id/posts', protect, getUserPosts);

// GET /social/users/:id/workouts → get user's workouts
router.get('/users/:id/workouts', protect, getUserWorkouts);

module.exports = router;