import mongoose from 'mongoose';

/**
 * DailyLedgerRollup encapsulates aggregated financial stats to accelerate Dashboard queries.
 * This document is updated asynchronously by the Background Worker using $inc operations
 * to prevent database locking that occurs with purely synchronous or map-reduce patterns.
 */
const dailyLedgerRollupSchema = new mongoose.Schema({
    // Composite Key elements
    date: {
        type: Date,
        required: true,
        index: true
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    // Captured statically at time of creation, for historical accuracy and filter bypass logic.
    creatorRole: {
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    type: { // 'send' or 'receive'
        type: String,
        required: true,
        index: true
    },

    // Metrics for the specific combination above
    originalAmount: {
        type: Number,
        default: 0
    },
    totalPayoutLkr: {
        type: Number,
        default: 0
    },
    transactionCount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Creating a compound index for fast updates (upserts) by the background worker
dailyLedgerRollupSchema.index(
    { date: 1, staffId: 1, currency: 1, type: 1 },
    { unique: true, name: 'rollup_unique_key' }
);

const DailyLedgerRollup = mongoose.model('DailyLedgerRollup', dailyLedgerRollupSchema);

export default DailyLedgerRollup;
