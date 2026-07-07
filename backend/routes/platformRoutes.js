import express from 'express';
import {
    getPlatforms,
    getAdminPlatforms,
    createPlatform,
    updatePlatform,
    deletePlatform,
    adjustPlatformBalance
} from '../controllers/platformController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

/**
 * @desc    Get all active platforms for general selection
 * @access  Private-Protected (Available for Staff/User)
 */
router.get('/', protect, getPlatforms);

/**
 * @desc    Get all platforms including inactive (Admin Only)
 * @access  Private/Admin
 */
router.get('/admin', protect, admin, getAdminPlatforms);

/**
 * @desc    Create a new platform classification with optional logo
 * @access  Private/Admin
 */
router.post('/', protect, admin, upload.single('logo'), createPlatform);

/**
 * @desc    Adjust platform balance (Top-up or correction)
 * @access  Private/Admin
 */
router.post('/:id/adjust', protect, admin, adjustPlatformBalance);

/**
 * @desc    Update brand name, status or logo for existing platform
 * @access  Private/Admin
 */
router.put('/:id', protect, admin, upload.single('logo'), updatePlatform);

/**
 * @desc    Hard Purge a platform record (Admin Only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deletePlatform);

export default router;
