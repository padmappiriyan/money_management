import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['DISCREPANCY', 'SYSTEM', 'INFO']
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    targetRole: {
        type: String,
        required: true,
        enum: ['admin', 'supervisor', 'user']
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // If null, applies to all users of targetRole
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {} // E.g., ledgerId, discrepancyAmount, staffId
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index to quickly fetch unread notifications for a role
notificationSchema.index({ targetRole: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
