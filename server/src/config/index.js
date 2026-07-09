import dotenv from 'dotenv';
dotenv.config();

function resolveMongoUri() {
  return (
    process.env.MONGODB_URI
    || process.env.DATABASE_URL
  );
}

function resolveClientOrigins() {
  const origins = new Set();
  const primary = (process.env.CLIENT_URL).replace(/\/$/, '');
  origins.add(primary);

  const extra = process.env.CORS_ORIGINS || process.env.CLIENT_URLS || '';
  for (const part of extra.split(',')) {
    const url = part.trim().replace(/\/$/, '');
    if (url) origins.add(url);
  }

  return [...origins];
}

export const isCloudHost = Boolean(
  process.env.RENDER
  || process.env.RAILWAY_ENVIRONMENT
  || process.env.FLY_APP_NAME
  || process.env.VERCEL
  || process.env.HEROKU_APP_NAME
);

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || (isCloudHost ? 'production' : 'development'),
  mongodbUri: resolveMongoUri(),
  clientOrigins: resolveClientOrigins(),
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  clientUrl: resolveClientOrigins()[0],
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },
  email: {
    enabled: Boolean(process.env.SMTP_HOST && process.env.SMTP_PASS && (process.env.SMTP_USER || process.env.SMTP_HOST.includes('sendgrid'))),
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: (process.env.SMTP_HOST || '').includes('sendgrid')
      ? 'apikey'
      : (process.env.SMTP_USER || ''),
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'InterviewIQ AI <noreply@interviewiq.ai>',
  },
  emailjs: {
    enabled: Boolean(
      process.env.EMAILJS_SERVICE_ID
      && process.env.EMAILJS_TEMPLATE_ID
      && process.env.EMAILJS_PUBLIC_KEY
      && process.env.EMAILJS_PRIVATE_KEY
    ),
    serviceId: process.env.EMAILJS_SERVICE_ID || '',
    templateId: process.env.EMAILJS_TEMPLATE_ID || '',
    publicKey: process.env.EMAILJS_PUBLIC_KEY || '',
    privateKey: process.env.EMAILJS_PRIVATE_KEY || '',
  },
};
