import User from '../models/User.js';
import Interview from '../models/Interview.js';
import CodingSession from '../models/CodingSession.js';
import { PROBLEMS } from '../data/leetcodeProblems.js';
import { asyncHandler, sendSuccess } from '../utils/helpers.js';

export const getPlatformStats = asyncHandler(async (_req, res) => {
  const [totalUsers, interviewsCompleted, problemsSolved, distinctSolved] = await Promise.all([
    User.countDocuments({ role: 'user', isActive: { $ne: false } }),
    Interview.countDocuments({ status: 'completed' }),
    CodingSession.countDocuments({ status: 'submitted', 'runResults.allPassed': true }),
    CodingSession.distinct('problemSlug', { status: 'submitted', 'runResults.allPassed': true }),
  ]);

  sendSuccess(res, {
    totalUsers,
    interviewsCompleted,
    problemsSolved,
    uniqueProblemsSolved: distinctSolved.length,
    problemsInBank: PROBLEMS.length,
  });
});
