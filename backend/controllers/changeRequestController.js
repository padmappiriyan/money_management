import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { ChangeRequest, CHANGE_REQUEST_STATUS } from '../models/changeRequest.model.js';
import { Transaction, TRANSACTION_STATUS } from '../models/transaction.model.js';
import { User, USER_ROLES } from '../models/user.model.js';
import { AuditLog, AUDIT_ACTIONS } from '../models/auditLog.model.js';
import { publishTransactionUpdated } from '../queues/transactionQueue.js';

/**
 * @desc    Create a change request for a transaction
 * @route   POST /api/change-requests
 * @access  Private (Owner Staff)
 */
const createChangeRequest = asyncHandler(async (req, res) => {
    const { transactionId, field, newValue, reason } = req.body;

    // 1. Validation
    if (!transactionId || !field || newValue === undefined || !reason) {
        res.status(400);
        throw new Error('All fields are required (transactionId, field, newValue, reason)');
    }

    // 2. Check if transaction exists and is valid
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
        res.status(404);
        throw new Error('Transaction not found');
    }

    // 3. Security: Only the creator of the transaction can request a change
    if (transaction.staffId.toString() !== req.user.id && req.user.role !== USER_ROLES.ADMIN) {
        res.status(403);
        throw new Error('Not authorized to request changes for this transaction');
    }

    // 4. Check if a pending request already exists for this transaction and field
    const existingRequest = await ChangeRequest.findOne({
        transactionId,
        field,
        status: CHANGE_REQUEST_STATUS.PENDING
    });

    if (existingRequest) {
        res.status(400);
        throw new Error(`A pending change request for ${field} already exists for this transaction`);
    }

    // 5. Create Change Request
    const oldValue = transaction[field];
    if (oldValue === undefined) {
        res.status(400);
        throw new Error(`Invalid field: ${field}`);
    }

    const changeRequest = await ChangeRequest.create({
        transactionId,
        requestedBy: req.user.id,
        field,
        oldValue,
        newValue,
        reason
    });

    // 6. Update Transaction Status to reflect pending change
    transaction.status = TRANSACTION_STATUS.PENDING_CHANGE;
    await transaction.save();

    // 7. Audit Log
    AuditLog.logAction({
        userId: req.user.id,
        action: AUDIT_ACTIONS.UPDATE, // Using Update as the general action
        transactionId,
        details: {
            type: 'CHANGE_REQUEST_CREATED',
            field,
            newValue,
            reason
        }
    });

    res.status(201).json({
        success: true,
        data: changeRequest,
        message: 'Change request submitted successfully for approval'
    });
});

/**
 * @desc    Get all change requests (Admin sees all, Staff sees own)
 * @route   GET /api/change-requests
 * @access  Private
 */
const getChangeRequests = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 20;
    const page = Number(req.query.pageNumber) || 1;

    let query = {};

    // 1. Role-based filtering
    if (req.user.role === USER_ROLES.USER) {
        query.requestedBy = req.user.id;
    } else if (req.user.role === USER_ROLES.SUPERVISOR) {
        const users = await User.find({ role: USER_ROLES.USER }).select('_id');
        const userIds = users.map((u) => u._id);
        query.$or = [
            { requestedBy: new mongoose.Types.ObjectId(req.user.id) },
            { requestedBy: { $in: userIds } }
        ];
    }

    // 2. Status filter
    if (req.query.status) {
        query.status = req.query.status;
    }

    // 3. Transaction ID filter
    if (req.query.transactionId) {
        query.transactionId = req.query.transactionId;
    }

    const count = await ChangeRequest.countDocuments(query);
    const requests = await ChangeRequest.find(query)
        .populate('requestedBy', 'name email role')
        .populate('transactionId', 'platform type totalPayout createdAt')
        .populate('approvedBy', 'name role')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: requests,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

/**
 * @desc    Approve a change request (Admin only)
 * @route   PUT /api/change-requests/:id/approve
 * @access  Private (Admin)
 */
const approveChangeRequest = asyncHandler(async (req, res) => {
    const { adminRemarks } = req.body;

    const request = await ChangeRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Change request not found');
    }

    if (request.status !== CHANGE_REQUEST_STATUS.PENDING) {
        res.status(400);
        throw new Error('Request has already been processed');
    }

    // 1. Update Transaction
    const transaction = await Transaction.findById(request.transactionId);
    if (!transaction) {
        res.status(404);
        throw new Error('Associated transaction not found');
    }

    const oldAmount = transaction.amount;
    const oldFees = transaction.fees;
    const oldTotalPayout = transaction.totalPayout;
    const oldType = transaction.type;

    transaction[request.field] = request.newValue;
    transaction.status = TRANSACTION_STATUS.ACTIVE; // Return to active status
    const updatedTransaction = await transaction.save();

    // Publish update event to adjust rollup and balances
    publishTransactionUpdated({
        transaction: updatedTransaction,
        oldAmount,
        oldFees,
        oldTotalPayout,
        oldType
    });

    // 2. Update Request
    request.status = CHANGE_REQUEST_STATUS.APPROVED;
    request.approvedBy = req.user.id;
    request.adminRemarks = adminRemarks;
    await request.save();

    // 3. Audit Log
    AuditLog.logAction({
        userId: req.user.id,
        action: AUDIT_ACTIONS.UPDATE,
        transactionId: transaction._id,
        details: {
            type: 'CHANGE_REQUEST_APPROVED',
            request_id: request._id,
            field: request.field,
            oldValue: request.oldValue,
            newValue: request.newValue
        }
    });

    res.json({
        success: true,
        data: request,
        message: 'Change request approved and transaction updated'
    });
});

