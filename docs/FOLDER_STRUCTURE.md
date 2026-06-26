# InterviewIQ AI — Folder Structure

```
Interview-Simulator/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_STRUCTURE.md
│   ├── WIREFRAMES.md
│   └── FOLDER_STRUCTURE.md
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── animations/
│   │   │   │   ├── FadeInUp.tsx
│   │   │   │   ├── LoadingScreen.tsx
│   │   │   │   ├── MouseGlow.tsx
│   │   │   │   ├── PageTransition.tsx
│   │   │   │   ├── ParticleBackground.tsx
│   │   │   │   └── ScrollReveal.tsx
│   │   │   ├── layout/
│   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── ProgressBar.tsx
│   │   │       ├── ProgressRing.tsx
│   │   │       └── Skeleton.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ResumeAnalyzerPage.tsx
│   │   │   ├── SkillGapPage.tsx
│   │   │   ├── InterviewPage.tsx
│   │   │   ├── CodingPage.tsx
│   │   │   ├── CareerPage.tsx
│   │   │   ├── RoadmapPage.tsx
│   │   │   ├── AchievementsPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── cn.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── index.js
│   │   ├── controllers/
│   │   │   ├── adminController.js
│   │   │   ├── authController.js
│   │   │   ├── careerController.js
│   │   │   ├── codingController.js
│   │   │   ├── dashboardController.js
│   │   │   ├── interviewController.js
│   │   │   ├── resumeController.js
│   │   │   ├── roadmapController.js
│   │   │   ├── skillGapController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── index.js
│   │   │   └── upload.js
│   │   ├── models/
│   │   │   ├── Achievement.js
│   │   │   ├── AdminLog.js
│   │   │   ├── CareerPrediction.js
│   │   │   ├── CodingSession.js
│   │   │   ├── Interview.js
│   │   │   ├── LearningRoadmap.js
│   │   │   ├── Resume.js
│   │   │   ├── SkillGap.js
│   │   │   ├── User.js
│   │   │   └── UserAchievement.js
│   │   ├── routes/
│   │   │   ├── achievementRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── careerRoutes.js
│   │   │   ├── codingRoutes.js
│   │   │   ├── dashboardRoutes.js
│   │   │   ├── interviewRoutes.js
│   │   │   ├── resumeRoutes.js
│   │   │   ├── roadmapRoutes.js
│   │   │   ├── skillGapRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── scripts/
│   │   │   └── seedAchievements.js
│   │   ├── services/
│   │   │   ├── achievementService.js
│   │   │   └── aiService.js
│   │   ├── utils/
│   │   │   ├── helpers.js
│   │   │   └── jwt.js
│   │   └── index.js
│   ├── uploads/
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
├── package.json
├── .gitignore
└── README.md
```
