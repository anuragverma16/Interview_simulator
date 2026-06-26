import { Router } from 'express';
import { authenticate } from '../middleware/index.js';
import * as skillGap from '../controllers/skillGapController.js';

const router = Router();

router.use(authenticate);
router.post('/analyze', skillGap.analyzeGap);
router.get('/', skillGap.getSkillGaps);
router.get('/:id', skillGap.getSkillGap);
router.put('/:id/progress', skillGap.updateProgress);

export default router;
