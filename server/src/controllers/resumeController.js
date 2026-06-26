import fs from 'fs';
import pdfParse from 'pdf-parse';
import Resume from '../models/Resume.js';
import { analyzeResume } from '../services/aiService.js';
import { addXP } from '../services/achievementService.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

export const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const buffer = fs.readFileSync(req.file.path);
  let rawText = '';
  try {
    const data = await pdfParse(buffer);
    rawText = data.text;
  } catch {
    rawText = 'Could not parse PDF. Please ensure it contains selectable text.';
  }

  const analysis = await analyzeResume(rawText);

  const resume = await Resume.create({
    userId: req.user._id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    rawText,
    parsed: {
      skills: analysis.skills || [],
      projects: analysis.projects || [],
      education: analysis.education || [],
      experience: analysis.experience || [],
      contact: analysis.contact || {},
    },
    analysis: {
      atsScore: analysis.atsScore || 0,
      resumeScore: analysis.resumeScore || 0,
      missingKeywords: analysis.missingKeywords || [],
      suggestions: analysis.suggestions || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
    },
  });

  try {
    await addXP(req.user._id, 25);
  } catch (err) {
    console.warn('Achievement sync after resume upload:', err.message);
  }

  sendSuccess(res, resume, 'Resume analyzed successfully', 201);
});

export const getResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
  sendSuccess(res, resumes);
});

export const getResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);
  sendSuccess(res, resume);
});

export const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);

  if (fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
  await resume.deleteOne();
  sendSuccess(res, null, 'Resume deleted');
});

export const reanalyzeResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, userId: req.user._id });
  if (!resume) throw new AppError('Resume not found', 404);

  const analysis = await analyzeResume(resume.rawText);
  resume.parsed = {
    skills: analysis.skills || [],
    projects: analysis.projects || [],
    education: analysis.education || [],
    experience: analysis.experience || [],
    contact: analysis.contact || {},
  };
  resume.analysis = {
    atsScore: analysis.atsScore || 0,
    resumeScore: analysis.resumeScore || 0,
    missingKeywords: analysis.missingKeywords || [],
    suggestions: analysis.suggestions || [],
    strengths: analysis.strengths || [],
    weaknesses: analysis.weaknesses || [],
  };
  await resume.save();
  sendSuccess(res, resume, 'Resume re-analyzed');
});
