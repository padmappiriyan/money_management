import express from 'express';
import { protect, admin, supervisor } from '../middlewares/authMiddleware.js';
import { getAllActivities, getMyActivities, getUserActivities, getRateSyncHistory } from '../controllers/activityController.js';

const router = express.Router();

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get all activities (Admin only)
 *     tags: [Activities]
 *     security:
 *       - cookieAuth: []
 */
router.get('/', protect, getAllActivities);

/**
 * @swagger
 * /api/activities/me:
 *   get:
 *     summary: Get current authenticated user's activity
 *     tags: [Activities]
 *     security:
 *       - cookieAuth: []
 */
router.get('/me', protect, getMyActivities);

/**
 * @swagger
 * /api/activities/user/{userId}:
 *   get:
 *     summary: Get activities for a specific user (Admin or Supervisor)
 *     tags: [Activities]
 *     security:
 *       - cookieAuth: []
 */
router.get('/user/:userId', protect, supervisor, getUserActivities);

/**
 * @swagger
 * /api/activities/rate-sync-history:
 *   get:
 *     summary: Get rate synchronization history (Admin only)
 *     tags: [Activities]
 */
router.get('/rate-sync-history', protect, admin, getRateSyncHistory);

export default router;
