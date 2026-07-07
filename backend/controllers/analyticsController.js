import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import DailyLedgerRollup from '../models/dailyLedgerRollup.model.js';
import { USER_ROLES } from '../models/user.model.js';

/**
 * @desc    Get Pre-Calculated Dashboard statistics
 * @route   GET /api/analytics/daily
 * @access  Private (Scoped to Role)
 */
export const getTransactionStats = asyncHandler(async (req, res) => {
    const { range, type } = req.query; // type: 'all', 'send', 'receive'

    // 1. Calculate Date Filter (Midnight boundaries)
    let startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);

    let endDate = new Date(startDate);
    endDate.setUTCHours(23, 59, 59, 999);

    if (range === 'yesterday') {
        startDate.setDate(startDate.getDate() - 1);
        endDate.setDate(endDate.getDate() - 1);
    } else if (range === 'week') {
        startDate.setDate(startDate.getDate() - 7);
        endDate = new Date();
    } else if (range === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date();
    } else if (range === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
        endDate = new Date();
    } else if (range === 'all') {
        startDate = new Date(0);
        endDate = new Date();
    }

    // 2. Build Query (Closed range for accurate sync)
    let matchQuery = { date: { $gte: startDate, $lte: endDate } };

    if (type && type !== 'all') {
        matchQuery.type = type;
    }

    // Role-based restrict exactly as requested
    // Admin sees everything.
    // Supervisor sees everything EXCEPT admin-created.
    // User sees only THEIR own.
    // CRITICAL: MongoDB aggregate $match does NOT auto-cast strings to ObjectId.
    // req.user.id is a string (Mongoose .id virtual). Must cast explicitly.
    if (req.user.role === USER_ROLES.SUPERVISOR) {
        matchQuery.creatorRole = { $ne: USER_ROLES.ADMIN };
    } else if (req.user.role !== USER_ROLES.ADMIN && req.user.role !== USER_ROLES.SUPERVISOR) {
        matchQuery.staffId = new mongoose.Types.ObjectId(req.user.id);
    }

    // 3. Fast Aggregation on Pre-Computed Rollups
    const aggregatedStats = await DailyLedgerRollup.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                totalVolume: { $sum: '$totalPayoutLkr' },
                totalCount: { $sum: '$transactionCount' },
                sendCount: {
                    $sum: { $cond: [{ $eq: ['$type', 'send'] }, '$transactionCount', 0] }
                },
                sendAmount: {
                    $sum: { $cond: [{ $eq: ['$type', 'send'] }, '$totalPayoutLkr', 0] }
                },
                receiveCount: {
                    $sum: { $cond: [{ $eq: ['$type', 'receive'] }, '$transactionCount', 0] }
                },
                receiveAmount: {
                    $sum: { $cond: [{ $eq: ['$type', 'receive'] }, '$totalPayoutLkr', 0] }
                }
            }
        }
    ]);

    // 4. Currency-wise Breakdown
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

    // 5. Chart Data (Time Series)
    const rawChartData = await DailyLedgerRollup.aggregate([
        { $match: matchQuery },
        { 
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                sendAmount: { $sum: { $cond: [{ $eq: ['$type', 'send'] }, '$totalPayoutLkr', 0] } },
                depositAmount: { $sum: { $cond: [{ $eq: ['$type', 'receive'] }, '$totalPayoutLkr', 0] } }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                date: '$_id',
                send: '$sendAmount',
                deposit: '$depositAmount'
            }
        }
    ]);

    let finalChartData = [];
    if (range !== 'all') {
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const existing = rawChartData.find(d => d.date === dateStr);
            if (existing) {
                finalChartData.push(existing);
            } else {
                finalChartData.push({ date: dateStr, send: 0, deposit: 0 });
            }
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
    } else {
        finalChartData = rawChartData;
    }

    res.json({
        success: true,
        data: {
            summary: aggregatedStats[0] || {
                totalVolume: 0,
                totalCount: 0,
                sendCount: 0,
                sendAmount: 0,
                receiveCount: 0,
                receiveAmount: 0
            },
            breakdown: currencyBreakdown,
            chartData: finalChartData
        }
    });
});
