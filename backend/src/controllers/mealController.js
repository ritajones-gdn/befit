const db = require('../config/database');

//log a meal 
const logMeal = async (req, res) => {
  try {
    //i need to get data from request
    const { name, calories, protein, carbs, fats, meal_type, logged_date } = req.body;

    //check validation aka fields valid
    if (!name || !calories || !meal_type) {
      return res.status(400).json({ 
        message: 'Name, calories and meal type are required' 
      });
    }
    
    //insert validated data into database
    const [result] = await db.query(
      `INSERT INTO meals 
        (user_id, name, calories, protein, carbs, fats, meal_type, logged_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        name,
        calories,
        protein || 0,
        carbs || 0,
        fats || 0,
        meal_type,
        logged_date || new Date().toISOString().split('T')[0]
      ]
    );

    return res.status(201).json({
      message: 'Meal logged successfully!',
      meal: {
        id: result.insertId,
        name,
        calories,
        protein: protein || 0,
        carbs: carbs || 0,
        fats: fats || 0,
        meal_type,
      }
    });

  } catch (error) {
    console.error('Log meal error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//getting todays meal + counting calories!! (updated: and calories burned)
const getTodayMeals = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    //query to get all the days meals
    const [meals] = await db.query(
      `SELECT * FROM meals 
       WHERE user_id = ? AND logged_date = ?
       ORDER BY logged_at ASC`,
      [req.user.id, today]
    );

    //calculate everything
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + parseFloat(meal.protein), 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + parseFloat(meal.carbs), 0);
    const totalFats = meals.reduce((sum, meal) => sum + parseFloat(meal.fats), 0);

    //get users calorie goal
    const [userRows] = await db.query(
      'SELECT calorie_goal FROM users WHERE id = ?',
      [req.user.id]
    );

    const calorieGoal = userRows[0].calorie_goal;
    
    //update:
     const [workoutRows] = await db.query(
      `SELECT COALESCE(SUM(calories_burned), 0) as total_burned 
       FROM workouts 
       WHERE user_id = ? AND logged_date = ?`,
      [req.user.id, today]
    );

const totalCaloriesBurned = parseInt(workoutRows[0].total_burned) || 0;    const netCalories = totalCalories - totalCaloriesBurned;
    const caloriesRemaining = calorieGoal - netCalories;


    return res.status(200).json({
      date: today,
      calorie_goal: calorieGoal,
      total_calories_eaten: totalCalories,
      total_calories_burned: totalCaloriesBurned,
      net_calories: netCalories,
      calories_remaining: caloriesRemaining,
      total_protein: totalProtein.toFixed(1),
      total_carbs: totalCarbs.toFixed(1),
      total_fats: totalFats.toFixed(1),
      meals
    });

  } catch (error) {
    console.error('Get today meals error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//meal history (by date)
const getMealHistory = async (req, res) => {
  try {

    //get date from url ex: /meals/history?date=2024-01-15
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }

    const [meals] = await db.query(
      `SELECT * FROM meals 
       WHERE user_id = ? AND logged_date = ?
       ORDER BY logged_at ASC`,
      [req.user.id, date]
    );

    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);

    return res.status(200).json({
      date,
      total_calories: totalCalories,
      meals
    });

  } catch (error) {
    console.error('Get meal history error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//delete meal
const deleteMeal = async (req, res) => {
  try {
    const { id } = req.params;

    //making tsure the meal belongs to this user by id
    const [rows] = await db.query(
      'SELECT id FROM meals WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    await db.query('DELETE FROM meals WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Meal deleted successfully!' });

  } catch (error) {
    console.error('Delete meal error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { logMeal, getTodayMeals, getMealHistory, deleteMeal };