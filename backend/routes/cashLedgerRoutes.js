import express from 'express';
import {
    openLedger,
    getLedgerStatus,
    lockLedger,
    closeLedger,
    updateReconciliation,
    getReconciliationHistory
} from '../controllers/cashLedgerController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @desc    Get current ledger status
 * @access  Private-Protected
 */
router.get('/status', protect, getLedgerStatus);

/**
 * @desc    Set opening balance
 * @access  Private-Protected
 */
router.post('/opening', protect, openLedger);

/**
 * @desc    Close ledger with billetage
 * @access  Private-Protected
 */
router.post('/close', protect, closeLedger);

/**
 * @desc    Lock ledger for reconciliation
 * @access  Private-Protected
 */
router.post('/lock', protect, lockLedger);

/**
 * @desc    Save daily reconciliation
 * @access  Private
 */
router.post('/reconcile', protect, updateReconciliation);

/**
 * @desc    Get reconciliation history
 * @access  Private
 */
router.get('/reconciliation-history', protect, getReconciliationHistory);

export default router;
