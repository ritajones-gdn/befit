const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

//routes

//GET /notifications --> get all notifications
router.get('/', protect, getNotifications);

//GET /notifications/unread-count --> get unread count
router.get('/unread-count', protect, getUnreadCount);

//PUT /notifications/read-all --> mark all as read
router.put('/read-all', protect, markAllAsRead);

//PUT /notifications/:id/read --> mark one as read
router.put('/:id/read', protect, markAsRead);

//DELETE /notifications/:id --> delete a notification
router.delete('/:id', protect, deleteNotification);

module.exports = router;