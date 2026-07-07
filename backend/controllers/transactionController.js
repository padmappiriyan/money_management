import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { Transaction, PLATFORMS, TRANSACTION_TYPES, TRANSACTION_STATUS } from '../models/transaction.model.js';
import { USER_ROLES } from '../models/user.model.js';
import { AuditLog, AUDIT_ACTIONS } from '../models/auditLog.model.js';
import DailyLedgerRollup from '../models/dailyLedgerRollup.model.js';
import { publishTransactionCreated } from '../queues/transactionQueue.js';

/**
 * @desc    Create new transaction
 * @route   POST /api/transactions
 * @access  Private (Staff/Admin/Supervisor)
 */
const createTransaction = asyncHandler(async (req, res) => {
    const {
        platform,
        type,
        senderName,
        receiverName,
        amount,
        currency,
        exchangeRate,
        fees,
        remarks
    } = req.body;
    console.log(req.body);

    // 1. Basic Validation
    if (!platform || !type || !amount) {
        res.status(400);
        throw new Error('Platform, Type, and Amount are required');
    }

    if (type === 'send' && !senderName) {
        res.status(400);
        throw new Error('Sender Name is required for Send transactions');
    }

    if (type === 'receive' && !receiverName) {
        res.status(400);
        throw new Error('Receiver Name is required for Paid transactions');
    }

    // 2. Create Transaction
    // IMPORTANT: 'staffId' is automatically taken from the authenticated user (req.user.id)
    // and 'isLocked' defaults to 'true' from the Mongoose schema.
    const transaction = await Transaction.create({
        platform,
        type,
        senderName: senderName || undefined,
        receiverName: receiverName || undefined,
        amount,
        currency,
        exchangeRate,
        fees,
        remarks,
        staffId: req.user.id
    });

    if (transaction) {
        // 1. Audit Logging (fire-and-forget — non-blocking)
        AuditLog.logAction({
            userId: req.user.id,
            action: AUDIT_ACTIONS.CREATE,
            transactionId: transaction._id,
            details: { platform, type, amount }
        });

        // 2. Publish domain event so the Stats Worker updates rollup asynchronously.
        //    Pass staffRole as a snapshot so the worker never needs an extra DB lookup.
        console.log('>>> [Controller] Attempting to publish event for TX:', transaction._id);
        publishTransactionCreated({
            _id: transaction._id,
            staffId: req.user.id,
            staffRole: req.user.role,
            platform: transaction.platform,
            type: transaction.type,
            currency: transaction.currency || 'USD',
            amount: transaction.amount,
            totalPayout: transaction.totalPayout,
            createdAt: transaction.createdAt,
        });
        console.log('>>> [Controller] Publish call complete.');

        res.status(201).json({
            success: true,
            data: transaction,
            message: 'Transaction recorded and locked successfully'
        });
    } else {
        res.status(400);
        throw new Error('Invalid transaction data');
    }
});

/**
 * @desc    Get all transactions with filtering/pagination
 * @route   GET /api/transactions
 * @access  Private (Admin/Supervisor sees all; Staff sees OWN)
 */
