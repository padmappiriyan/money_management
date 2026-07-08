import asyncHandler from 'express-async-handler';
import { User, USER_ROLES } from '../models/user.model.js';
import { Activity, ACTIVITY_TYPES } from '../models/activity.model.js';
import { Transaction } from '../models/transaction.model.js';
import UserPlatformBalance from '../models/userPlatformBalance.model.js';
import { CashLedger } from '../models/cashLedger.model.js';
import DailyLedgerRollup from '../models/dailyLedgerRollup.model.js';
import { ChangeRequest } from '../models/changeRequest.model.js';
import { AuditLog } from '../models/auditLog.model.js';
import Notification from '../models/notification.model.js';
import { Platform } from '../models/platform.model.js';
import { GlobalRate } from '../models/globalRate.model.js';
import { userEventBus, USER_EVENTS } from '../events/userEvents.js';
import { sendWelcomeCredentialsEmail } from '../services/emailService.js';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import multer from 'multer';

// Multer Storage Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/bulk-user-uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `bulk-users-${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['text/csv', 'application/vnd.ms-excel', 'application/csv', 'text/x-csv', 'text/plain'];
        if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}. Only CSV files are allowed!`), false);
        }
    }
}).single('file');

/**
 * @desc    Create a User or Supervisor (Admin Only)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
    
    const { name, email, password, role } = req.body;
    

    

    // 1. Basic validation
    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error('Please include all fields: name, email, password, role');
    }

    // 2. Validate role matches predefined roles (excluding direct Admin creation for safety)
    if (![USER_ROLES.USER, USER_ROLES.SUPERVISOR].includes(role)) {
        res.status(400);
        throw new Error('Invalid role selected. Must be User or Supervisor');
    }

    // 3. Email exists check (using static method)
    const userExists = await User.findByEmail(email);
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email');
    }

    // 4. Create User
    const newUser = await User.create({
        name,
        email: email.toLowerCase(),
        password, // Pre-save hook will hash this automatically
        role
    });
    
    if (newUser) {
        const emailResult = await sendWelcomeCredentialsEmail({
            name: newUser.name,
            email: newUser.email,
            password,
            role: newUser.role,
        });

        if (emailResult.sent) {
            console.log('[User] Credentials email sent for new user:', {
                userId: newUser._id,
                email: newUser.email,
                messageId: emailResult.messageId,
            });
        } else {
            console.warn('[User] New user created but credentials email was not sent:', {
                userId: newUser._id,
                email: newUser.email,
                reason: emailResult.error,
            });
        }

        // Log Activity (Action by Admin)
        await Activity.logAction({
            user: req.user._id, // The Admin who created the user
            actionType: ACTIVITY_TYPES.USER_CREATE,
            description: `Admin ${req.user.email} created new user: ${newUser.email} with role: ${newUser.role}`,
            details: {
                targetUserId: newUser._id,
                targetRole: newUser.role,
                credentialsEmailSent: emailResult.sent,
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            category: 'user_management'
        });

        res.status(201).json({
            success: true,
            user: newUser.getSafeData(),
            emailSent: emailResult.sent,
            ...(emailResult.sent ? {} : { emailError: emailResult.error }),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

/**
 * @desc    Get paginated users with optional search (Admin Only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const keyword = req.query.search;
    const role = req.query.role;

    // 1. Build Query
    let query = keyword ? {
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { email: { $regex: keyword, $options: 'i' } }
        ]
    } : {};

    // 2. Add Role Filter (if specified and not 'all')
    if (role && role !== 'all') {
        // Handle singular/plural common naming conventions
        const normalizedRole = role.toLowerCase().replace(/s$/, ''); // Remove trailing 's' if exists
        query.role = normalizedRole;
    }

    // 3. Execute Query with Pagination
    const total = await User.countDocuments(query);
    const users = await User.find(query)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit);

    // 4. Return Paginated Results
    res.status(200).json({
        success: true,
        users,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    });
});

/**
 * @desc    Update user status (Active/Inactive/Deleted) (Admin Only)
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;


    // 1. Validate Status accurately (now including 'deleted')
    const validStatuses = ['active', 'inactive', 'suspended', 'deleted'];
    if (!validStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status: ${status}. Allowed: active, inactive, suspended, or deleted! [MODIFIED]`);
    }

    // 2. Prevent Self-Modification (Safety Rule)
    if (req.user._id.toString() === id && status !== 'active') {
        res.status(400);
        throw new Error('Security Alert: Administrative self-modification (deactivation/deletion) is prohibited.');
    }

    // 3. Find User
    const user = await User.findById(id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // ── Handle HARD DELETE ──
    if (status === 'deleted') {
        const email = user.email;
        const userId = user._id;

        // Cascade Deletions across all user-specific data
        await Promise.all([
            Transaction.deleteMany({ staffId: userId }),
            UserPlatformBalance.deleteMany({ userId: userId }),
            CashLedger.deleteMany({ staffId: userId }),
            DailyLedgerRollup.deleteMany({ staffId: userId }),
            ChangeRequest.deleteMany({ $or: [{ requestedBy: userId }, { handledBy: userId }] }),
            Activity.deleteMany({ user: userId }),
            AuditLog.deleteMany({ userId: userId }),
            Notification.deleteMany({ targetUserId: userId }),
            user.deleteOne()
        ]);

        // Nullify references in global entities to prevent breaking the system
        await Promise.all([
            Platform.updateMany({ createdBy: userId }, { $set: { createdBy: null } }),
            GlobalRate.updateMany({ updatedBy: userId }, { $set: { updatedBy: null } })
        ]);

        // Log Activity
        await Activity.logAction({
            user: req.user._id,
            actionType: ACTIVITY_TYPES.USER_DELETE,
            description: `Admin ${req.user.email} permanently deleted user account: ${email}`,
            details: { targetUserId: id, targetEmail: email },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            category: 'user_management'
        });

        return res.status(200).json({
            success: true,
            message: 'Account permanently purged from the system'
        });
    }

    // ── Handle STATUS UPDATE (Active/Inactive/Suspended) ──
    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // Log Activity
    await Activity.logAction({
        user: req.user._id, // The Admin who performed the change
        actionType: 'USER_UPDATE',
        description: `Admin ${req.user.email} changed user ${user.email} status from ${oldStatus} to ${status}`,
        details: { targetUserId: user._id, oldStatus, newStatus: status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'user_management'
    });

    res.status(200).json({
        success: true,
        message: `Account status updated to ${status} successfully`,
        user: user.getSafeData()
    });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json({
        success: true,
        user: user.getSafeData()
    });
});

