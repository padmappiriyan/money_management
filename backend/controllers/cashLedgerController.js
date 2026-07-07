import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import { CashLedger, CASH_LEDGER_STATUS } from '../models/cashLedger.model.js';
import { Transaction } from '../models/transaction.model.js';
import UserPlatformBalance from '../models/userPlatformBalance.model.js';
import { AuditLog, AUDIT_ACTIONS } from '../models/auditLog.model.js';
import Notification from '../models/notification.model.js';
import { getIO } from '../socket.js';

/**
 * @desc    Set opening balance for the day
 * @route   POST /api/ledger/opening
 * @access  Private (Staff/Admin)
 */
const openLedger = asyncHandler(async (req, res) => {
    const { openingBalance, currency = 'LKR' } = req.body;

    if (openingBalance === undefined || openingBalance < 0) {
        res.status(400);
        throw new Error('Please provide a valid opening balance');
    }

    // Normalize date to UTC midnight
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Check if ledger already exists for this staff/day/currency
    let ledger = await CashLedger.findOne({
        date: today,
        staffId: req.user.id,
        currency
    });

    if (ledger) {
        res.status(400);
        throw new Error('Ledger already opened for today with this currency');
    }

    ledger = await CashLedger.create({
        date: today,
        staffId: req.user.id,
        currency,
        openingBalance,
        expectedClosing: openingBalance, // Initial expected is just the opening
        status: CASH_LEDGER_STATUS.OPEN
    });

    // --- Shift Rollover for Platform Virtual Accounts ---
    // Snapshot the current total balance as 'Brought Forward' for the new shift
    // and reset the daily activity buckets.
    const platformBalances = await UserPlatformBalance.find({ userId: req.user.id });

    for (const pb of platformBalances) {
        pb.openingBalanceLkr = pb.balanceLkr;
        pb.todaySendLkr = 0;
        pb.todayPaidLkr = 0;
        pb.todayDepositLkr = 0;
        pb.lastUpdated = new Date();
        await pb.save();
    }
    // -----------------------------------------------------

    // Audit Log
    AuditLog.logAction({
        userId: req.user.id,
        action: AUDIT_ACTIONS.CREATE, // Use a generic CREATE for now or define a new one
        details: { type: 'cash_ledger_open', openingBalance, currency }
    });

    res.status(201).json({
        success: true,
        data: ledger,
        message: 'Day opened successfully'
    });
});

/**
 * @desc    Get current ledger status
 * @route   GET /api/ledger/status
 * @access  Private (Staff/Admin)
 */
const getLedgerStatus = asyncHandler(async (req, res) => {
    const { currency = 'LKR' } = req.query;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let ledger = await CashLedger.findOne({
        date: today,
        staffId: req.user.id,
        currency
    });

    // --- DYNAMIC CALCULATION OF TOTAL AMOUNT (Σ Send - Paid) ---
    // This ensures that even if transactions were made before the worker update,
    // the Total Amount is always accurate.
    const startOfToday = new Date(today);
    const endOfToday = new Date(today);
    endOfToday.setUTCHours(23, 59, 59, 999);

    const transactionAggregation = await Transaction.aggregate([
        {
            $match: {
                staffId: new mongoose.Types.ObjectId(req.user.id),
                createdAt: { $gte: startOfToday, $lte: endOfToday },
                status: 'active'
            }
        },
        {
            $group: {
                _id: null,
                totalNet: {
                    $sum: {
                        $cond: [
                            { $eq: ['$type', 'send'] },
                            '$totalPayout', // Send is inflow (+)
                            { $multiply: ['$totalPayout', -1] } // Paid is outflow (-)
                        ]
                    }
                }
            }
        }
    ]);

    const liveTotalNet = transactionAggregation.length > 0 ? transactionAggregation[0].totalNet : 0;

    if (!ledger) {
        // Rollover Logic: Find the most recent closed ledger for this staff member
        const lastLedger = await CashLedger.findOne({
            staffId: req.user.id,
            status: CASH_LEDGER_STATUS.CLOSED
        }).sort({ date: -1, closedAt: -1 });

        return res.json({
            success: true,
            data: {
                totalTransactionNet: liveTotalNet,
                actualClosing: 0,
                cbAmount: 0,
                depositAmount: 0,
                creditAmount: 0
            },
            suggestedOpening: lastLedger ? lastLedger.actualClosing : 0,
            message: 'No ledger found for today, providing live transaction totals'
        });
    }

    // Sync the ledger if needed (optional, but good for consistency)
    if (ledger.totalTransactionNet !== liveTotalNet) {
        ledger.totalTransactionNet = liveTotalNet;
        await ledger.save();
    }

    res.json({
        success: true,
        data: ledger
    });
});

/**
 * @desc    Close ledger with billetage
 * @route   POST /api/ledger/close
 * @access  Private (Staff/Admin)
 */