const getTransactions = asyncHandler(async (req, res) => {
    const { platform, type, startDate, endDate, keyword } = req.query;
    const pageSize = Number(req.query.pageSize) || 20;
    const page = Number(req.query.pageNumber) || 1;

    // ── Build Search Query ────────────────────────────────────────────────
    let query = { status: { $ne: TRANSACTION_STATUS.DELETED } };

    // 1. Mandatory Staff-Specific Filter for Security
    if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPERVISOR) {
        query.staffId = req.user.id;
    } else if (req.query.staffId) {
        // Admin/Supervisor can optionally filter by a specific staff member
        query.staffId = req.query.staffId;
    }

    // 2. Platform Filter
    if (req.query.platform) {
        query.platform = req.query.platform;
    }

    // 3. Type Filter (Send/Receive)
    if (req.query.type) {
        query.type = req.query.type;
    }

    // 4. Date Range Filter
    if (req.query.startDate && req.query.endDate) {
        query.createdAt = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    // 5. Text Search (Sender/Receiver)
    if (req.query.keyword) {
        query.$or = [
            { senderName: { $regex: req.query.keyword, $options: 'i' } },
            { receiverName: { $regex: req.query.keyword, $options: 'i' } }
        ];
    }

    // ── Execute Query ──────────────────────────────────────────────────
    const count = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
        .populate('staffId', 'name email role') // Joining with user model
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });

    console.log(transactions);

    res.json({
        success: true,
        data: transactions,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

/**
 * @desc    Get filtered ledger transactions for the shared history view
 * @route   GET /api/transactions/ledger
 * @access  Private (Admin/Supervisor sees allowed; Staff sees OWN)
 */
const getLedgerTransactions = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 50;
    const page = Number(req.query.pageNumber) || 1;

    // 1. Base Query: Only ACTIVE or PENDING_CHANGE
    let query = {
        status: { $in: [TRANSACTION_STATUS.ACTIVE, TRANSACTION_STATUS.PENDING_CHANGE] }
    };

    // 2. Role-Based Access Control Filtering
    if (req.user.role === USER_ROLES.SUPERVISOR) {
        // Supervisor can see all EXCEPT admin transactions
        const { User } = await import('../models/user.model.js');
        const adminIds = await User.find({ role: USER_ROLES.ADMIN }).select('_id');
        query.staffId = { $nin: adminIds };
    } else if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPERVISOR) {
        // Users/Staff can only see their own
        query.staffId = req.user.id;
    }

    // 3. Type Filter (Send/Receive)
    if (req.query.type && req.query.type !== 'all') {
        query.type = req.query.type;
    }

    // 4. Time Range Filter (Today, Yesterday, Week, Month, Year)
    if (req.query.range && req.query.range !== 'all') {
        const range = req.query.range;
        let startDate = new Date();
        startDate.setUTCHours(0, 0, 0, 0);
        let endDate = new Date(startDate);
        endDate.setUTCHours(23, 59, 59, 999);

        if (range === 'today') {
            // Already set correctly
        } else if (range === 'yesterday') {
            startDate.setDate(startDate.getDate() - 1);
            endDate.setDate(endDate.getDate() - 1);
        } else if (range === 'week') {
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date(); // up to current time
        } else if (range === 'month') {
            startDate.setMonth(startDate.getMonth() - 1);
            endDate = new Date(); // up to current time
        } else if (range === 'year') {
            startDate.setFullYear(startDate.getFullYear() - 1);
            endDate = new Date(); // up to current time
        }

        query.createdAt = {
            $gte: startDate,
            $lte: endDate
        };
    }

    const count = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
        .populate('staffId', 'name email role')
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ createdAt: -1 });
    
    res.json({
        success: true,
        data: transactions,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private (Owner/Admin/Supervisor)
 */
const getTransactionById = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findById(req.params.id)
        .populate('staffId', 'name email role');

    if (!transaction) {
        res.status(404);
        throw new Error('Transaction not found');
    }

    // Security Check: Staff can only see their own transactions
    const isOwner = transaction.staffId._id.toString() === req.user.id.toString();
    const isPowerfulRole = req.user.role === USER_ROLES.ADMIN || req.user.role === USER_ROLES.SUPERVISOR;

    if (!isOwner && !isPowerfulRole) {
        res.status(403);
        throw new Error('Access denied: You can only view your own entries');
    }

    res.json({
        success: true,
        data: transaction
    });
});

import ExcelJS from 'exceljs';

/**
 * @desc    Export transactions to Excel
 * @route   GET /api/transactions/export
 * @access  Private (Scoped to Role)
 */
const exportTransactions = asyncHandler(async (req, res) => {
    // 1. Build Query (Same logic as getTransactions)
    let query = { status: { $ne: TRANSACTION_STATUS.DELETED } };

    if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPERVISOR) {
        query.staffId = req.user.id;
    } else if (req.query.staffId) {
        query.staffId = req.query.staffId;
    }

    if (req.query.platform) query.platform = req.query.platform;
    if (req.query.type) query.type = req.query.type;

    if (req.query.startDate && req.query.endDate) {
        query.createdAt = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    if (req.query.keyword) {
        query.$or = [
            { senderName: { $regex: req.query.keyword, $options: 'i' } },
            { receiverName: { $regex: req.query.keyword, $options: 'i' } }
        ];
    }

    // 2. Fetch Data
    const transactions = await Transaction.find(query)
        .populate('staffId', 'name email')
        .sort({ createdAt: -1 });

    // 3. Create Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions History');

    // 4. Define Columns
    worksheet.columns = [
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Time', key: 'time', width: 12 },
        { header: 'Platform', key: 'platform', width: 15 },
        { header: 'Type', key: 'type', width: 10 },
        { header: 'Sender Name', key: 'sender', width: 25 },
        { header: 'Receiver Name', key: 'receiver', width: 25 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Currency', key: 'currency', width: 10 },
        { header: 'Staff Member', key: 'staff', width: 20 },
        { header: 'Status', key: 'status', width: 12 }
    ];

    // 5. Add Rows
    transactions.forEach(tx => {
        worksheet.addRow({
            date: tx.createdAt.toLocaleDateString(),
            time: tx.createdAt.toLocaleTimeString(),
            platform: tx.platform.toUpperCase(),
            type: tx.type.toUpperCase(),
            sender: tx.senderName,
            receiver: tx.receiverName,
            amount: tx.amount,
            currency: tx.currency,
            staff: tx.staffId?.name || 'N/A',
            status: tx.status
        });
    });

    // 6. Styling
    // Header styling
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF00426D' } // Branding Blue
        };
    });

    // Alignment and number formatting
    worksheet.getColumn('amount').numFmt = '#,##0.00';
    worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
            if (rowNumber > 1) {
                cell.border = {
                    bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }
                };
            }
        });
    });

    // 7. Send Response
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=MTTMS_Transactions_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

    // Audit Logging
    AuditLog.logAction({
        userId: req.user.id,
        action: AUDIT_ACTIONS.EXPORT,
        details: { filters: req.query, recordsExported: transactions.length }
    });
});

