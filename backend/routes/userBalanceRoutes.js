import express from 'express';
import {
    getMyPlatformBalances,
    adjustStaffPlatformBalance,
    getGlobalPlatformBalances,
    getAllUsersPerformance
} from '../controllers/userBalanceController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @desc    Get aggregate balances across all users (Admin Only)
 * @access  Private/Admin
 */
router.get('/global', protect, admin, getGlobalPlatformBalances);

/**
 * @desc    Get performance breakdown for all users (Admin Only)
 * @access  Private/Admin
 */
router.post('/all-users', protect, admin, getAllUsersPerformance);

/**
 * @desc    Get current user's platform balances
 * @access  Private (Staff/User)
 */
router.get('/mine', protect, getMyPlatformBalances);

/**
 * @desc    Adjust a specific staff member's balance (Admin Only)
 * @access  Private/Admin
 */
router.post('/adjust/:staffId/:platformId', protect, admin, adjustStaffPlatformBalance);

export default router;
