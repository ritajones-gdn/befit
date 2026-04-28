const db = require('../config/database');
const { checkStreakMilestone } = require('./notificationController');

//daily checkin
const checkIn = async (req, res) => {
  try {
    const { mood, note } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check if user already checked in today
    const [existing] = await db.query(
      'SELECT id FROM checkins WHERE user_id = ? AND checkin_date = ?',
      [req.user.id, today]
    );

    if (existing.length > 0) {
      return res.status(409).json({ 
        message: 'You already checked in today! Come back tomorrow 💪' 
      });
    }

    //Save check-in
    await db.query(
      'INSERT INTO checkins (user_id, checkin_date, mood, note) VALUES (?, ?, ?, ?)',
      [req.user.id, today, mood || 'good', note || null]
    );

    // Get current streak data
    const [streakRows] = await db.query(
      'SELECT * FROM streaks WHERE user_id = ?',
      [req.user.id]
    );

    let currentStreak = 1;
    let longestStreak = 1;

    if (streakRows.length > 0) {
      const streak = streakRows[0];
      const lastDate = streak.last_checkin_date;

      if (lastDate) {
        //we check if they checked in yest
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate.toISOString().split('T')[0] === yesterdayStr) {
          //Consecutive day --> increase streak
          currentStreak = streak.current_streak + 1;
        } else {
          //Streak broken--> reset to 1
          currentStreak = 1;
        }
      }

      //update longest streak if current is higher
      longestStreak = Math.max(currentStreak, streak.longest_streak);

      //Update streak record
      await db.query(
        `UPDATE streaks 
         SET current_streak = ?, longest_streak = ?, last_checkin_date = ?
         WHERE user_id = ?`,
        [currentStreak, longestStreak, today, req.user.id]
      );

    } else {
      //First time checking in --> create streak record
      await db.query(
        `INSERT INTO streaks (user_id, current_streak, longest_streak, last_checkin_date)
         VALUES (?, 1, 1, ?)`,
        [req.user.id, today]
      );
    }

    //update to trigger streak milestone notification
    //check if user hit a milestone
    await checkStreakMilestone(req.user.id, currentStreak);

    return res.status(201).json({
      message: 'Check-in successful! 🎉',
      checkin: {
        date: today,
        mood: mood || 'good',
        note: note || null
      },
      streak: {
        current_streak: currentStreak,
        longest_streak: longestStreak
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get streak
const getStreak = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM streaks WHERE user_id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(200).json({
        current_streak: 0,
        longest_streak: 0,
        last_checkin_date: null,
        message: 'No check-ins yet. Start your streak today! 💪'
      });
    }

    return res.status(200).json({
      current_streak: rows[0].current_streak,
      longest_streak: rows[0].longest_streak,
      last_checkin_date: rows[0].last_checkin_date
    });

  } catch (error) {
    console.error('Get streak error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get checkin history
const getCheckinHistory = async (req, res) => {
  try {
    const [checkins] = await db.query(
      `SELECT * FROM checkins 
       WHERE user_id = ? 
       ORDER BY checkin_date DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      total_checkins: checkins.length,
      checkins
    });

  } catch (error) {
    console.error('Get checkin history error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { checkIn, getStreak, getCheckinHistory };