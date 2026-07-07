import asyncHandler from 'express-async-handler';
import UserPlatformBalance from '../models/userPlatformBalance.model.js';
import { Platform } from '../models/platform.model.js';
import { Activity, ACTIVITY_TYPES } from '../models/activity.model.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Get all platform balances for the logged-in staff
 * @route   GET /api/user-balances/mine
 * @access  Private
 */
const getMyPlatformBalances = asyncHandler(async (req, res) => {
    // 1. Get all active platforms
    const activePlatforms = await Platform.find({ status: 'active' });

    // 2. Get the balances for this specific user
    const balances = await UserPlatformBalance.find({ userId: req.user._id });

    // 3. Merge them so the frontend gets a clean list of all platforms with the user's balance
    const mappedBalances = activePlatforms.map(platform => {
        const balanceDoc = balances.find(b => b.platformId.toString() === platform._id.toString());
        return {
            platformId: platform._id,
            name: platform.name,
            slug: platform.slug,
            logoUrl: platform.logoUrl,
            currentBalanceLkr: balanceDoc ? balanceDoc.balanceLkr : 0,
            openingBalanceLkr: balanceDoc ? balanceDoc.openingBalanceLkr : 0,
            todaySendLkr: balanceDoc ? balanceDoc.todaySendLkr : 0,
            todayPaidLkr: balanceDoc ? balanceDoc.todayPaidLkr : 0,
            todayDepositLkr: balanceDoc ? balanceDoc.todayDepositLkr : 0,
            lastUpdated: balanceDoc ? balanceDoc.lastUpdated : null
        };
    });

    res.status(200).json({
        success: true,
        count: mappedBalances.length,
        balances: mappedBalances
    });
});

/**
 * @desc    Adjust a specific staff member's platform balance (Admin Only)
 * @route   POST /api/user-balances/:staffId/:platformId/adjust
 * @access  Private/Admin
 */
