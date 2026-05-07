const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getStats,
  getAllUsers,
  deactivateUser,
  reactivateUser,
  makeAdmin,
  removeAdmin,
  deleteUser,
  getAllPosts,
  deleteAnyPost
} = require('../controllers/adminController');

// Every admin route uses both protect AND adminOnly
//protect → must be logged in
//adminOnly → must be an admin

//stats
router.get('/stats', protect, adminOnly, getStats);

//users
router.get('/users', protect, adminOnly, getAllUsers);
router.put('/users/:id/deactivate', protect, adminOnly, deactivateUser);
router.put('/users/:id/reactivate', protect, adminOnly, reactivateUser);
router.put('/users/:id/make-admin', protect, adminOnly, makeAdmin);
router.delete('/users/:id', protect, adminOnly, deleteUser);
router.put('/users/:id/remove-admin', protect, adminOnly, removeAdmin);

//posts
router.get('/posts', protect, adminOnly, getAllPosts);
router.delete('/posts/:id', protect, adminOnly, deleteAnyPost);

module.exports = router;