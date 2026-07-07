import mongoose from 'mongoose';

// ENUMS FOR ACTIVITY TYPES
const ACTIVITY_TYPES = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  PLATFORM_CREATE: 'PLATFORM_CREATE',
  PLATFORM_UPDATE: 'PLATFORM_UPDATE',
  PLATFORM_DELETE: 'PLATFORM_DELETE',
  PLATFORM_ADJUST: 'PLATFORM_ADJUST',
  RATE_UPDATE: 'RATE_UPDATE',
};

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actionType: {
    type: String,
    enum: Object.values(ACTIVITY_TYPES),
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Stores dynamic JSON data about the action
    default: {}
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['auth', 'user_management', 'system', 'security'],
    default: 'system',
    index: true
  }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false }, // Only need a creation timestamp
  collection: 'activities'
});

// INDEXES FOR QUERY OPTIMIZATION
activitySchema.index({ user: 1, timestamp: -1 });
activitySchema.index({ actionType: 1, timestamp: -1 });
activitySchema.index({ category: 1, timestamp: -1 });

// STATICS
activitySchema.statics.logAction = async function (data) {
  try {
    return await this.create(data);
  } catch (error) {
    console.error('Error logging activity:', error.message);
    // Don't throw error to avoid breaking main application flow (logging should be non-blocking/fail-safe)
  }
};

activitySchema.statics.getRecent = function (limit = 50) {
  return this.find({}).sort({ timestamp: -1 }).limit(limit).populate('user', 'name email role');
};

activitySchema.statics.getUserTimeline = function (userId, limit = 20) {
  return this.find({ user: userId }).sort({ timestamp: -1 }).limit(limit);
};

// MODEL
const Activity = mongoose.model('Activity', activitySchema);

export { Activity, ACTIVITY_TYPES };
