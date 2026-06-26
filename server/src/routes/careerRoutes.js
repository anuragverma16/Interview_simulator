import { Router } from 'express';
import { authenticate } from '../middleware/index.js';
import * as career from '../controllers/careerController.js';

const router = Router();

router.use(authenticate);
router.post('/predict', career.predict);
router.get('/', career.getPredictions);
router.get('/:id', career.getPrediction);

export default router;
