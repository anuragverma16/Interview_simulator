# InterviewIQ AI — Database Schema

## Collections

### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  avatar: String,
  role: Enum ['user', 'admin'],
  profile: {
    bio: String,
    location: String,
    linkedin: String,
    github: String,
    targetRole: String,
    experience: String
  },
  stats: {
    totalInterviews: Number,
    avgScore: Number,
    streak: Number,
    xp: Number,
    level: Number
  },
  achievements: [ObjectId], // ref achievements
  refreshToken: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### resumes
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref users, indexed),
  fileName: String,
  filePath: String,
  rawText: String,
  parsed: {
    skills: [String],
    projects: [{ name, description, technologies }],
    education: [{ degree, institution, year }],
    experience: [{ company, role, duration, description }],
    contact: { email, phone, linkedin }
  },
  analysis: {
    atsScore: Number,
    resumeScore: Number,
    missingKeywords: [String],
    suggestions: [String],
    strengths: [String],
    weaknesses: [String]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### skillGaps
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  resumeId: ObjectId,
  targetRole: String,
  jobDescription: String,
  matchedSkills: [String],
  missingSkills: [{ skill, priority, resources }],
  matchPercentage: Number,
  roadmap: [{ week, topics, resources, completed }],
  progress: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### interviews
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: Enum ['hr', 'technical', 'behavioral', 'faang', 'startup'],
  difficulty: Enum ['easy', 'medium', 'hard', 'adaptive'],
  mode: Enum ['text', 'voice'],
  status: Enum ['in_progress', 'completed', 'abandoned'],
  questions: [{
    question: String,
    answer: String,
    feedback: String,
    score: Number,
    followUps: [{ question, answer, feedback }]
  }],
  transcript: [{ speaker, text, timestamp, confidence }],
  analysis: {
    overallScore: Number,
    communicationScore: Number,
    technicalScore: Number,
    confidenceScore: Number,
    fillerWords: [{ word, count }],
    strengths: [String],
    improvements: [String]
  },
  duration: Number,
  createdAt: Date,
  completedAt: Date
}
```

### codingSessions
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  language: Enum ['javascript', 'python', 'java', 'cpp'],
  problem: { title, description, difficulty, testCases },
  code: String,
  feedback: {
    correctness: Number,
    efficiency: String,
    timeComplexity: String,
    spaceComplexity: String,
    suggestions: [String],
    score: Number
  },
  status: Enum ['in_progress', 'submitted'],
  createdAt: Date,
  submittedAt: Date
}
```

### careerPredictions
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  resumeId: ObjectId,
  placementReadiness: Number,
  careerMatches: [{ role, matchScore, reasoning }],
  strengths: [String],
  weaknesses: [String],
  recommendations: [String],
  marketInsights: String,
  createdAt: Date
}
```

### learningRoadmaps
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  title: String,
  targetRole: String,
  duration: String,
  phases: [{
    phase: Number,
    title: String,
    weeks: Number,
    topics: [{ name, completed, resources }],
    milestones: [String]
  }],
  progress: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### achievements
```javascript
{
  _id: ObjectId,
  key: String (unique),
  title: String,
  description: String,
  icon: String,
  category: Enum ['interview', 'coding', 'learning', 'streak', 'special'],
  xpReward: Number,
  criteria: { type: String, threshold: Number }
}
```

### userAchievements
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  achievementId: ObjectId,
  unlockedAt: Date
}
```

### leaderboard
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  avatar: String,
  xp: Number,
  level: Number,
  rank: Number,
  weeklyXp: Number,
  updatedAt: Date
}
```

### adminLogs
```javascript
{
  _id: ObjectId,
  adminId: ObjectId,
  action: String,
  target: String,
  details: Object,
  createdAt: Date
}
```
