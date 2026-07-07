import asyncHandler from 'express-async-handler';
import { AuditLog } from '../models/auditLog.model.js';

/**
 * @desc    Get all audit logs with pagination and enhanced filtering
 * @route   GET /api/audit-logs
 * @access  Private (scoped to own logs for users; all logs for admin/supervisor)
 * @query   {number} pageNumber, {number} pageSize
 * @query   {string} startDate, {string} endDate   - ISO date strings for time range
 * @query   {string} eventType  - transaction type stored in details.type (send|receive|deposit)
 * @query   {string} platform   - platform slug stored in details.platform (ria|moneygram|western-union)
 */
const getAuditLogs = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 20;
    const page = Number(req.query.pageNumber) || 1;

    let query = {};
    const isAdminOrSupervisor = req.user.role === 'admin' || req.user.role === 'supervisor';

    // Role-based scoping: non-admin users see only their own logs
    if (!isAdminOrSupervisor) {
        query.userId = req.user._id;
    } else if (req.query.userId) {
        query.userId = req.query.userId;
    }

    // Filter by top-level action (CREATE / UPDATE / DELETE / EXPORT)
    if (req.query.action) {
        query.action = req.query.action;
    }

    // Filter by event type stored inside details (send | receive | deposit)
    if (req.query.eventType) {
        // Support comma-separated values: "send,receive"
        const types = req.query.eventType.split(',').map(t => t.trim()).filter(Boolean);
        query['details.type'] = types.length === 1 ? types[0] : { $in: types };
    }

    // Filter by platform slug stored inside details (ria | moneygram | western-union)
    if (req.query.platform) {
        const platforms = req.query.platform.split(',').map(p => p.trim()).filter(Boolean);
        query['details.platform'] = platforms.length === 1 ? platforms[0] : { $in: platforms };
    }

    // Date range filter on timestamp field
    if (req.query.startDate && req.query.endDate) {
        query.timestamp = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(new Date(req.query.endDate).setHours(23, 59, 59, 999))
        };
    } else if (req.query.startDate) {
        query.timestamp = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
        query.timestamp = { $lte: new Date(new Date(req.query.endDate).setHours(23, 59, 59, 999)) };
    }

    const count = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
        .populate('userId', 'name email role')
        .populate('transactionId', 'platform amount currency type status senderName receiverName')
        .sort({ timestamp: -1 })
        .skip(pageSize * (page - 1))
        .limit(pageSize);

    res.json({
        success: true,
        data: logs,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

export { getAuditLogs };