/**
 * @desc    Update current user profile (Name Only)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const oldData = { name: user.name, phoneNumber: user.phoneNumber, address: user.address, dob: user.dob, nationalId: user.nationalId };

    if (req.body.name) user.name = req.body.name;
    if (req.body.phoneNumber !== undefined) user.phoneNumber = req.body.phoneNumber;
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.dob !== undefined) user.dob = req.body.dob;
    if (req.body.nationalId !== undefined) user.nationalId = req.body.nationalId;

    const updatedUser = await user.save();

    // Log Activity
    await Activity.logAction({
        user: user._id,
        actionType: ACTIVITY_TYPES.USER_UPDATE,
        description: `User ${user.email} updated their profile information`,
        details: { oldData, newData: { name: updatedUser.name, phoneNumber: updatedUser.phoneNumber, address: updatedUser.address, dob: updatedUser.dob, nationalId: updatedUser.nationalId } },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'user_management'
    });

    res.status(200).json({
        success: true,
        user: updatedUser.getSafeData()
    });
});

/**
 * @desc    Get counts of users by role (Admin Only)
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
    const stats = await User.aggregate([
        {
            $group: {
                _id: '$role',
                count: { $sum: 1 }
            }
        }
    ]);

    const formattedStats = {
        total: 0,
        admin: 0,
        supervisor: 0,
        user: 0
    };

    stats.forEach(stat => {
        if (stat._id in formattedStats) {
            formattedStats[stat._id] = stat.count;
        }
    });

    formattedStats.total = formattedStats.admin + formattedStats.supervisor + formattedStats.user;

    res.status(200).json({
        success: true,
        stats: formattedStats
    });
});

/**
 * @desc    Download User Template (CSV)
 * @route   GET /api/users/template/download
 * @access  Private/Admin
 */
const downloadTemplate = asyncHandler(async (req, res) => {
    console.log('[UserController] Template download requested');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Template');

    worksheet.columns = [
        { header: 'Name', key: 'name', width: 20 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Password', key: 'password', width: 15 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'PhoneNumber', key: 'phoneNumber', width: 15 },
        { header: 'Address', key: 'address', width: 30 },
        { header: 'DOB', key: 'dob', width: 15 },
        { header: 'NationalID', key: 'nationalId', width: 20 },
    ];

    // Add example row
    worksheet.addRow({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'user',
        phoneNumber: '+1234567890',
        address: '123 Main St, City',
        dob: '1990-01-01',
        nationalId: 'ID12345'
    });

    // Use res.attachment to set both Content-Type and Content-Disposition correctly
    res.attachment('user_template.csv');
    res.setHeader('Content-Type', 'text/csv');

    const buffer = await workbook.csv.writeBuffer();
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
});

/**
 * @desc    Bulk Upload Users (Asynchronous)
 * @route   POST /api/users/bulk-upload
 * @access  Private/Admin
 */
const bulkUploadUsers = (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error('[UserController] Multer error:', err.message);
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a CSV file' });
        }

        console.log('[UserController] Bulk upload file received:', req.file.path);

        // Trigger Event (Asynchronous)
        userEventBus.emit(USER_EVENTS.BULK_UPLOAD_REQUESTED, {
            filePath: req.file.path,
            adminUser: req.user,
            clientIp: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(202).json({
            success: true,
            message: 'Bulk upload started. Processing in background...'
        });
    });
};

export { createUser, getUsers, updateUserStatus, getProfile, updateProfile, getUserStats, downloadTemplate, bulkUploadUsers };
