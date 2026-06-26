import { Router } from 'express';
import * as publicCtrl from '../controllers/publicController.js';

const router = Router();

router.get('/stats', publicCtrl.getPlatformStats);

export default router;
