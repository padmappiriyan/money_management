import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User, USER_ROLES } from '../models/user.model.js';

/**
 * Middleware to protect routes and verify JWT.
 */
const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.accessToken;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = await User.findById(decoded.id);
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    } else {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

/**
 * Middleware to restrict access to ADMIN only.
 */
const admin = (req, res, next) => {
    if (req.user && req.user.role === USER_ROLES.ADMIN) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as an admin');
    }
};

/**
 * Middleware to restrict access to SUPERVISOR only.
 */
const supervisor = (req, res, next) => {
    if (req.user && req.user.role === USER_ROLES.SUPERVISOR) {
        next();
    } else {
        res.status(403);
        throw new Error('Not authorized as a supervisor');
    }
};

export { protect, admin, supervisor };
