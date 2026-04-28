const db = require('../config/database');

//get all notifications
const getNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(
      `SELECT n.*, u.username as actor_username, u.avatar_url as actor_avatar
       FROM notifications n
       LEFT JOIN users u ON n.actor_id = u.id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json({
      total: notifications.length,
      notifications
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//get unread count
const getUnreadCount = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = ? AND is_read = FALSE`,
      [req.user.id]
    );

    return res.status(200).json({
      unread_count: rows[0].count
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//mark one as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const [notification] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (notification.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );

    return res.status(200).json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );

    return res.status(200).json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const [notification] = await db.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (notification.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await db.query('DELETE FROM notifications WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Notification deleted!' });

  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//send streak milestone
const checkStreakMilestone = async (userId, currentStreak) => {
  try {
    const milestones = {
      3: '🔥 You are on a 3 day streak! Keep going!',
      7: '🔥 One week streak! You are on fire!',
      14: '🔥 Two week streak! You are unstoppable!',
      30: '🔥 30 day streak! You are a legend!',
      60: '🔥 60 day streak! Absolutely incredible!',
      100: '🔥 100 day streak! You are an inspiration!'
    };

    if (milestones[currentStreak]) {
      await db.query(
        `INSERT INTO notifications (user_id, actor_id, type, message)
         VALUES (?, NULL, 'streak_milestone', ?)`,
        [userId, milestones[currentStreak]]
      );
    }
  } catch (error) {
    console.error('Streak milestone error:', error);
  }
};

module.exports = { 
  getNotifications, 
  getUnreadCount,
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  checkStreakMilestone
};