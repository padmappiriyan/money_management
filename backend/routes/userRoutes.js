import express from 'express';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { 
    createUser, 
    getUsers, 
    updateUserStatus, 
    getProfile, 
    updateProfile, 
    getUserStats,
    downloadTemplate,
    bulkUploadUsers
} from '../controllers/userController.js';

const router = express.Router();

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user counts by role (Admin Only)
 *     tags: [Users]
 */
router.get('/stats', protect, admin, getUserStats);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Users]
 */
router.get('/profile', protect, getProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update current logged-in user profile
 *     tags: [Users]
 */
router.put('/profile', protect, updateProfile);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new User or Supervisor (Admin Only)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, supervisor]
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Not authorized as an admin
 */
router.post('/', protect, admin, createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin Only)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 */
router.get('/', protect, admin, getUsers);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Toggle user status (Admin Only)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch('/:id/status', protect, admin, updateUserStatus);

// ── BULK UPLOAD ROUTES ──
router.get('/template/download', protect, admin, downloadTemplate);
router.post('/bulk-upload', protect, admin, bulkUploadUsers);

// Removed redundant DELETE route as it is now handled by PATCH /:id/status


export default router;