// DailyLedgerRollup already imported at top of file

/**
 * @desc    Get dashboard statistics for transactions
 * @route   GET /api/transactions/stats
 * @access  Private (Scoped to Role)
 */
const getTransactionStats = asyncHandler(async (req, res) => {
    const { range = 'all' } = req.query;

    // Start of "Industry Best Approach":
    // For 'today' stats, we use the pre-calculated DailyLedgerRollup table
    // provided by our background worker to avoid heavy database locks on raw transactions.

    let startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date(startDate);
    endDate.setUTCHours(23, 59, 59, 999);

    if (range === 'yesterday') {
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
    } else if (range === 'week') {
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date(); // up to current time
    } else if (range === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date(); // up to current time
    } else if (range === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date(); // up to current time
    } else if (range === 'all') {
        startDate = new Date(0);
        endDate = new Date();
    }

    // Build Match Query for Rollup (Discrete range for accurate synchronization)
    const matchQuery = {
        date: { $gte: startDate, $lte: endDate }
    };

    // Role-based restrict for Rollup
    // CRITICAL: MongoDB aggregate $match does NOT auto-cast strings to ObjectId.
    // req.user.id is a string (Mongoose .id virtual). Must cast to ObjectId explicitly.
    if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPERVISOR) {
        matchQuery.staffId = new mongoose.Types.ObjectId(req.user.id);
    }

    console.log('[Stats] Querying rollup with:', JSON.stringify(matchQuery));
    const totalDocs = await DailyLedgerRollup.countDocuments({});
    console.log('[Stats] Total rollup docs in DB:', totalDocs);

    // Aggregate from the Rollup collection (Much faster!)
    const statsResult = await DailyLedgerRollup.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                totalVolume: { $sum: '$totalPayoutLkr' },
                totalCount: { $sum: '$transactionCount' },
                sendAmount: {
                    $sum: { $cond: [{ $eq: ['$type', TRANSACTION_TYPES.SEND] }, '$totalPayoutLkr', 0] }
                },
                sendCount: {
                    $sum: { $cond: [{ $eq: ['$type', TRANSACTION_TYPES.SEND] }, '$transactionCount', 0] }
                },
                receiveAmount: {
                    $sum: { $cond: [{ $eq: ['$type', TRANSACTION_TYPES.RECEIVE] }, '$totalPayoutLkr', 0] }
                },
                receiveCount: {
                    $sum: { $cond: [{ $eq: ['$type', TRANSACTION_TYPES.RECEIVE] }, '$transactionCount', 0] }
                }
            }
        }
    ]);

    // Aggregate Currency Breakdown from Rollup
    const currencyBreakdown = await DailyLedgerRollup.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: { currency: '$currency', type: '$type' },
                count: { $sum: '$transactionCount' },
                totalLkr: { $sum: '$totalPayoutLkr' },
                totalOriginal: { $sum: '$originalAmount' }
            }
        },
        {
            $group: {
                _id: '$_id.currency',
                types: {
                    $push: {
                        type: '$_id.type',
                        count: '$count',
                        totalLkr: '$totalLkr',
                        totalOriginal: '$totalOriginal'
                    }
                },
                totalCurrencyCount: { $sum: '$count' }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        success: true,
        data: {
            summary: statsResult[0] || {
                totalVolume: 0,
                totalCount: 0,
                sendCount: 0,
                sendAmount: 0,
                receiveCount: 0,
                receiveAmount: 0
            },
            breakdown: currencyBreakdown
        }
    });
});

export {
    createTransaction,
    getTransactions,
    getLedgerTransactions,
    getTransactionById,
    getTransactionStats,
    exportTransactions
};
