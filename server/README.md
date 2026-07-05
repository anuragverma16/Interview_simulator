# InterviewIQ AI — Backend

Express.js API for InterviewIQ AI (MongoDB, JWT, Gemini AI, coding runner).

## Quick start

```bash
cd server
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI and GEMINI_API_KEY
npm run seed
npm run dev
```

API: `http://localhost:5000/api/v1`  
Health: `http://localhost:5000/api/health`

## Run with frontend

From `server/`:

```bash
npm run dev:stack
```

Or in two terminals:

```bash
cd server && npm run dev
cd client && npm run dev
```

## Docker (API + MongoDB + client)

```bash
cd server
export JWT_SECRET=your-secret
export JWT_REFRESH_SECRET=your-refresh-secret
export GEMINI_API_KEY=your-gemini-key
docker compose up -d
```

## Deploy on Render

1. Connect GitHub repo
2. **Root Directory:** `server`
3. **Runtime:** Docker (uses `Dockerfile`) or Node with:
   - Build: `npm install`
   - Start: `npm start`
4. **Environment** (required):

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CLIENT_URL` | Frontend URL for CORS |

See `render.yaml` for a Render Blueprint.

## Docs

- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API_STRUCTURE.md)
- [Database schema](docs/DATABASE_SCHEMA.md)

## Default accounts (seeded on first connect)

- User: `demo@interviewiq.com` / `demo123`
- Admin: `admin@interviewiq.com` / `admin123`
