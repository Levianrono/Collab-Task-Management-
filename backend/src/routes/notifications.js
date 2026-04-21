// src/routes/notifications.js
import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = Router();

router.use(verifyToken);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);       // must come before /:id to avoid route collision
router.put('/:id/read', markAsRead);

export default router;
