import express from 'express';
import { 
    createTransaction, 
    getTransactions, 
    getLedgerTransactions,
    getTransactionById,
    exportTransactions,
    getTransactionStats
} from '../controllers/transactionController.js';
import { protect, admin, supervisor } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/transactions/ledger
 * @desc    Get filtered ledger for new dashboard design
 * @access  Private
 */
router.get('/ledger', protect, getLedgerTransactions);

/**
 * @route   GET /api/transactions/stats
 * @desc    Get aggregate stats
 * @access  Private
 */
router.get('/stats', protect, getTransactionStats);

/**
 * @route   POST /api/transactions
 * @desc    Create a new financial record
 * @access  Private (Staff/Admin/Supervisor)
 */
router.route('/')
    .post(protect, createTransaction)
    .get(protect, getTransactions);

/**
 * @route   GET /api/transactions/export
 * @desc    Export data to Excel
 * @access  Private (Logged-in user)
 */
router.get('/export', protect, exportTransactions);


/**
 * @route   GET /api/transactions/:id
 * @desc    Get detailed transaction by ID
 * @access  Private (Owner/Admin/Supervisor)
 */
router.route('/:id')
    .get(protect, getTransactionById);

export default router;
