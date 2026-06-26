import { Router } from 'express';
import { authenticate } from '../middleware/index.js';
import * as interview from '../controllers/interviewController.js';

const router = Router();

router.use(authenticate);
router.get('/roles/list', interview.getInterviewRoles);
router.post('/start', interview.startInterview);
router.get('/:id/welcome', interview.getWelcome);
router.post('/:id/voice-turn', interview.voiceTurn);
router.post('/:id/answer', interview.submitAnswer);
router.post('/:id/follow-up', interview.getFollowUp);
router.post('/:id/complete', interview.completeInterview);
router.post('/voice/analyze', interview.analyzeVoice);
router.get('/', interview.getInterviews);
router.get('/:id', interview.getInterview);

export default router;
