# InterviewIQ AI — System Architecture

## Overview

InterviewIQ AI is a full-stack SaaS platform for AI-powered interview preparation, resume analysis, skill gap detection, and career intelligence.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                     │
│  Landing │ Auth │ Dashboard │ AI Tools │ Admin │ Animations     │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (JWT)
┌────────────────────────────▼────────────────────────────────────┐
│                     API GATEWAY (Express.js)                     │
│  Auth │ Rate Limit │ Validation │ Error Handler │ CORS          │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────────┐
│   MongoDB     │   │  Gemini API   │   │  File Storage     │
│   (Mongoose)  │   │  + LangChain  │   │  (Resume PDFs)    │
└───────────────┘   └───────────────┘   └───────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Animation | GSAP (ScrollTrigger), Framer Motion |
| Editor | Monaco Editor |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| Auth | JWT (access + refresh tokens), bcrypt |
| AI | Google Gemini API, LangChain |
| Validation | express-validator, Zod (client) |

## Architecture Patterns

- **Monorepo**: `client/` and `server/` with shared conventions
- **Layered Backend**: Routes → Controllers → Services → Models
- **Feature-based Frontend**: Pages, components, hooks, services per domain
- **Protected Routes**: JWT middleware + role-based access (user/admin)
- **AI Service Layer**: Centralized Gemini/LangChain integration with fallbacks

## Security

- Password hashing (bcrypt, 12 rounds)
- JWT with short-lived access tokens + refresh tokens
- Helmet, CORS, rate limiting
- Input validation on all endpoints
- File upload restrictions (PDF only, size limits)
- Environment variables for secrets

## Deployment

- **Frontend**: Vercel / Netlify (static build)
- **Backend**: Railway / Render / Docker
- **Database**: MongoDB Atlas
- Docker Compose for local development
