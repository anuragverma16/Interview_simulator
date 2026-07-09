const isCloudHost = Boolean(
  process.env.RENDER
  || process.env.RAILWAY_ENVIRONMENT
  || process.env.FLY_APP_NAME
  || process.env.VERCEL
  || process.env.HEROKU_APP_NAME
);

export function verifyProductionEnv() {
  const issues = [];
  const isProduction = process.env.NODE_ENV === 'production' || isCloudHost;

  if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
    issues.push('MONGODB_URI — MongoDB Atlas connection string (required on Render)');
  }

  if (isProduction) {
    if (!process.env.JWT_SECRET) {
      issues.push('JWT_SECRET — random secret for auth tokens');
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      issues.push('JWT_REFRESH_SECRET — random secret for refresh tokens');
    }
    if (!process.env.CLIENT_URL) {
      console.warn(
        '[env] CLIENT_URL not set — using production CORS fallbacks (Vercel). '
        + 'Set CLIENT_URL=https://interview-simulator-beta-henna.vercel.app on your host for explicit config.'
      );
    }
  }

  if (issues.length > 0) {
    console.error('\nMissing required environment variables:\n');
    issues.forEach((msg) => console.error(`   - ${msg}`));
    console.error('\n   Render -> Dashboard -> your service -> Environment -> add each variable, then redeploy.\n');
    if (isCloudHost) {
      throw new Error('Required environment variables are missing');
    }
  }
}
