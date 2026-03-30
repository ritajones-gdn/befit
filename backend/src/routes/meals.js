const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  logMeal, 
  getTodayMeals, 
  getMealHistory,
  deleteMeal 
} = require('../controllers/mealController');



//post -> log meal
router.post('/log', protect, logMeal);
//get -> get today;s meal + calorie summary
router.get('/today', protect, getTodayMeals);
//get -> get meals BY DATE
router.get('/history', protect, getMealHistory);
//delete 
router.delete('/:id', protect, deleteMeal);

module.exports = router;