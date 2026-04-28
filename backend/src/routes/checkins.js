const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  checkIn, 
  getStreak, 
  getCheckinHistory 
} = require('../controllers/checkinController');

//routes

//POST /checkins → daily check-in
router.post('/', protect, checkIn);

//GET /checkins/streak → get current and longest streak
router.get('/streak', protect, getStreak);

//GET /checkins/history → get all past check-ins
router.get('/history', protect, getCheckinHistory);

module.exports = router;