const adjustStaffPlatformBalance = asyncHandler(async (req, res) => {
    const { amount, type = 'topup' } = req.body;
    const { staffId, platformId } = req.params;

    if (amount === undefined) {
        res.status(400);
        throw new Error('Adjustment amount is required');
    }

    const balanceDoc = await UserPlatformBalance.findOneAndUpdate(
        { userId: staffId, platformId },
        { 
            $inc: { 
                balanceLkr: Number(amount),
                todayDepositLkr: Number(amount)
            },
            $set: { lastUpdated: new Date() }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Activity.logAction({
        user: req.user._id,
        actionType: ACTIVITY_TYPES.PLATFORM_ADJUST,
        description: `Admin assigned ${amount} LKR to Staff ${staffId} for Platform ${platformId}`,
        details: { staffId, platformId, amount, type },
        category: 'system'
    });

    res.status(200).json({
        success: true,
        data: balanceDoc
    });
});

/**
 * @desc    Get aggregate balances across all users (Admin Only)
 * @route   GET /api/user-balances/global
 * @access  Private/Admin
 */
const getGlobalPlatformBalances = asyncHandler(async (req, res) => {
    const totals = await UserPlatformBalance.aggregate([
        {
            $group: {
                _id: null,
                totalOpeningBalance: { $sum: '$openingBalanceLkr' },
                totalSend: { $sum: '$todaySendLkr' },
                totalPaid: { $sum: '$todayPaidLkr' },
                totalDeposit: { $sum: '$todayDepositLkr' },
                totalCurrentBalance: { $sum: '$balanceLkr' }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        data: totals[0] || {
            totalOpeningBalance: 0,
            totalSend: 0,
            totalPaid: 0,
            totalDeposit: 0,
            totalCurrentBalance: 0
        }
    });
});

export {
    getMyPlatformBalances,
    adjustStaffPlatformBalance,
    getGlobalPlatformBalances,
    getAllUsersPerformance
};

/**
 * @desc    Get performance breakdown for all users (Admin Only)
 * @route   GET /api/user-balances/all-users
 * @access  Private/Admin
 */
const getAllUsersPerformance = asyncHandler(async (req, res) => {
    // 1. Pagination from Query
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const skip = (page - 1) * size;

    // 2. Filters from Body (Standardized Payload)
    const { 
        name,
        email,
        role,
        status,
        PlatformId,
        platformId,
        'Updated From': updatedFromLong,
        'Updated To': updatedToLong,
        updatedFrom: updatedFromShort,
        updatedTo: updatedToShort
    } = req.body;

    const finalPlatformId = PlatformId || platformId;
    const finalUpdatedFrom = updatedFromLong || updatedFromShort;
    const finalUpdatedTo = updatedToLong || updatedToShort;

    // 3. Build Match Query for Users
    let userMatch = {};
    
    // Combine name and email into an OR search if either exists
    if (name || email) {
        userMatch.$or = [];
        if (name) userMatch.$or.push({ name: { $regex: name, $options: 'i' } });
        if (email) userMatch.$or.push({ email: { $regex: email, $options: 'i' } });
    }

    if (status && status !== 'all') {
        userMatch.status = status;
    }
    if (role && role !== 'all') {
        userMatch.role = role;
    }

    const hasPlatformFilter = finalPlatformId && finalPlatformId !== 'all';
    const hasDateFilter = !!(finalUpdatedFrom || finalUpdatedTo);

    // 4. Build Match Query for Balances (Platform/Date)
    let balanceMatch = {};
    if (hasPlatformFilter) {
        balanceMatch.platformId = new mongoose.Types.ObjectId(finalPlatformId);
    }
    if (hasDateFilter) {
        balanceMatch.lastUpdated = {};
        if (finalUpdatedFrom) balanceMatch.lastUpdated.$gte = new Date(finalUpdatedFrom);
        if (finalUpdatedTo) balanceMatch.lastUpdated.$lte = new Date(finalUpdatedTo);
    }

    // 5. Aggregate for Total Count
    const totalCountResult = await User.aggregate([
        { $match: userMatch },
        { $count: 'total' }
    ]);
    const totalRecords = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

    console.log('[DEBUG] all-users payload:', req.body);
    console.log('[DEBUG] all-users query:', req.query);



    // 6. Aggregate for Paginated Data
    const usersData = await User.aggregate([
        { $match: userMatch },
        {
            $lookup: {
                from: 'user_platform_balances',
                let: { userId: '$_id' },
                pipeline: [
                    { 
                        $match: { 
                            $expr: { $eq: ['$userId', '$$userId'] },
                            ...(Object.keys(balanceMatch).length > 0 ? balanceMatch : {})
                        } 
                    }
                ],
                as: 'balances'
            }
        },
        // If a platform or date filter is applied, only show users who have matching balance records
        {
            $match: (hasPlatformFilter || hasDateFilter) 
                ? { balances: { $ne: [] } } 
                : {} 
        },
        { $sort: { name: 1 } },
        { $skip: skip },
        { $limit: size },
        {
            $project: {
                _id: 1,
                name: 1,
                email: 1,
                role: 1,
                status: 1,
                avatar: 1,
                broughtFwd: { $sum: '$balances.openingBalanceLkr' },
                totalSend: { $sum: '$balances.todaySendLkr' },
                totalPaid: { $sum: '$balances.todayPaidLkr' },
                totalDeposit: { $sum: '$balances.todayDepositLkr' },
                netBalance: { $sum: '$balances.balanceLkr' },
                lastUpdated: { $max: '$balances.lastUpdated' }
            }
        }
    ]);

    res.status(200).json({
        success: true,
        count: usersData.length,
        pagination: {
            totalRecords,
            totalPages: Math.ceil(totalRecords / size),
            currentPage: page,
            size
        },
        data: usersData
    });
});
