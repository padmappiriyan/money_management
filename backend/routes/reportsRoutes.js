import express from 'express';
import { getPlatformHistory, getGlobalPlatformHistory, getUserPerformanceHistory } from '../controllers/reportsController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @desc    Get chronological history for platforms (Individual User)
 * @route   GET /api/reports/platform-history
 * @access  Private
 */
router.get('/platform-history', protect, getPlatformHistory);

/**
 * @desc    Get chronological history for all platforms (Admin Global)
 * @route   GET /api/reports/global-platform-history
 * @access  Private/Admin
 */
router.get('/global-platform-history', protect, admin, getGlobalPlatformHistory);

/**
 * @desc    Get chronological history for a specific user (Admin)
 * @route   GET /api/reports/user-performance/:userId
 * @access  Private/Admin
 */
router.get('/user-performance/:userId', protect, admin, getUserPerformanceHistory);

export default router;
