import mongoose from 'mongoose';

// TRANSACTION CONSTANTS
const PLATFORMS = {
    RIA: 'ria',
    MONEYGRAM: 'moneygram',
    WESTERN_UNION: 'western_union',
    REMITLY: 'remitly',
    TAPTAP: 'taptap'
};

const TRANSACTION_TYPES = {
    SEND: 'send',
    RECEIVE: 'receive',
    DEPOSIT: 'deposit'
};

const TRANSACTION_STATUS = {
    ACTIVE: 'active',
    PENDING_CHANGE: 'pending_change',
    DELETED: 'deleted'
};

// TRANSACTION SCHEMA
const transactionSchema = new mongoose.Schema({
    
    platform: {
        type: String,
        required: [true, 'Platform is required'],
        lowercase: true,
        trim: true,
        index: true
    },

    type: {
        type: String,
        required: [true, 'Transaction type is required'],
        enum: Object.values(TRANSACTION_TYPES),
        index: true
    },

    senderName: {
        type: String,
        required: function() { return this.type === 'send'; },
        trim: true,
        uppercase: true,
        minlength: [2, 'Sender name too short'],
        maxlength: [100, 'Sender name too long']
    },

    receiverName: {
        type: String,
        required: function() { return this.type === 'receive'; },
        trim: true,
        uppercase: true,
        minlength: [2, 'Receiver name too short'],
        maxlength: [100, 'Receiver name too long']
    },

    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0.01, 'Amount must be greater than zero']
    },

    currency: {
        type: String,
        default: 'USD',
        uppercase: true,
        trim: true
    },

    exchangeRate: {
        type: Number,
        default: 1.0,
        min: 0
    },

    fees: {
        type: Number,
        default: 0,
        min: 0
    },

    totalPayout: {
        type: Number,
        index: true
    },

    isLocked: {
        type: Boolean,
        default: true,
        index: true
    },

    status: {
        type: String,
        enum: Object.values(TRANSACTION_STATUS),
        default: TRANSACTION_STATUS.ACTIVE,
        index: true
    },

    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    remarks: {
        type: String,
        trim: true,
        maxlength: 500
    },

    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
        index: true
    },

    modifiedAt: {
        type: Date,
        default: Date.now,
        index: true
    }

}, { timestamps: false, collection: 'transactions' });

// INDEXES
transactionSchema.index({ platform: 1, createdAt: -1 });
transactionSchema.index({ staffId: 1, createdAt: -1 });
transactionSchema.index({ senderName: 'text', receiverName: 'text' });

// PRE-SAVE MIDDLEWARE
transactionSchema.pre('save', function () {
    // EUR-only guard: no conversion needed — amount stays in EUR
    if (this.currency === 'EUR') this.exchangeRate = 1.0;

    // 1. Automatic Total Payout Calculation: (Amount * Rate) + Fees
    this.totalPayout = Number(((this.amount * (this.exchangeRate || 1)) + (this.fees || 0)).toFixed(2));

    // 2. Track Modification
    if (!this.isNew) {
        this.modifiedAt = new Date();
    }
});

// METHODS
transactionSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

// STATICS
transactionSchema.statics.findByStaff = function (staffId) {
    return this.find({ staffId, status: TRANSACTION_STATUS.ACTIVE }).sort({ createdAt: -1 });
};

const Transaction = mongoose.model('Transaction', transactionSchema);

export { Transaction, PLATFORMS, TRANSACTION_TYPES, TRANSACTION_STATUS };
