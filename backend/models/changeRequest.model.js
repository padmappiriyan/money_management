import mongoose from 'mongoose';

const CHANGE_REQUEST_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected'
};

const changeRequestSchema = new mongoose.Schema({
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: [true, 'Transaction ID is required'],
        index: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Requesting user is required'],
        index: true
    },
    field: {
        type: String,
        required: [true, 'Field name is required'],
        trim: true
    },
    oldValue: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Old value is required']
    },
    newValue: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'New value is required']
    },
    reason: {
        type: String,
        required: [true, 'Reason for change is required'],
        trim: true,
        minlength: [5, 'Reason must be at least 5 characters'],
        maxlength: [500, 'Reason too long']
    },
    status: {
        type: String,
        enum: Object.values(CHANGE_REQUEST_STATUS),
        default: CHANGE_REQUEST_STATUS.PENDING,
        index: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    adminRemarks: {
        type: String,
        trim: true,
        maxlength: [500, 'Admin remarks too long']
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    modifiedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: false, collection: 'change_requests' });

// Indexes
changeRequestSchema.index({ status: 1, createdAt: -1 });
changeRequestSchema.index({ transactionId: 1, status: 1 });

// Pre-save middleware
changeRequestSchema.pre('save', function () {
    this.modifiedAt = new Date();
});

// Methods
changeRequestSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

const ChangeRequest = mongoose.model('ChangeRequest', changeRequestSchema);

export { ChangeRequest, CHANGE_REQUEST_STATUS };
