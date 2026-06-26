import LearningRoadmap from '../models/LearningRoadmap.js';
import Resume from '../models/Resume.js';
import { generateRoadmap } from '../services/aiService.js';
import { addXP } from '../services/achievementService.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

export const generate = asyncHandler(async (req, res) => {
  const { targetRole, resumeId } = req.body;
  if (!targetRole) throw new AppError('Target role is required', 400);

  let skills = [];
  let missingSkills = [];
  if (resumeId) {
    const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    if (resume) {
      skills = resume.parsed.skills || [];
      missingSkills = resume.analysis.missingKeywords || [];
    }
  }

  const result = await generateRoadmap(targetRole, skills, missingSkills);

  const roadmap = await LearningRoadmap.create({
    userId: req.user._id,
    title: result.title || `${targetRole} Roadmap`,
    targetRole,
    duration: result.duration || '12 weeks',
    phases: result.phases || [],
  });

  await addXP(req.user._id, 40);
  sendSuccess(res, roadmap, 'Roadmap generated', 201);
});

export const getRoadmaps = asyncHandler(async (req, res) => {
  const roadmaps = await LearningRoadmap.find({ userId: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, roadmaps);
});

export const getRoadmap = asyncHandler(async (req, res) => {
  const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, userId: req.user._id });
  if (!roadmap) throw new AppError('Roadmap not found', 404);
  sendSuccess(res, roadmap);
});

export const updateRoadmapProgress = asyncHandler(async (req, res) => {
  const roadmap = await LearningRoadmap.findOne({ _id: req.params.id, userId: req.user._id });
  if (!roadmap) throw new AppError('Roadmap not found', 404);

  if (req.body.phases) roadmap.phases = req.body.phases;
  if (req.body.progress !== undefined) roadmap.progress = req.body.progress;

  if (req.body.topicComplete) {
    const { phaseIndex, topicIndex } = req.body.topicComplete;
    if (roadmap.phases[phaseIndex]?.topics[topicIndex]) {
      roadmap.phases[phaseIndex].topics[topicIndex].completed = true;
      const totalTopics = roadmap.phases.reduce((acc, p) => acc + p.topics.length, 0);
      const completed = roadmap.phases.reduce(
        (acc, p) => acc + p.topics.filter((t) => t.completed).length,
        0
      );
      roadmap.progress = totalTopics ? Math.round((completed / totalTopics) * 100) : 0;
    }
  }

  await roadmap.save();
  await addXP(req.user._id, 10);
  sendSuccess(res, roadmap, 'Progress updated');
});