/**
 * @desc    Reject a change request (Admin only)
 * @route   PUT /api/change-requests/:id/reject
 * @access  Private (Admin)
 */
const rejectChangeRequest = asyncHandler(async (req, res) => {
    const { adminRemarks } = req.body;

    const request = await ChangeRequest.findById(req.params.id);

    if (!request) {
        res.status(404);
        throw new Error('Change request not found');
    }

    if (!adminRemarks) {
        res.status(400);
        throw new Error('Please provide admin remarks for rejection');
    }

    if (request.status !== CHANGE_REQUEST_STATUS.PENDING) {
        res.status(400);
        throw new Error('Request has already been processed');
    }

    // 1. Update Transaction Status (back to active)
    const transaction = await Transaction.findById(request.transactionId);
    if (transaction) {
        transaction.status = TRANSACTION_STATUS.ACTIVE;
        await transaction.save();
    }

    // 2. Update Request
    request.status = CHANGE_REQUEST_STATUS.REJECTED;
    request.approvedBy = req.user.id;
    request.adminRemarks = adminRemarks;
    await request.save();

    // 3. Audit Log
    AuditLog.logAction({
        userId: req.user.id,
        action: AUDIT_ACTIONS.DELETE, // Using delete as "reject/cancel" action
        transactionId: request.transactionId,
        details: {
            type: 'CHANGE_REQUEST_REJECTED',
            request_id: request._id,
            reason: adminRemarks
        }
    });

    res.json({
        success: true,
        data: request,
        message: 'Change request rejected'
    });
});

/**
 * @desc    Get change request by ID
 * @route   GET /api/change-requests/:id
 * @access  Private
 */
const getChangeRequestById = asyncHandler(async (req, res) => {
    const request = await ChangeRequest.findById(req.params.id)
        .populate('requestedBy', 'name email role')
        .populate('transactionId')
        .populate('approvedBy', 'name role');

    if (!request) {
        res.status(404);
        throw new Error('Change request not found');
    }

    // Authorization check: Admin or owner see the request
    if (req.user.role !== USER_ROLES.ADMIN && request.requestedBy._id.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to view this request');
    }

    res.json({
        success: true,
        data: request
    });
});

/**
 * @desc    Get change request analytics (Users see own, Supervisors see own + users, Admin sees all)
 * @route   GET /api/change-requests/stats/analytics
 * @access  Private
 */
const getChangeRequestAnalytics = asyncHandler(async (req, res) => {
    const match = {};
    if (req.user.role === USER_ROLES.USER) {
        match.requestedBy = new mongoose.Types.ObjectId(req.user.id);
    } else if (req.user.role === USER_ROLES.SUPERVISOR) {
        const users = await User.find({ role: USER_ROLES.USER }).select('_id');
        const userIds = users.map((u) => u._id);

        match.$or = [
            { requestedBy: new mongoose.Types.ObjectId(req.user.id) },
            { requestedBy: { $in: userIds } }
        ];
    }

    // 1. Get status counts
    const countsPipeline = [];
    if (Object.keys(match).length) {
        countsPipeline.push({ $match: match });
    }
    countsPipeline.push({ $group: { _id: '$status', count: { $sum: 1 } } });

    const counts = await ChangeRequest.aggregate(countsPipeline);

    const stats = {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        today: 0,
        chartData: []
    };

    counts.forEach(item => {
        stats.total += item.count;
        if (item._id === CHANGE_REQUEST_STATUS.PENDING) stats.pending = item.count;
        if (item._id === CHANGE_REQUEST_STATUS.APPROVED) stats.approved = item.count;
        if (item._id === CHANGE_REQUEST_STATUS.REJECTED) stats.rejected = item.count;
    });

    // 2. Get today's count
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayMatch = {
        ...match,
        createdAt: { $gte: startOfToday }
    };

    stats.today = await ChangeRequest.countDocuments(todayMatch);

    // 3. Get chart data for last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        last7Days.push({
            date: d.toISOString().split('T')[0],
            displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            count: 0
        });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const last7DaysMatch = {
        ...match,
        createdAt: { $gte: sevenDaysAgo }
    };

    const dailyTrend = await ChangeRequest.aggregate([
        { $match: last7DaysMatch },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 }
            }
        }
    ]);

    dailyTrend.forEach(item => {
        const day = last7Days.find(d => d.date === item._id);
        if (day) day.count = item.count;
    });

    stats.chartData = last7Days;

    res.json({
        success: true,
        data: stats
    });
});

export {
    createChangeRequest,
    getChangeRequests,
    getChangeRequestById,
    approveChangeRequest,
    rejectChangeRequest,
    getChangeRequestAnalytics
};
