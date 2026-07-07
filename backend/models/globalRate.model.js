import mongoose from 'mongoose';

const globalRateSchema = new mongoose.Schema({
    sourceCurrency: {
        type: String,
        required: [true, 'Source currency code is required (e.g., USD)'],
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [3, 'Currency code must be 3 characters'],
        maxlength: [3, 'Currency code must be 3 characters']
    },
    targetCurrency: {
        type: String,
        default: 'LKR',
        trim: true,
        uppercase: true,
        required: true
    },
    rate: {
        type: Number,
        required: [true, 'Global exchange rate is required'],
        min: [0, 'Rate cannot be negative'],
        default: 1.0
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: false, collection: 'global_rates' });

// PRE-SAVE MIDDLEWARE
globalRateSchema.pre('save', function () {
    if (!this.isNew) {
        this.updatedAt = new Date();
    }
});

// METHODS
globalRateSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

const GlobalRate = mongoose.model('GlobalRate', globalRateSchema);

export { GlobalRate };
