import asyncHandler from 'express-async-handler';
import { Activity } from '../models/activity.model.js';
import { User } from '../models/user.model.js';
const getAllActivities = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const keyword = req.query.search;
    const filterUserId = req.query.userId;

    const actionType = req.query.actionType;
    const isAdminOrSupervisor = req.user.role === 'admin' || req.user.role === 'supervisor';

    // 1. Build Base Query
    let query = {};

    // 2. Role-Based Constraint
    if (!isAdminOrSupervisor) {
        // Regular users ONLY see their own
        query.user = req.user._id;
    } else if (filterUserId) {
        // Admin/Supervisor can filter by a specific user
        query.user = filterUserId;
    }

    // 2.1 Action Type Filter (NEW)
    if (actionType && actionType !== 'ALL') {
        query.actionType = actionType;
    }

    // 3. Keyword Search
    if (keyword) {
        // If searching and user is admin/supervisor, they can search by username/email
        let searchCriteria = [
            { actionType: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } }
        ];

        if (isAdminOrSupervisor && !filterUserId) {
            const matchingUsers = await User.find({
                $or: [
                    { name: { $regex: keyword, $options: 'i' } },
                    { email: { $regex: keyword, $options: 'i' } }
                ]
            }).select('_id');
            const userIds = matchingUsers.map(u => u._id);
            if (userIds.length > 0) {
                searchCriteria.push({ user: { $in: userIds } });
            }
        }

        query = { ...query, $or: searchCriteria };
    }

    // 4. Time Range Filter (Optional, keeping it simple for common use)
    if (req.query.startDate && req.query.endDate) {
        query.timestamp = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    // 5. Execute with Paging
    const count = await Activity.countDocuments(query);
    const activities = await Activity.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email role');

    // 6. Return Paginated Results
    res.status(200).json({
        success: true,
        data: activities,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    });
});

/**
 * @desc Get the current user's activity log
 * @route GET /api/activities/me
 * @access Private
 */
const getMyActivities = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activities = await Activity.find({
        user: req.user._id,
        timestamp: { $gte: twentyFourHoursAgo }
    })
        .sort({ timestamp: -1 })
        .limit(limit);

    res.status(200).json({
        success: true,
        data: activities
    });
});

/**
 * @desc Get activities for a specific user (Admin/Supervisor Only)
 * @route GET /api/activities/user/:userId
 * @access Private/Admin-Supervisor
 */
const getUserActivities = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activities = await Activity.find({
        user: userId,
        timestamp: { $gte: twentyFourHoursAgo }
    })
        .sort({ timestamp: -1 })
        .limit(50)
        .populate('user', 'name email role');

    res.status(200).json({
        success: true,
        data: activities
    });
});

const getRateSyncHistory = asyncHandler(async (req, res) => {
    const activities = await Activity.find({ actionType: 'RATE_UPDATE' })
        .sort({ timestamp: -1 })
        .limit(1)
        .populate('user', 'name email role');

    res.status(200).json({
        success: true,
        data: activities
    });
});

export { getAllActivities, getMyActivities, getUserActivities, getRateSyncHistory };
