const db = require('../config/database');

//
//log workout
const logWorkout = async (req, res) => {
  try {
    const { title, workout_type, duration_minutes, notes, logged_date } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Workout title is required' });
    }

    const [result] = await db.query(
      `INSERT INTO workouts 
        (user_id, title, workout_type, duration_minutes, notes, logged_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title,
        workout_type || null,
        duration_minutes || null,
        notes || null,
        logged_date || new Date().toISOString().split('T')[0]
      ]
    );

    return res.status(201).json({
      message: 'Workout logged successfully!',
      workout: {
        id: result.insertId,
        title,
        workout_type,
        duration_minutes,
        notes
      }
    });

  } catch (error) {
    console.error('Log workout error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//we can add sets to a workout
const addSets = async (req, res) => {
  try {
    const { id } = req.params;
    const { exercise_name, sets, reps, weight_kg, duration_seconds, notes } = req.body;

    if (!exercise_name) {
      return res.status(400).json({ message: 'Exercise name is required' });
    }

    //imp to make sure the workout belongs to the user
    const [workout] = await db.query(
      'SELECT id FROM workouts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (workout.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    const [result] = await db.query(
      `INSERT INTO workout_sets 
        (workout_id, exercise_name, sets, reps, weight_kg, duration_seconds, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        exercise_name,
        sets || null,
        reps || null,
        weight_kg || null,
        duration_seconds || null,
        notes || null
      ]
    );

    return res.status(201).json({
      message: 'Sets added successfully!',
      set: {
        id: result.insertId,
        exercise_name,
        sets,
        reps,
        weight_kg
      }
    });

  } catch (error) {
    console.error('Add sets error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//can get workout history
const getWorkoutHistory = async (req, res) => {
  try {
    const [workouts] = await db.query(
      `SELECT * FROM workouts 
       WHERE user_id = ? 
       ORDER BY logged_date DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      total_workouts: workouts.length,
      workouts
    });

  } catch (error) {
    console.error('Get workout history error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//can get one workout with its set
const getWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    //get workout
    const [workout] = await db.query(
      'SELECT * FROM workouts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (workout.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    //get all sets of that particular workout
    const [sets] = await db.query(
      'SELECT * FROM workout_sets WHERE workout_id = ?',
      [id]
    );

    return res.status(200).json({
      workout: workout[0],
      sets
    });

  } catch (error) {
    console.error('Get workout error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//delete workout
const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;

    //we have to make sure the workout is to that specific user
    const [workout] = await db.query(
      'SELECT id FROM workouts WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (workout.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }

    //then automatically by CASCADE the sets of that workout get deleted
    await db.query('DELETE FROM workouts WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Workout deleted successfully!' });

  } catch (error) {
    console.error('Delete workout error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { logWorkout, addSets, getWorkoutHistory, getWorkout, deleteWorkout };