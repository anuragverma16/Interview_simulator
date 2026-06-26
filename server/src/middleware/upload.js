import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.join(__dirname, '..', '..');

export const uploadDir = path.isAbsolute(config.upload.uploadDir)
  ? config.upload.uploadDir
  : path.join(serverRoot, config.upload.uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const pdfFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const pdfMime = file.mimetype === 'application/pdf'
    || file.mimetype === 'application/octet-stream'
    || file.mimetype === 'application/x-pdf';
  if (pdfMime || ext === '.pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
};

const imageFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, WebP, or GIF images are allowed'), false);
};

export const uploadResume = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

export const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
