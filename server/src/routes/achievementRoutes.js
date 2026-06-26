import { Router } from 'express';
import { authenticate } from '../middleware/index.js';
import * as dashboard from '../controllers/dashboardController.js';

const router = Router();

router.use(authenticate);
router.get('/', dashboard.getAchievements);
router.get('/user', dashboard.getUserAchievements);

export default router;
