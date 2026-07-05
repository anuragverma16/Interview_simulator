# InterviewIQ AI — Backend

Express API · MongoDB · JWT · Gemini AI · Java code runner

**Deploy on Render:** see [DEPLOY.md](DEPLOY.md)

## Local development

```bash
cd server
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI and GEMINI_API_KEY
npm run dev
```

- API: `http://localhost:5000/api/v1`
- Health: `http://localhost:5000/api/health`

## Run with frontend

```bash
npm run dev:stack
```

## Deploy on Render (Docker)

1. Push repo to GitHub
2. Render → **New Web Service** → connect repo
3. **Root Directory:** `server`
4. **Runtime:** Docker
5. Add env vars: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GEMINI_API_KEY`, `CLIENT_URL`
6. Deploy

Full guide: **[DEPLOY.md](DEPLOY.md)**

## Docker local test

```bash
docker build -t interviewiq-api .
docker run -p 5000:5000 --env-file .env -e NODE_ENV=production interviewiq-api
```

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API_STRUCTURE.md)
- [Database schema](docs/DATABASE_SCHEMA.md)
