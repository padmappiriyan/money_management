import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect, admin, supervisor } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/audit-logs
 * @desc    Get all audit logs
 * @access  Private (Admin or Supervisor)
 */
router.route('/')
    .get(protect, getAuditLogs);

export default router;
