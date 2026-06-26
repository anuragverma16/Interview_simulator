import { Router } from 'express';
import { authenticate } from '../middleware/index.js';
import * as dashboard from '../controllers/dashboardController.js';

const router = Router();

router.use(authenticate);
router.get('/', dashboard.getDashboard);
router.get('/history', dashboard.getActivityHistory);
router.get('/leaderboard', dashboard.getLeaderboard);
router.get('/streak-leaderboard', dashboard.getStreakLeaderboard);

export default router;
