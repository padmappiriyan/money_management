import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { Transaction } from '../models/transaction.model.js';
import UserPlatformBalance from '../models/userPlatformBalance.model.js';
import { Platform } from '../models/platform.model.js';

/**
 * @desc    Get chronological history for all platforms
 * @route   GET /api/reports/platform-history
 * @access  Private
 */
export const getPlatformHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    const matchStage = {
        staffId: userId,
        status: 'active'
    };

    if (startDate) {
        matchStage.createdAt = { $gte: new Date(startDate + "T00:00:00.000Z") };
    }
    // 1. Get all active platforms first to ensure we have context
    const platforms = await Platform.find({ status: 'active' });
    const platformMap = {};
    platforms.forEach(p => {
        platformMap[p.slug] = p.name;
    });

    // 2. Aggregate Transactions by Day and Platform
    const historyData = await Transaction.aggregate([
        {
            $match: matchStage
        },
        {
            $group: {
                _id: {
                    platform: '$platform',
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                },
                send: {
                    $sum: { $cond: [{ $eq: ['$type', 'send'] }, '$totalPayout', 0] }
                },
                paid: {
                    $sum: { $cond: [{ $eq: ['$type', 'receive'] }, '$totalPayout', 0] }
                },
                deposit: {
                    $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$totalPayout', 0] }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.day": -1 } }
    ]);

    // 3. To provide the B/F and Balance, we need a sequential calculation.
    // We'll organize by platform first.
    const platformHistories = {};
    
    // Initialize for each platform
    platforms.forEach(p => {
        platformHistories[p.slug] = {
            name: p.name,
            slug: p.slug,
            history: []
        };
    });

    // Group the aggregated data per platform and interpolate missing days
    const todayStr = new Date().toISOString().split('T')[0];

    platforms.forEach(p => {
        const platformRawData = historyData.filter(item => item._id.platform === p.slug);
        
        if (platformRawData.length > 0) {
            // Because historyData is sorted descending by date
            const earliestDateStr = platformRawData[platformRawData.length - 1]._id.day; 
            
        // Ensure we calculate back to startDate if provided
        let targetEarliestDateStr = earliestDateStr;
        if (startDate && new Date(startDate) < new Date(earliestDateStr)) {
            targetEarliestDateStr = startDate;
        }
        
        let currentDate = new Date(todayStr + "T00:00:00Z");
        const earliestDate = new Date(targetEarliestDateStr + "T00:00:00Z");
            
            const rawMap = {};
            platformRawData.forEach(item => {
                rawMap[item._id.day] = item;
            });
            
            const fullHistory = [];
            while (currentDate >= earliestDate) {
                const dateStr = currentDate.toISOString().split('T')[0];
                
                if (rawMap[dateStr]) {
                    const item = rawMap[dateStr];
                    fullHistory.push({
                        date: item._id.day,
                        send: item.send,
                        paid: item.paid,
                        deposit: item.deposit || 0,
                        balance: 0
                    });
                } else {
                    fullHistory.push({
                        date: dateStr,
                        send: 0,
                        paid: 0,
                        deposit: 0,
                        balance: 0
                    });
                }
                currentDate.setUTCDate(currentDate.getUTCDate() - 1);
            }
            platformHistories[p.slug].history = fullHistory;
        } else {
            // No data for this platform, but we might still need to display empty days up to startDate
            let targetEarliestDateStr = todayStr;
            if (startDate) {
                targetEarliestDateStr = startDate;
            }

            let currentDate = new Date(todayStr + "T00:00:00Z");
            const earliestDate = new Date(targetEarliestDateStr + "T00:00:00Z");
            const fullHistory = [];

            while (currentDate >= earliestDate) {
                fullHistory.push({
                    date: currentDate.toISOString().split('T')[0],
                    send: 0,
                    paid: 0,
                    deposit: 0,
                    balance: 0
                });
                currentDate.setUTCDate(currentDate.getUTCDate() - 1);
            }
            platformHistories[p.slug].history = fullHistory;
        }
    });

    // 4. Incorporate manual adjustments (from Activity logs or a dedicated Adjustment model)
    // For now, we use a simplified version. In a real system, we'd have a separate collection for adjustments.
    
    // 5. Calculate Running Balances
    // fetch current balances as the baseline
    const currentBalances = await UserPlatformBalance.find({ userId });
    
    currentBalances.forEach(cb => {
        const platform = platforms.find(p => p._id.toString() === cb.platformId.toString());
        if (platform && platformHistories[platform.slug]) {
            let runningBalance = cb.balanceLkr;
            
            // Sort history ascending to calculate forward OR descending to calculate backward.
            // Since we have the CURRENT balance, we calculate BACKWARDS.
            const sortedHistory = platformHistories[platform.slug].history.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );

            sortedHistory.forEach((day, idx) => {
                // Today's Closing Balance = runningBalance
                day.balance = runningBalance;
                
                // Yesterday's Balance (B/F for today) = Today's Closing - Deposit + Spend + Paid
                // Math: Balance_End = Balance_Start + Spend - Paid - Deposit
                // => Balance_Start = Balance_End - Spend + Paid + Deposit
                day.bf = runningBalance - day.send + day.paid + day.deposit;
                
                // Update runningBalance for the "previous" day
                runningBalance = day.bf;
            });

            // Filter by date range before returning to client to save bandwidth
            if (startDate || endDate) {
                platformHistories[platform.slug].history = sortedHistory.filter(day => {
                    let keep = true;
                    if (startDate && day.date < startDate) keep = false;
                    if (endDate && day.date > endDate) keep = false;
                    return keep;
                });
            }
        }
    });

    res.status(200).json({
        success: true,
        data: Object.values(platformHistories)
    });
});

