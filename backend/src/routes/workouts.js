const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const workoutController = require('../controllers/workoutController');


router.post('/log', protect, workoutController.logWorkout);

router.post('/:id/sets', protect, workoutController.addSets);

router.get('/history', protect, workoutController.getWorkoutHistory);

router.get('/:id', protect, workoutController.getWorkout);

router.delete('/:id', protect, workoutController.deleteWorkout);

module.exports = router;