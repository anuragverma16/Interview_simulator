import { Router } from 'express';
import { authenticate, authorizeAdmin } from '../middleware/index.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

router.use(authenticate, authorizeAdmin);
router.get('/stats', admin.getStats);
router.get('/leaderboard', admin.getLeaderboard);
router.get('/users', admin.getUsers);
router.get('/users/:id', admin.getUserById);
router.post('/notifications/broadcast', admin.sendBroadcastNotification);
router.post('/users/:id/notifications', admin.sendUserNotification);
router.put('/users/:id', admin.updateUser);
router.delete('/users/:id', admin.deleteUser);
router.get('/logs', admin.getLogs);
router.get('/daily-problems', admin.getDailyProblemSchedules);
router.get('/daily-problems/picker', admin.getDailyProblemPicker);
router.post('/daily-problems', admin.upsertDailyProblemSchedule);
router.post('/daily-problems/:date/publish', admin.publishDailyProblemNow);
router.delete('/daily-problems/:date', admin.deleteDailyProblemSchedule);

export default router;
