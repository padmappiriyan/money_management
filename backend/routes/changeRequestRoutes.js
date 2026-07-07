import express from 'express';
import {
    createChangeRequest,
    getChangeRequests,
    getChangeRequestById,
    approveChangeRequest,
    rejectChangeRequest,
    getChangeRequestAnalytics
} from '../controllers/changeRequestController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Analytics - accessible to all authenticated roles; data is filtered per role inside controller
router.get('/stats/analytics', protect, getChangeRequestAnalytics);

router.route('/')
    .post(protect, createChangeRequest)
    .get(protect, getChangeRequests);

router.route('/:id')
    .get(protect, getChangeRequestById);

router.put('/:id/approve', protect, admin, approveChangeRequest);
router.put('/:id/reject', protect, admin, rejectChangeRequest);

export default router;
