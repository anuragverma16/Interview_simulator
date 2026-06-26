import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/index.js';
import { uploadResume as uploadMiddleware } from '../middleware/upload.js';
import { AppError } from '../utils/helpers.js';
import { config } from '../config/index.js';
import * as resume from '../controllers/resumeController.js';

const router = Router();

const maxMb = Math.round(config.upload.maxFileSize / (1024 * 1024));

const handleResumeUpload = (req, res, next) => {
  uploadMiddleware.single('resume')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? `Resume must be under ${maxMb}MB`
        : err.message;
      return next(new AppError(message, 400));
    }
    return next(new AppError(err.message || 'Upload failed', 400));
  });
};

router.use(authenticate);
router.post('/upload', handleResumeUpload, resume.uploadResume);
router.get('/', resume.getResumes);
router.get('/:id', resume.getResume);
router.delete('/:id', resume.deleteResume);
router.post('/:id/reanalyze', resume.reanalyzeResume);

export default router;