const closeLedger = asyncHandler(async (req, res) => {
    const { billetage, actualClosing, discrepancyNote, currency = 'LKR' } = req.body;

    if (!billetage || actualClosing === undefined) {
        res.status(400);
        throw new Error('Physical count (billetage) and actual closing amount are required');
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const ledger = await CashLedger.findOne({
        date: today,
        staffId: req.user.id,
        currency
    });

    if (!ledger) {
        res.status(404);
        throw new Error('No active ledger found to close');
    }

    if (ledger.status === CASH_LEDGER_STATUS.CLOSED) {
        res.status(400);
        throw new Error('Ledger is already closed for today');
    }

    // Update with closing data
    ledger.billetage = billetage;
    ledger.actualClosing = actualClosing;
    ledger.discrepancyNote = discrepancyNote;
    ledger.status = CASH_LEDGER_STATUS.CLOSED;
    ledger.closedAt = new Date();

    await ledger.save();

    // Audit Log
    AuditLog.logAction({
        userId: req.user.id,
        action: AUDIT_ACTIONS.UPDATE,
        details: {
            type: 'cash_ledger_close',
            expected: ledger.expectedClosing,
            actual: actualClosing,
            difference: ledger.difference
        }
    });



    res.json({
        success: true,
        data: ledger,
        message: 'Day closed successfully'
    });
});

/**
 * @desc    Lock ledger for reconciliation (Prevents new transactions)
 * @route   POST /api/ledger/lock
 * @access  Private (Staff/Admin)
 */
const lockLedger = asyncHandler(async (req, res) => {
    const { currency = 'LKR' } = req.body;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const ledger = await CashLedger.findOne({
        date: today,
        staffId: req.user.id,
        currency
    });

    if (!ledger) {
        res.status(404);
        throw new Error('No active ledger found to lock');
    }

    if (ledger.status === CASH_LEDGER_STATUS.CLOSED) {
        res.status(400);
        throw new Error('Ledger is already closed');
    }

    ledger.status = CASH_LEDGER_STATUS.LOCKED;
    await ledger.save();

    // Audit Log
    AuditLog.logAction({
        userId: req.user.id,
        action: AUDIT_ACTIONS.UPDATE,
        details: { type: 'cash_ledger_lock', date: today }
    });

    res.json({
        success: true,
        data: ledger,
        message: 'Shift locked for reconciliation'
    });
});

/**
 * @desc    Save/Update daily reconciliation data
 * @route   POST /api/ledger/reconcile
 * @access  Private
 */
const updateReconciliation = asyncHandler(async (req, res) => {
    const { actualClosing, cbAmount, depositAmount, creditAmount, currency = 'LKR' } = req.body;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let ledger = await CashLedger.findOne({
        date: today,
        staffId: req.user.id,
        currency
    });

    if (!ledger) {
        // If no ledger exists, create one (opening balance 0)
        ledger = await CashLedger.create({
            date: today,
            staffId: req.user.id,
            currency,
            openingBalance: 0,
            expectedClosing: 0,
            totalTransactionNet: 0,
            status: CASH_LEDGER_STATUS.OPEN
        });
    }

    ledger.actualClosing = actualClosing || 0;
    ledger.cbAmount = cbAmount || 0;
    ledger.depositAmount = depositAmount || 0;
    ledger.creditAmount = creditAmount || 0;

    await ledger.save();

    // --- Discrepancy Notification Logic ---
    const calculatedBalance = (ledger.actualClosing || 0) + (ledger.depositAmount || 0) - (ledger.creditAmount || 0);
    const difference = calculatedBalance - (ledger.totalTransactionNet || 0);
    
    if (Math.abs(difference) > 0.01) {
        try {
            const statusType = difference > 0 ? 'Surplus' : 'Shortage';
            const notification = await Notification.create({
                type: 'DISCREPANCY',
                title: 'Reconciliation Discrepancy Detected',
                message: `Attention: A ${statusType.toLowerCase()} of ${ledger.currency} ${Math.abs(difference).toFixed(2)} was detected in the daily drawer reconciliation submitted by ${req.user.name || req.user.email}.`,
                targetRole: 'admin',
                metadata: {
                    ledgerId: ledger._id,
                    staffId: req.user.id,
                    difference: difference,
                    currency: ledger.currency,
                    actualClosing: ledger.actualClosing,
                    totalTransactionNet: ledger.totalTransactionNet
                }
            });

            const io = getIO();
            io.to('admin_room').emit('NEW_NOTIFICATION', notification);
        } catch (error) {
            console.error('Failed to send discrepancy notification in updateReconciliation:', error);
        }
    }

    res.json({
        success: true,
        data: ledger,
        message: 'Reconciliation updated successfully'
    });
});

/**
 * @desc    Get reconciliation history
 * @route   GET /api/ledger/reconciliation-history
 * @access  Private
 */
const getReconciliationHistory = asyncHandler(async (req, res) => {
    const { currency = 'LKR', userId } = req.query;
    
    let targetUserId = req.user.id;
    if (userId && (req.user.role === 'admin' || req.user.role === 'supervisor')) {
        targetUserId = userId;
    }

    const history = await CashLedger.find({
        staffId: targetUserId,
        currency
    })
        .sort({ date: -1 })
        .limit(30);

    res.json({
        success: true,
        data: history
    });
});

export {
    openLedger,
    getLedgerStatus,
    lockLedger,
    closeLedger,
    updateReconciliation,
    getReconciliationHistory
};
