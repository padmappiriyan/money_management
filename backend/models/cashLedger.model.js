import mongoose from 'mongoose';

const CASH_LEDGER_STATUS = {
    OPEN: 'open',
    LOCKED: 'locked',
    CLOSED: 'closed'
};

const cashLedgerSchema = new mongoose.Schema({
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
    currency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        default: 'LKR'
    },
    openingBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    expectedClosing: {
        type: Number,
        default: 0
    },
    actualClosing: {
        type: Number,
        default: 0,
        min: 0
    },
    cbAmount: {
        type: Number,
        default: 0
    },
    depositAmount: {
        type: Number,
        default: 0
    },
    creditAmount: {
        type: Number,
        default: 0
    },
    totalTransactionNet: {
        type: Number,
        default: 0
    },
    billetage: {
        type: Map,
        of: Number,
        default: {}
    },
    status: {
        type: String,
        enum: Object.values(CASH_LEDGER_STATUS),
        default: CASH_LEDGER_STATUS.OPEN,
        index: true
    },
    discrepancyNote: {
        type: String,
        trim: true,
        maxlength: 500
    },
    closedAt: {
        type: Date
    }
}, { 
    timestamps: true,
    collection: 'cash_ledgers'
});

// Compound index to ensure one ledger per staff/day/currency
cashLedgerSchema.index({ date: 1, staffId: 1, currency: 1 }, { unique: true });

// Helper to calculate difference
cashLedgerSchema.virtual('difference').get(function() {
    return (this.actualClosing || 0) - (this.expectedClosing || 0);
});

cashLedgerSchema.set('toJSON', { virtuals: true });
cashLedgerSchema.set('toObject', { virtuals: true });

const CashLedger = mongoose.model('CashLedger', cashLedgerSchema);

export { CashLedger, CASH_LEDGER_STATUS };
