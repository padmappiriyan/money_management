import express from 'express';
import {
    getGlobalRates,
    upsertGlobalRate,
    deleteGlobalRate,
    syncExternalRates
} from '../controllers/globalRateController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @desc    Get all active currency rates for automation
 * @access  Private-Protected (Available for Staff/User)
 */
router.get('/', getGlobalRates);

/**
 * @desc    Create or update a global currency config
 * @access  Private/Admin
 */
router.post('/', protect, admin, upsertGlobalRate);

/**
 * @desc    Sync external currency rates
 * @access  Private/Admin
 */
router.post('/sync', protect, syncExternalRates);

/**
 * @desc    Purge a global currency pair (Admin Only)
 * @access  Private/Admin
 */
router.delete('/:id', protect, admin, deleteGlobalRate);

export default router;
