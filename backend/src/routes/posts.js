const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPost,
  getFeed,
  getPost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment
} = require('../controllers/postController');

//routes

//POST /posts --> create a post
router.post('/', protect, createPost);

//GET /posts/feed --> get feed from people you follow
router.get('/feed', protect, getFeed);

// GET /posts/:id --> get one post
router.get('/:id', protect, getPost);

// DELETE /posts/:id --> delete a post
router.delete('/:id', protect, deletePost);

//like routes

// POST /posts/:id/like --> like a post
router.post('/:id/like', protect, likePost);

// DELETE /posts/:id/unlike --> unlike a post
router.delete('/:id/unlike', protect, unlikePost);

//comment routes

// POST /posts/:id/comments --> add a comment
router.post('/:id/comments', protect, addComment);

// GET /posts/:id/comments --> get all comments
router.get('/:id/comments', protect, getComments);

// DELETE /posts/:id/comments/:commentId --> delete a comment
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;