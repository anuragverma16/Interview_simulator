import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/index.js';
import { uploadAvatar } from '../middleware/upload.js';
import { AppError } from '../utils/helpers.js';
import * as user from '../controllers/userController.js';

const router = Router();

const handleAvatarUpload = (req, res, next) => {
  uploadAvatar.single('avatar')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'Image must be under 2MB'
        : err.message;
      return next(new AppError(message, 400));
    }
    return next(new AppError(err.message || 'Upload failed', 400));
  });
};

router.use(authenticate);
router.get('/profile', user.getProfile);
router.put('/profile', user.updateProfile);
router.post('/avatar', handleAvatarUpload, user.uploadAvatarImage);
router.put('/settings', user.updateSettings);
router.get('/stats', user.getStats);

export default router;
