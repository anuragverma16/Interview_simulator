import { Router } from 'express';
import { validate, authenticate } from '../middleware/index.js';
import * as auth from '../controllers/authController.js';

const router = Router();

router.post('/register', ...auth.register.slice(0, 3), validate, auth.register[3]);
router.post('/login', ...auth.login.slice(0, 2), validate, auth.login[2]);
router.post('/refresh', auth.refresh);
router.post('/logout', authenticate, auth.logout);

export default router;
