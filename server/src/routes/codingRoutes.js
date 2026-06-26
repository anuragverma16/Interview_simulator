import { Router } from 'express';
import { authenticate } from '../middleware/index.js';
import * as coding from '../controllers/codingController.js';

const router = Router();

router.use(authenticate);
router.get('/certificates', coding.getCertificates);
router.get('/certificates/:id/html', coding.getCertificateHtml);
router.get('/topics', coding.getTopicsList);
router.get('/problems', coding.getProblems);
router.get('/problems/number/:id', coding.getProblemByNumber);
router.get('/problems/:slug/starter/:language', coding.getProblemStarter);
router.get('/problems/:slug', coding.getProblemDetail);
router.get('/streak', coding.getStreak);
router.post('/streak/start', coding.startStreak);
router.post('/start', coding.startSession);
router.get('/', coding.getSessions);
router.get('/:id', coding.getSession);
router.post('/:id/run', coding.runCode);
router.post('/:id/language', coding.changeSessionLanguage);
router.post('/:id/submit', coding.submitCode);

export default router;
