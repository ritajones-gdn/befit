const db = require('../config/database');

const createWorkout = async (req, res) => {
  const {
    user_id,
    title,
    workout_type,
    duration_minutes,
    notes,
    is_public,
    logged_date,
    sets
  } = req.body;

  if (!user_id || !title || !logged_date) {
    return res.status(400).json({
      message: 'user_id, title, and logged_date are required'
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [workoutResult] = await connection.query(
      `
      INSERT INTO workouts
      (user_id, title, workout_type, duration_minutes, notes, is_public, logged_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        title,
        workout_type || null,
        duration_minutes || null,
        notes || null,
        is_public || false,
        logged_date
      ]
    );

    const workoutId = workoutResult.insertId;

    if (Array.isArray(sets) && sets.length > 0) {
      for (const set of sets) {
        await connection.query(
          `
          INSERT INTO workout_sets
          (workout_id, exercise_name, sets, reps, weight_kg, duration_seconds, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            workoutId,
            set.exercise_name,
            set.sets || null,
            set.reps || null,
            set.weight_kg || null,
            set.duration_seconds || null,
            set.notes || null
          ]
        );
      }
    }

    await connection.commit();

    return res.status(201).json({
      message: 'Workout created successfully',
      workout_id: workoutId
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error('Error creating workout:', error);
    return res.status(500).json({
      message: 'Server error while creating workout',
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};

const getWorkoutsByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const [workouts] = await db.query(
      `
      SELECT * FROM workouts
      WHERE user_id = ?
      ORDER BY logged_date DESC, logged_at DESC
      `,
      [userId]
    );

    for (const workout of workouts) {
      const [sets] = await db.query(
        `
        SELECT * FROM workout_sets
        WHERE workout_id = ?
        ORDER BY created_at ASC
        `,
        [workout.id]
      );

      workout.sets = sets;
    }

    return res.status(200).json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return res.status(500).json({
      message: 'Server error while fetching workouts',
      error: error.message
    });
  }
};

module.exports = {
  createWorkout,
  getWorkoutsByUser
};