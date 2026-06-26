import { Router } from 'express';
import { authenticate } from '../middleware/index.js';
import * as notification from '../controllers/notificationController.js';

const router = Router();

router.use(authenticate);
router.get('/', notification.getMyNotifications);
router.patch('/read-all', notification.markAllNotificationsRead);
router.patch('/:id/read', notification.markNotificationRead);
router.patch('/:id/dismiss', notification.dismissNotification);

export default router;
