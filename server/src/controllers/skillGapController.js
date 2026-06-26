import SkillGap from '../models/SkillGap.js';
import Resume from '../models/Resume.js';
import { analyzeSkillGap } from '../services/aiService.js';
import { addXP } from '../services/achievementService.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

export const analyzeGap = asyncHandler(async (req, res) => {
  const { targetRole, jobDescription, resumeId } = req.body;
  if (!targetRole) throw new AppError('Target role is required', 400);

  let skills = [];
  if (resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (resume) skills = resume.parsed.skills || [];
  }
  if (req.body.skills?.length) skills = req.body.skills;

  const result = await analyzeSkillGap(skills, targetRole, jobDescription || '');

  const skillGap = await SkillGap.create({
    userId: req.user._id,
    resumeId: resumeId || undefined,
    targetRole,
    jobDescription: jobDescription || '',
    matchedSkills: result.matchedSkills || [],
    missingSkills: result.missingSkills || [],
    matchPercentage: result.matchPercentage || 0,
    roadmap: result.roadmap || [],
  });

  await addXP(req.user._id, 30);
  sendSuccess(res, skillGap, 'Skill gap analysis complete', 201);
});

export const getSkillGaps = asyncHandler(async (req, res) => {
  const gaps = await SkillGap.find({ userId: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, gaps);
});

export const getSkillGap = asyncHandler(async (req, res) => {
  const gap = await SkillGap.findOne({ _id: req.params.id, userId: req.user._id });
  if (!gap) throw new AppError('Analysis not found', 404);
  sendSuccess(res, gap);
});

export const updateProgress = asyncHandler(async (req, res) => {
  const gap = await SkillGap.findOne({ _id: req.params.id, userId: req.user._id });
  if (!gap) throw new AppError('Analysis not found', 404);

  if (req.body.progress !== undefined) gap.progress = req.body.progress;
  if (req.body.roadmap) gap.roadmap = req.body.roadmap;
  await gap.save();
  sendSuccess(res, gap, 'Progress updated');
});
