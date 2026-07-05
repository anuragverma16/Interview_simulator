# InterviewIQ AI — Deploy backend on Render (Docker)

## 1. MongoDB Atlas (one-time)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. **Database Access** → create a user + password
3. **Network Access** → **Allow Access from Anywhere** (`0.0.0.0/0`)
4. **Connect** → Drivers → copy URI, e.g.:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/interviewiq?retryWrites=true&w=majority
```

Replace `USER`, `PASSWORD`, and add database name `interviewiq` before `?`.

---

## 2. Push code to GitHub

```bash
git add server/
git commit -m "Prepare server for Render Docker deploy"
git push
```

---

## 3. Create Render Web Service

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:

| Field | Value |
|-------|--------|
| **Name** | `interviewiq-api` (any name) |
| **Root Directory** | `server` |
| **Runtime** | **Docker** |
| **Dockerfile Path** | `./Dockerfile` (default) |
| **Instance type** | Free |

Render auto-detects the Dockerfile — no custom build/start commands needed.

---

## 4. Environment variables (required)

Render → your service → **Environment** → add:

| Key | Example / notes |
|-----|-----------------|
| `MONGODB_URI` | Your Atlas URI (see step 1) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Long random string |
| `JWT_REFRESH_SECRET` | Another long random string |
| `GEMINI_API_KEY` | From [Google AI Studio](https://aistudio.google.com/) |
| `CLIENT_URL` | Frontend URL, e.g. `https://your-app.vercel.app` |

Optional:

| Key | Purpose |
|-----|---------|
| `CORS_ORIGINS` | Extra origins, comma-separated |
| `JWT_EXPIRES_IN` | Default `7d` |

Click **Save Changes** → Render rebuilds and deploys.

---

## 5. Verify deploy

**Logs** should show:

```
MongoDB: using MONGODB_URI from environment → cluster0.xxxxx.mongodb.net
MongoDB connected: ...
InterviewIQ AI Server running on port 10000
Java runtime ready for coding submissions
```

**Health check:**

```
https://YOUR-SERVICE.onrender.com/api/health
```

Expected:

```json
{
  "success": true,
  "message": "InterviewIQ AI API is running",
  "database": "connected",
  "aiConfigured": true
}
```

---

## 6. Connect frontend

In `client/.env` (production build):

```
VITE_API_URL=https://YOUR-SERVICE.onrender.com/api/v1
```

---

## Troubleshooting

| Log / error | Fix |
|-------------|-----|
| `ECONNREFUSED 127.0.0.1:27017` | `MONGODB_URI` not set on Render |
| `MONGODB_URI is required on Render` | Add Atlas URI in Environment tab |
| `npm ci` lock file sync error | Run `npm install` in `server/` and push `package-lock.json` |
| `Missing required environment variables` | Add all vars from step 4 |
| CORS errors in browser | Set `CLIENT_URL` to exact frontend origin (no trailing slash) |
| Build fails on Java | Dockerfile includes OpenJDK 21 — redeploy latest code |

---

## Local Docker test (same as Render)

```bash
cd server
docker build -t interviewiq-api .
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI="your-atlas-uri" \
  -e JWT_SECRET=test-secret \
  -e JWT_REFRESH_SECRET=test-refresh \
  -e CLIENT_URL=http://localhost:5173 \
  -e GEMINI_API_KEY=your-key \
  interviewiq-api
```

---

## Files used for deploy

| File | Purpose |
|------|---------|
| `Dockerfile` | Production image (Node 20 + Java 21) |
| `.dockerignore` | Keeps image small, excludes `.env` |
| `render.yaml` | Optional Render Blueprint |
| `package-lock.json` | Required for `npm ci` in Docker build |
