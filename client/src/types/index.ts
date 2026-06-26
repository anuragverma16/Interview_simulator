export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  profile: {
    bio: string;
    location: string;
    linkedin: string;
    github: string;
    targetRole: string;
    experience: string;
  };
  settings: {
    emailNotifications: boolean;
    theme: 'dark' | 'light' | string;
    language: string;
    textSize?: 'small' | 'medium' | 'large' | string;
    showParticles?: boolean;
    reduceMotion?: boolean;
  };
  stats: {
    totalInterviews: number;
    avgScore: number;
    streak: number;
    xp: number;
    level: number;
  };
  createdAt: string;
}

export interface Resume {
  _id: string;
  fileName: string;
  parsed: {
    skills: string[];
    projects: { name: string; description: string; technologies: string[] }[];
    education: { degree: string; institution: string; year: string }[];
    experience: { company: string; role: string; duration: string; description: string }[];
  };
  analysis: {
    atsScore: number;
    resumeScore: number;
    missingKeywords: string[];
    suggestions: string[];
    strengths: string[];
    weaknesses: string[];
  };
  createdAt: string;
}

export interface Interview {
  _id: string;
  type: string;
  difficulty: string;
  mode: string;
  status: string;
  targetRole?: string;
  skills?: string[];
  totalQuestions?: number;
  questions: {
    question: string;
    answer?: string;
    feedback?: string;
    score?: number;
    issue?: string;
    suggestion?: string;
    skillArea?: string;
    followUps?: { question: string; answer: string; feedback: string }[];
  }[];
  analysis: {
    overallScore: number;
    marksObtained?: number;
    totalMarks?: number;
    communicationScore: number;
    technicalScore: number;
    confidenceScore: number;
    fillerWords: { word: string; count: number }[];
    strengths: string[];
    improvements: string[];
    mistakes?: {
      question: string;
      yourAnswer: string;
      issue: string;
      suggestion: string;
      score: number;
      skillArea?: string;
    }[];
    bestAnswers?: {
      question: string;
      yourAnswer: string;
      highlight: string;
      score: number;
      skillArea?: string;
    }[];
    summary?: string;
  };
  createdAt: string;
}

export interface SkillGap {
  _id: string;
  targetRole: string;
  matchedSkills: string[];
  missingSkills: { skill: string; priority: string; resources: string[] }[];
  matchPercentage: number;
  roadmap: { week: number; topics: string[]; resources: string[]; completed: boolean }[];
  progress: number;
  createdAt: string;
}

export interface CodingSession {
  _id: string;
  language: string;
  mode?: 'practice' | 'streak' | 'catchup';
  catchUpDate?: string;
  problemSlug?: string;
  problem: {
    slug?: string;
    leetcodeId?: number;
    title: string;
    description: string;
    difficulty: string;
    tags?: string[];
    examples?: { input: string; output: string; explanation?: string }[];
    constraints?: string[];
    functionName?: string;
    returnType?: string;
    paramOrder?: string[];
    parameters?: { name: string; type: string }[];
    testCases?: { input: string; expected: string }[];
  };
  code: string;
  runResults?: {
    passed: number;
    total: number;
    allPassed: boolean;
    results: {
      index: number;
      passed: boolean;
      input: string;
      expected: string;
      actual: string | null;
      error?: string;
      hidden?: boolean;
    }[];
    error?: string;
  };
  feedback: {
    correctness: number;
    efficiency: string;
    timeComplexity: string;
    spaceComplexity: string;
    suggestions: string[];
    score: number;
  };
  status: string;
  createdAt: string;
}

export interface LeetCodeProblem {
  slug: string;
  leetcodeId: number;
  title: string;
  difficulty: string;
  tags: string[];
  acceptance?: number | null;
  solved?: boolean;
  generated?: boolean;
}

