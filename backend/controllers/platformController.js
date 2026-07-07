import asyncHandler from 'express-async-handler';
import { Platform, PLATFORM_STATUS } from '../models/platform.model.js';
import { Activity, ACTIVITY_TYPES } from '../models/activity.model.js';
import fs from 'fs';
import path from 'path';

/**
 * @desc    Get all active platforms for staff selection
 * @route   GET /api/platforms
 * @access  Private-Protected
 */
const getPlatforms = asyncHandler(async (req, res) => {
    const platforms = await Platform.find({ status: PLATFORM_STATUS.ACTIVE }).sort({ name: 1 });
    res.status(200).json({
        success: true,
        count: platforms.length,
        platforms
    });
});

/**
 * @desc    Get all platforms (including inactive) for Admin Portal
 * @route   GET /api/platforms/admin
 * @access  Private/Admin
 */
const getAdminPlatforms = asyncHandler(async (req, res) => {
    const platforms = await Platform.find({}).sort({ name: 1 });
    res.status(200).json({
        success: true,
        count: platforms.length,
        platforms
    });
});

/**
 * @desc    Create a new platform classification
 * @route   POST /api/platforms
 * @access  Private/Admin
 */
const createPlatform = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Mission Crucial: Platform name is required');
    }

    const platformExists = await Platform.findOne({ name: name.toUpperCase() });
    if (platformExists) {
        res.status(400);
        throw new Error('Collision Detected: Platform already exists in records');
    }

    // Logo provided by multer if any
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const platform = await Platform.create({
        name,
        logoUrl,
        createdBy: req.user._id
    });

    if (platform) {
        await Activity.logAction({
            user: req.user._id,
            actionType: ACTIVITY_TYPES.PLATFORM_CREATE,
            description: `Admin ${req.user.email} initiated new source classification: ${platform.name}`,
            details: { platformId: platform._id, name: platform.name },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            category: 'system'
        });

        res.status(201).json({
            success: true,
            platform
        });
    } else {
        res.status(400);
        throw new Error('Validation Exception: Invalid platform data received');
    }
});

/**
 * @desc    Update a platform brand or status
 * @route   PUT /api/platforms/:id
 * @access  Private/Admin
 */
const updatePlatform = asyncHandler(async (req, res) => {
    const platform = await Platform.findById(req.params.id);

    if (!platform) {
        res.status(404);
        throw new Error('Record Not Found: Platform does not exist');
    }

    const { name, status } = req.body;

    if (name) platform.name = name;
    if (status) platform.status = status;

    if (req.file) {
        // Purge old asset if replacement is uploaded
        if (platform.logoUrl) {
            const oldPath = path.join(process.cwd(), 'backend', platform.logoUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        platform.logoUrl = `/uploads/${req.file.filename}`;
    }

    const updatedPlatform = await platform.save();

    await Activity.logAction({
        user: req.user._id,
        actionType: ACTIVITY_TYPES.PLATFORM_UPDATE,
        description: `Admin ${req.user.email} modified source classification: ${platform.name}`,
        details: { 
            platformId: platform._id, 
            name: platform.name, 
            statusChange: status || 'no status change'
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'system'
    });

    res.status(200).json({
        success: true,
        platform: updatedPlatform
    });
});

/**
 * @desc    Permanently delete a platform classification
 * @route   DELETE /api/platforms/:id
 * @access  Private/Admin
 */
const deletePlatform = asyncHandler(async (req, res) => {
    const platform = await Platform.findById(req.params.id);

    if (!platform) {
        res.status(404);
        throw new Error('Record Not Found: Platform does not exist');
    }

    // Cleanup asset before record purging
    if (platform.logoUrl) {
        const logoPath = path.join(process.cwd(), 'backend', platform.logoUrl);
        if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
        }
    }

    await platform.deleteOne();

    await Activity.logAction({
        user: req.user._id,
        actionType: ACTIVITY_TYPES.PLATFORM_DELETE,
        description: `Admin ${req.user.email} purged source classification: ${platform.name} from ledger`,
        details: { platformId: platform._id, name: platform.name },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'system'
    });

    res.status(200).json({
        success: true,
        message: 'Record successfully purged'
    });
});

/**
 * @desc    Adjust platform balance (Top-up or correction)
 * @route   POST /api/platforms/:id/adjust
 * @access  Private/Admin
 */
const adjustPlatformBalance = asyncHandler(async (req, res) => {
    const { amount, type = 'topup' } = req.body;
    
    if (amount === undefined) {
        res.status(400);
        throw new Error('Amount is required for adjustment');
    }

    const platform = await Platform.findById(req.params.id);

    if (!platform) {
        res.status(404);
        throw new Error('Record Not Found: Platform does not exist');
    }

    // Update balance
    platform.currentBalanceLkr = (platform.currentBalanceLkr || 0) + Number(amount);
    await platform.save();

    await Activity.logAction({
        user: req.user._id,
        actionType: ACTIVITY_TYPES.PLATFORM_ADJUST,
        description: `Admin ${req.user.email} performed ${type} on ${platform.name}: ${amount} LKR`,
        details: { 
            platformId: platform._id, 
            name: platform.name, 
            adjustment: amount,
            newBalance: platform.currentBalanceLkr,
            type 
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'system'
    });

    res.status(200).json({
        success: true,
        platform
    });
});

export {
    getPlatforms,
    getAdminPlatforms,
    createPlatform,
    updatePlatform,
    deletePlatform,
    adjustPlatformBalance
};
