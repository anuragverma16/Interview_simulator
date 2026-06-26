# InterviewIQ AI

AI-powered interview preparation SaaS platform. Practice interviews, analyze resumes, identify skill gaps, and predict your career path — powered by Google Gemini AI and LangChain.

![InterviewIQ AI](https://img.shields.io/badge/React-19-blue) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![MongoDB](https://img.shields.io/badge/MongoDB-7-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## Features

- **Resume Analyzer** — PDF upload, ATS scoring, keyword analysis, AI suggestions
- **Skill Gap Analyzer** — Compare skills vs job roles with learning roadmaps
- **AI Interview Room** — HR, Technical, Behavioral, FAANG, Startup interviews with voice support
- **Coding Interview** — Monaco editor with AI feedback (JS, Python, Java, C++)
- **Career Prediction** — Placement readiness, career matches, market insights
- **Learning Roadmap** — Personalized phased learning paths
- **Dashboard** — Analytics, charts, leaderboard, achievements
- **Admin Panel** — User management, platform stats

## Tech Stack

| Frontend | Backend |
|----------|---------|
| React 19 + Vite | Node.js + Express |
| TypeScript | MongoDB + Mongoose |
| Tailwind CSS v4 | JWT Authentication |
| GSAP + Framer Motion | Gemini API + LangChain |
| Monaco Editor | PDF parsing |

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### Installation

```bash
# Clone and install
cd Interview-Simulator
npm run install:all

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and Gemini API key

# Seed achievements
cd server && npm run seed && cd ..

# Start development (both client & server)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1

### Docker

```bash
# Set environment variables
export JWT_SECRET=your-secret
export JWT_REFRESH_SECRET=your-refresh-secret
export GEMINI_API_KEY=your-gemini-key

docker-compose up -d
```

## Project Structure

```
Interview-Simulator/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI, layout, animations
│   │   ├── contexts/       # Auth context
│   │   ├── pages/          # 14 pages
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript types
│   └── Dockerfile
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # App configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation, upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   └── services/       # AI & business logic
│   └── Dockerfile
├── docs/                   # Architecture, schema, API docs
└── docker-compose.yml
```

## API Documentation

See [docs/API_STRUCTURE.md](docs/API_STRUCTURE.md) for the complete API reference.

Base URL: `http://localhost:5000/api/v1`

## Admin Access

To create an admin user, register normally then update in MongoDB:

```javascript
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } })
```

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd client && npm run build
# Deploy dist/ folder
```

### Backend (Railway/Render)
```bash
cd server
# Set environment variables in platform dashboard
npm start
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CLIENT_URL` | Frontend URL for CORS |

## License

MIT
