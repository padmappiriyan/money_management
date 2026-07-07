import express from 'express';
import { getTransactionStats } from '../controllers/analyticsController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET /api/analytics/daily
router.route('/daily').get(protect, getTransactionStats);

export default router;
