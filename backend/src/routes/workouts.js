const express = require('express');
const router = express.Router();
const {
  createWorkout,
  getWorkoutsByUser
} = require('../controllers/workoutController');

router.post('/', createWorkout);
router.get('/:userId', getWorkoutsByUser);

module.exports = router;