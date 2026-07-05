# InterviewIQ AI — Frontend

React + Vite + TypeScript client for InterviewIQ AI.

## Quick start

```bash
cd client
npm install
npm run dev
```

App: `http://localhost:5173`  
API is proxied to `http://localhost:5000` (see `vite.config.ts`).

## Environment

Copy `.env.example` to `.env`:

```bash
VITE_API_URL=/api/v1
```

For production (separate API host), set:

```bash
VITE_API_URL=https://your-api.onrender.com/api/v1
```

## Build

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or Render Static Site.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · GSAP · Framer Motion · Monaco Editor
