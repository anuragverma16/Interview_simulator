import User from '../models/User.js';
import Interview from '../models/Interview.js';
import CodingSession from '../models/CodingSession.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';

const SUCCESS_SCORE_THRESHOLD = 70;

export const getPlatformStats = asyncHandler(async (_req, res) => {
  const [
    totalInterviews,
    successfulInterviews,
    activeUsers,
    problemsSolved,
  ] = await Promise.all([
    Interview.countDocuments({ status: 'completed' }),
    Interview.countDocuments({
      status: 'completed',
      'analysis.overallScore': { $gte: SUCCESS_SCORE_THRESHOLD },
    }),
    User.countDocuments({ role: 'user', isActive: { $ne: false } }),
    CodingSession.countDocuments({ status: 'submitted', 'runResults.allPassed': true }),
  ]);

  const successRate = totalInterviews > 0
    ? Math.round((successfulInterviews / totalInterviews) * 100)
    : 0;

  sendSuccess(res, {
    totalInterviews,
    successRate,
    activeUsers,
    problemsSolved,
  });
});
