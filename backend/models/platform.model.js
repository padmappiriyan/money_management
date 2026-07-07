import mongoose from 'mongoose';

const PLATFORM_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};

const platformSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Platform name is required'],
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [2, 'Platform name too short'],
        maxlength: [50, 'Platform name too long']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    logoUrl: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: Object.values(PLATFORM_STATUS),
        default: PLATFORM_STATUS.ACTIVE,
        index: true
    },
    createdBy: {
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
}, { timestamps: false, collection: 'platforms' });

// PRE-SAVE MIDDLEWARE
platformSchema.pre('save', function () {
    if (!this.isNew) {
        this.updatedAt = new Date();
    }
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }
});

// METHODS
platformSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

const Platform = mongoose.model('Platform', platformSchema);

export { Platform, PLATFORM_STATUS };