/**
 * @desc    Get chronological history for all platforms across all users (Admin)
 * @route   GET /api/reports/global-platform-history
 * @access  Private/Admin
 */
export const getGlobalPlatformHistory = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    
    // 1. Match Stage (Global - no userId restriction)
    const matchStage = {
        status: 'active'
    };

    if (startDate) {
        matchStage.createdAt = { $gte: new Date(startDate + "T00:00:00.000Z") };
    }

    // 2. Get all active platforms
    const platforms = await Platform.find({ status: 'active' });
    const platformMap = {};
    platforms.forEach(p => {
        platformMap[p.slug] = p.name;
    });

    // 3. Aggregate Transactions by Day and Platform (All Users)
    const historyData = await Transaction.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: {
                    platform: '$platform',
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                },
                send: {
                    $sum: { $cond: [{ $eq: ['$type', 'send'] }, '$totalPayout', 0] }
                },
                paid: {
                    $sum: { $cond: [{ $eq: ['$type', 'receive'] }, '$totalPayout', 0] }
                },
                deposit: {
                    $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$totalPayout', 0] }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.day": -1 } }
    ]);

    // 4. Initialize Platform Histories
    const platformHistories = {};
    
    // Add "Global Master" slug
    platformHistories['global-master'] = {
        name: 'Global Master',
        slug: 'global-master',
        history: []
    };

    platforms.forEach(p => {
        platformHistories[p.slug] = {
            name: p.name,
            slug: p.slug,
            history: []
        };
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // 5. Build full date range and calculate totals
    platforms.forEach(p => {
        const platformRawData = historyData.filter(item => item._id.platform === p.slug);
        const targetEarliestDateStr = (startDate && platformRawData.length > 0 && new Date(startDate) < new Date(platformRawData[platformRawData.length-1]._id.day)) 
            ? startDate 
            : (platformRawData.length > 0 ? platformRawData[platformRawData.length - 1]._id.day : todayStr);

        let currentDate = new Date(todayStr + "T00:00:00Z");
        const earliestDate = new Date(targetEarliestDateStr + "T00:00:00Z");
        
        const rawMap = {};
        platformRawData.forEach(item => { rawMap[item._id.day] = item; });
        
        const fullHistory = [];
        while (currentDate >= earliestDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const item = rawMap[dateStr] || { send: 0, paid: 0, deposit: 0 };
            
            fullHistory.push({
                date: dateStr,
                send: item.send,
                paid: item.paid,
                deposit: item.deposit || 0,
                balance: 0,
                bf: 0
            });
            currentDate.setUTCDate(currentDate.getUTCDate() - 1);
        }
        platformHistories[p.slug].history = fullHistory;
    });

    // 6. Calculate Running Balances across all platforms
    const allGlobalBalances = await UserPlatformBalance.find();
    
    // Aggregate balances per platform
    const platformCurrentTotals = {};
    allGlobalBalances.forEach(cb => {
        const pid = cb.platformId.toString();
        platformCurrentTotals[pid] = (platformCurrentTotals[pid] || 0) + cb.balanceLkr;
    });

    // Process each platform's history backwards from the summed current balance
    platforms.forEach(p => {
        const pid = p._id.toString();
        if (platformHistories[p.slug]) {
            let runningBalance = platformCurrentTotals[pid] || 0;
            const sortedHistory = platformHistories[p.slug].history.sort((a, b) => new Date(b.date) - new Date(a.date));

            sortedHistory.forEach(day => {
                day.balance = runningBalance;
                day.bf = runningBalance - day.send + day.paid + day.deposit;
                runningBalance = day.bf;
            });
        }
    });

    // 7. Generate Global Master History (Sum of all individual platform histories)
    const globalHistoryMap = {};
    Object.values(platformHistories).forEach(ph => {
        if (ph.slug === 'global-master') return;
        ph.history.forEach(day => {
            if (!globalHistoryMap[day.date]) {
                globalHistoryMap[day.date] = { date: day.date, send: 0, paid: 0, deposit: 0, balance: 0, bf: 0 };
            }
            globalHistoryMap[day.date].send += day.send;
            globalHistoryMap[day.date].paid += day.paid;
            globalHistoryMap[day.date].deposit += day.deposit;
            globalHistoryMap[day.date].balance += day.balance;
            globalHistoryMap[day.date].bf += day.bf;
        });
    });

    platformHistories['global-master'].history = Object.values(globalHistoryMap).sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
        success: true,
        data: Object.values(platformHistories)
    });
});

