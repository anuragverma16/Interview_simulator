import CareerPrediction from '../models/CareerPrediction.js';
import Resume from '../models/Resume.js';
import { predictCareer } from '../services/aiService.js';
import { addXP } from '../services/achievementService.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

export const predict = asyncHandler(async (req, res) => {
  const { resumeId, targetRole } = req.body;

  let resumeData = {};
  if (resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (resume) resumeData = resume.parsed;
  }

  const result = await predictCareer(resumeData, targetRole || req.user.profile?.targetRole);

  const prediction = await CareerPrediction.create({
    userId: req.user._id,
    resumeId: resumeId || undefined,
    placementReadiness: result.placementReadiness || 0,
    careerMatches: result.careerMatches || [],
    strengths: result.strengths || [],
    weaknesses: result.weaknesses || [],
    recommendations: result.recommendations || [],
    marketInsights: result.marketInsights || '',
  });

  await addXP(req.user._id, 35);
  sendSuccess(res, prediction, 'Career prediction generated', 201);
});

export const getPredictions = asyncHandler(async (req, res) => {
  const predictions = await CareerPrediction.find({ userId: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, predictions);
});

export const getPrediction = asyncHandler(async (req, res) => {
  const prediction = await CareerPrediction.findOne({ _id: req.params.id, userId: req.user._id });
  if (!prediction) throw new AppError('Prediction not found', 404);
  sendSuccess(res, prediction);
});
