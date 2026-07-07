import mongoose from 'mongoose';

const AUDIT_ACTIONS = {
    CREATE: 'CREATE',
    EXPORT: 'EXPORT',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE'
};

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        enum: Object.values(AUDIT_ACTIONS),
        required: true,
        index: true
    },
    transactionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        index: true // Optional, as some actions (like export) don't map to a single transaction
    },
    details: {
        type: mongoose.Schema.Types.Mixed, // Flexible JSON structure for varying action details
        default: {}
    }
}, {
    timestamps: { createdAt: 'timestamp', updatedAt: false }, // automatically adds 'timestamp'
    collection: 'audit_logs'
});

// Indexes for performance
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });

// Static helper method to seamlessly create logs without breaking main flow
auditLogSchema.statics.logAction = async function ({ userId, action, transactionId, details }) {
    try {
        await this.create({
            userId,
            action,
            transactionId,
            details
        });
    } catch (error) {
        console.error('AuditLogging failed:', error.message);
        // We do not throw to prevent blocking the main user request just because logging failed.
    }
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export { AuditLog, AUDIT_ACTIONS };
