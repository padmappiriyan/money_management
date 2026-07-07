import asyncHandler from 'express-async-handler';
import Notification from '../models/notification.model.js';

/**
 * @desc    Get notifications for the logged in user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
    // Fetch notifications aimed at the user's role (e.g. 'admin') or specifically at the user.
    const notifications = await Notification.find({
        $or: [
            { targetRole: req.user.role, targetUserId: null },
            { targetUserId: req.user._id }
        ]
    }).sort({ createdAt: -1 }).limit(50); // Get last 50 notifications

    res.json({
        success: true,
        data: notifications
    });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        res.status(404);
        throw new Error('Notification not found');
    }

    // A notification targeted to a role might be marked as read by anyone in that role.
    // In a stricter system, you'd have a user-notification mapping.
    // For simplicity, we just mark the global notification as read.
    notification.isRead = true;
    await notification.save();

    res.json({
        success: true,
        data: notification
    });
});

export {
    getNotifications,
    markAsRead
};
