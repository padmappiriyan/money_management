import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { Activity, ACTIVITY_TYPES } from '../models/activity.model.js';
import generateTokens from '../utils/generateToken.js';

/**
 * @desc    Auth user & get tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // 1. Validate Input
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide an email and password');
    }

    // 2. Find User (using the static method from model)
    const user = await User.findByEmail(email).select('+password');

    if (!user) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // 3. Verify Password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid email or password');
    }

    // 4. Check Status
    if (user.status !== 'active') {
        res.status(403);
        throw new Error('Your account is inactive. Please contact your administrator.');
    }

    // 5. Generate Tokens and Store Refresh Token
    const refreshToken = generateTokens(res, user._id);
    user.refreshToken = refreshToken;
    await user.save();

    // 6. Log Activity
    await Activity.logAction({
        user: user._id,
        actionType: ACTIVITY_TYPES.LOGIN,
        description: `User ${user.email} logged in successfully`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'auth'
    });

    // 7. Return Safe User Info
    res.status(200).json({
        success: true,
        user: user.getSafeData()
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        res.status(401);
        throw new Error('Not authorized, no refresh token');
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id).select('+refreshToken');

        // Verify that the stored token matches what's provided
        if (!user || user.refreshToken !== refreshToken) {
            res.status(401);
            throw new Error('Invalid or expired refresh token');
        }

        // Generate new pair (Token Rotation for maximum security)
        const newRefreshToken = generateTokens(res, user._id);
        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully'
        });
    } catch (error) {
        res.status(401);
        throw new Error('Not authorized, refresh token failed');
    }
});

/**
 * @desc    Logout user / clear cookies
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    // Clear refresh token in database (revocation)
    if (refreshToken) {
        await User.findOneAndUpdate(
            { refreshToken },
            { $unset: { refreshToken: 1 } }
        );
    }

    const commonCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    };

    res.cookie('accessToken', '', {
        ...commonCookieOptions,
        expires: new Date(0),
    });
    res.cookie('refreshToken', '', {
        ...commonCookieOptions,
        expires: new Date(0),
    });

    // 7. Log Activity
    if (req.user) {
        await Activity.logAction({
            user: req.user._id,
            actionType: ACTIVITY_TYPES.LOGOUT,
            description: `User ${req.user.email} logged out`,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            category: 'auth'
        });
    }

    res.status(200).json({ message: 'User logged out successfully' });
});

/**
 * @desc    Change password
 * @route   POST /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error('Please provide current and new password');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid current password');
    }

    // Update password
    user.password = newPassword;
    user.isPasswordResetRequired = false; // Mark as reset
    await user.save();

    // 10. Log Activity
    await Activity.logAction({
        user: user._id,
        actionType: ACTIVITY_TYPES.PASSWORD_CHANGE,
        description: `User ${user.email} changed their password`,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        category: 'auth'
    });

    res.status(200).json({
        success: true,
        message: 'Password updated successfully'
    });
});

export { loginUser, logoutUser, refreshAccessToken, changePassword };