export interface ProblemTopic {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export interface FeaturedPracticeProblem extends LeetCodeProblem {
  validUntil: string;
  remainingMs: number;
  timeRemaining: string;
  adminScheduled: true;
}

export interface ProblemsResponse {
  items: LeetCodeProblem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  solvedSlugs?: string[];
  totalProblems?: number;
  featuredPracticeProblem?: FeaturedPracticeProblem | null;
  difficulties: { easy: number; medium: number; hard: number };
}

export interface Certificate {
  _id: string;
  certId: string;
  type: string;
  title: string;
  recipientName?: string;
  streakDay: number;
  problemTitle?: string;
  language?: string;
  earnedAt: string;
  metadata?: { points?: number; date?: string };
}

export interface MissedChallenge {
  date: string;
  problemSlug: string;
  solved: boolean;
  pointsLost: number;
  problem?: { slug: string; title: string; difficulty: string; leetcodeId: number } | null;
}

export interface StreakCalendarDay {
  date: string;
  status: 'solved' | 'catchup' | 'missed' | 'freeze' | 'empty' | 'pending';
  day: number;
  month: number;
  year: number;
  weekday: number;
}

export interface StreakCalendarMeta {
  years: number[];
  currentYear: number;
  currentMonth: number;
  minYear: number;
  selectedYear: number;
  selectedMonth: number;
  firstWeekday: number;
  daysInMonth: number;
  monthStats: { solved: number; missed: number; totalDays: number };
}

export interface CodingStreakData {
  currentStreak: number;
  longestStreak: number;
  streakPoints: number;
  totalSolved: number;
  todaySolved: boolean;
  todayProblem: CodingSession['problem'] | null;
  dailyDate: string;
  dailyProblemPending?: boolean;
  dailyProblemExpired?: boolean;
  adminScheduledDaily?: boolean;
  dailyValidUntil?: string | null;
  dailyProblemPublishAt?: string | null;
  dailyProblemPublishLabel?: string | null;
  scheduledProblemTitle?: string | null;
  nextResetAt: string;
  timeRemaining: { hours: number; minutes: number; seconds: number; label: string };
  timeRemainingMs: number;
  missedChallenges: MissedChallenge[];
  solvedSlugs: string[];
  streakHistory: { date: string; problemSlug: string; solved: boolean; points?: number; catchUp?: boolean }[];
  streakCalendar?: StreakCalendarDay[];
  streakCalendarMeta?: StreakCalendarMeta;
  streakFreezes?: number;
  freezeUsedDates?: string[];
  certificates?: Certificate[];
  totalProblems?: number;
  pointsInfo?: { dailyReward: number; catchUpReward: number; missedPenalty: number };
}

export interface CareerPrediction {
  _id: string;
  placementReadiness: number;
  careerMatches: { role: string; matchScore: number; reasoning: string }[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  marketInsights: string;
  createdAt: string;
}

export interface LearningRoadmap {
  _id: string;
  title: string;
  targetRole: string;
  duration: string;
  phases: {
    phase: number;
    title: string;
    weeks: number;
    topics: { name: string; completed: boolean; resources: string[] }[];
    milestones: string[];
  }[];
  progress: number;
  createdAt: string;
}

export interface ActivityHistoryItem {
  id: string;
  type: 'interview' | 'coding' | 'resume' | 'skill-gap' | 'career' | 'roadmap' | 'certificate';
  title: string;
  subtitle: string;
  problemName?: string;
  score?: number | string | null;
  status?: string;
  link: string;
  createdAt: string;
}

export interface ActivityHistoryResponse {
  items: ActivityHistoryItem[];
  total: number;
  page: number;
  limit: number;
  filters: { id: string; label: string }[];
}

export interface StreakLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  currentStreak: number;
  longestStreak: number;
  streakPoints: number;
  totalSolved: number;
  isCurrentUser?: boolean;
}

export interface XpLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  xp: number;
  level: number;
  streak: number;
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  isActive: boolean;
  lastLogin?: string;
  joinedAt?: string;
}

export interface AdminLeaderboardResponse {
  items: XpLeaderboardEntry[];
  topThree: Pick<XpLeaderboardEntry, 'rank' | 'userId' | 'name' | 'avatar' | 'xp' | 'level'>[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  totalUsers: number;
}

export interface MilestoneBadge {
  day: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  certificate: Certificate | null;
}

export interface Achievement {
  _id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
}

export interface DashboardData {
  stats: User['stats'];
  recentInterviews: Interview[];
  recentCoding: CodingSession[];
  resumes: Resume[];
  achievements: { achievementId: Achievement; unlockedAt: string }[];
  interviewScores: number[];
  skillProgress: { skill: string; progress: number }[];
  chartData: { labels: string[]; interviews: number[]; scores: number[] };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
