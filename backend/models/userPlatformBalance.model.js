import mongoose from 'mongoose';

const userPlatformBalanceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    platformId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Platform',
        required: true,
        index: true
    },
    balanceLkr: {
        type: Number,
        default: 0
    },
    // Daily Buckets for Shift Overview
    openingBalanceLkr: {
        type: Number,
        default: 0
    },
    todaySendLkr: {
        type: Number,
        default: 0
    },
    todayPaidLkr: {
        type: Number,
        default: 0
    },
    todayDepositLkr: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true, 
    collection: 'user_platform_balances' 
});

// Ensure a single record per User+Platform pairing for atomic consistency
userPlatformBalanceSchema.index({ userId: 1, platformId: 1 }, { unique: true });

const UserPlatformBalance = mongoose.model('UserPlatformBalance', userPlatformBalanceSchema);

export default UserPlatformBalance;
