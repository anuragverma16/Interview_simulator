import { Router } from 'express';
import { authenticate } from '../middleware/index.js';
import * as roadmap from '../controllers/roadmapController.js';

const router = Router();

router.use(authenticate);
router.post('/generate', roadmap.generate);
router.get('/', roadmap.getRoadmaps);
router.get('/:id', roadmap.getRoadmap);
router.put('/:id/progress', roadmap.updateRoadmapProgress);

export default router;