/**
 * @desc    Get chronological history for a specific user across all platforms (Admin Only)
 * @route   GET /api/reports/user-performance/:userId
 * @access  Private/Admin
 */
export const getUserPerformanceHistory = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400);
        throw new Error('Invalid User ID');
    }

    const matchStage = {
        staffId: new mongoose.Types.ObjectId(userId),
        status: 'active'
    };

    if (startDate) {
        matchStage.createdAt = { $gte: new Date(startDate + "T00:00:00.000Z") };
    }
    if (endDate) {
        matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate + "T23:59:59.999Z") };
    }

    // 1. Get all active platforms first to ensure we have context
    const platforms = await Platform.find({ status: 'active' });
    const platformMap = {};
    platforms.forEach(p => {
        platformMap[p.slug] = p.name;
    });

    // 2. Aggregate Transactions by Day and Platform
    const historyData = await Transaction.aggregate([
        {
            $match: matchStage
        },
        {
            $group: {
                _id: {
                    platform: '$platform',
                    day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                },
                send: {
                    $sum: { $cond: [{ $eq: ['$type', 'send'] }, '$totalPayout', 0] }
                },
                paid: {
                    $sum: { $cond: [{ $eq: ['$type', 'receive'] }, '$totalPayout', 0] }
                },
                deposit: {
                    $sum: { $cond: [{ $eq: ['$type', 'deposit'] }, '$totalPayout', 0] }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.day": -1 } }
    ]);

    // 3. Organize by platform
    const platformHistories = {};
    
    platforms.forEach(p => {
        platformHistories[p.slug] = {
            name: p.name,
            slug: p.slug,
            history: []
        };
    });

    const todayStr = new Date().toISOString().split('T')[0];

    platforms.forEach(p => {
        const platformRawData = historyData.filter(item => item._id.platform === p.slug);
        const targetEarliestDateStr = (startDate && platformRawData.length > 0 && new Date(startDate) < new Date(platformRawData[platformRawData.length-1]._id.day)) 
            ? startDate 
            : (platformRawData.length > 0 ? platformRawData[platformRawData.length - 1]._id.day : todayStr);

        let currentDate = new Date(todayStr + "T00:00:00Z");
        const earliestDate = new Date(targetEarliestDateStr + "T00:00:00Z");
        
        const rawMap = {};
        platformRawData.forEach(item => {
            rawMap[item._id.day] = item;
        });
        
        const fullHistory = [];
        while (currentDate >= earliestDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            
            if (rawMap[dateStr]) {
                const item = rawMap[dateStr];
                fullHistory.push({
                    date: item._id.day,
                    send: item.send,
                    paid: item.paid,
                    deposit: item.deposit || 0,
                    balance: 0,
                    bf: 0
                });
            } else {
                fullHistory.push({
                    date: dateStr,
                    send: 0,
                    paid: 0,
                    deposit: 0,
                    balance: 0,
                    bf: 0
                });
            }
            currentDate.setUTCDate(currentDate.getUTCDate() - 1);
        }
        platformHistories[p.slug].history = fullHistory;
    });

    // 4. Calculate Running Balances backwards from current state
    const userBalances = await UserPlatformBalance.find({ userId: new mongoose.Types.ObjectId(userId) });
    
    platforms.forEach(p => {
        const balanceDoc = userBalances.find(b => b.platformId.toString() === p._id.toString());
        if (platformHistories[p.slug]) {
            let runningBalance = balanceDoc ? balanceDoc.balanceLkr : 0;
            
            const sortedHistory = platformHistories[p.slug].history.sort((a, b) => 
                new Date(b.date) - new Date(a.date)
            );

            sortedHistory.forEach((day) => {
                day.balance = runningBalance;
                day.bf = runningBalance - day.send + day.paid + day.deposit;
                runningBalance = day.bf;
            });
        }
    });

    res.status(200).json({
        success: true,
        data: Object.values(platformHistories)
    });
});
