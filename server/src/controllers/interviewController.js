import Interview from '../models/Interview.js';
import {
  generateInterviewQuestionSet,
  evaluateInterviewAnswer,
  analyzeVoiceTranscript,
  completeInterviewAnalysis,
  generateWelcomeSpeech,
  generateTransitionSpeech,
} from '../services/aiService.js';
import { updateInterviewStats } from '../services/achievementService.js';
import { INTERVIEW_QUESTION_COUNT, getRoleById } from '../constants/interviewRoles.js';
import { marksToPercent, sumInterviewMarks } from '../utils/interviewScoring.js';
import { asyncHandler, sendSuccess, AppError } from '../utils/helpers.js';

function evalContext(interview) {
  return {
    targetRole: interview.targetRole,
    skills: interview.skills || [],
    type: interview.type,
  };
}

function getCurrentIndex(interview) {
  return interview.questions.findIndex((q) => !q.answer);
}

function buildProgress(interview) {
  const answered = interview.questions.filter((q) => q.answer).length;
  const total = interview.totalQuestions || INTERVIEW_QUESTION_COUNT;
  return { answered, total, current: Math.min(answered + 1, total) };
}

export const getInterviewRoles = asyncHandler(async (_req, res) => {
  const { INTERVIEW_ROLES } = await import('../constants/interviewRoles.js');
  sendSuccess(res, INTERVIEW_ROLES);
});

export const startInterview = asyncHandler(async (req, res) => {
  const { type, difficulty, mode, targetRole, targetRoleId, skills } = req.body;
  if (!type) throw new AppError('Interview type is required', 400);

  const roleMeta = targetRoleId ? getRoleById(targetRoleId) : null;
  const roleLabel = targetRole?.trim() || roleMeta?.label || 'Software Engineer';
  const selectedSkills = Array.isArray(skills) && skills.length
    ? skills
    : (roleMeta?.skills?.slice(0, 5) || []);

  const questionTexts = await generateInterviewQuestionSet(
    type,
    difficulty || 'medium',
    roleLabel,
    selectedSkills,
    INTERVIEW_QUESTION_COUNT
  );

  const interview = await Interview.create({
    userId: req.user._id,
    type,
    difficulty: difficulty || 'medium',
    mode: mode || 'text',
    targetRole: roleLabel,
    skills: selectedSkills,
    totalQuestions: INTERVIEW_QUESTION_COUNT,
    questions: questionTexts.map((item) => ({
      question: typeof item === 'string' ? item : item.question,
      skillArea: typeof item === 'object' ? item.skillArea : '',
    })),
  });

  sendSuccess(res, interview, 'Interview started — 10 questions ready', 201);
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!interview) throw new AppError('Interview not found', 404);
  if (interview.status !== 'in_progress') throw new AppError('Interview already completed', 400);

  const currentIndex = getCurrentIndex(interview);
  if (currentIndex === -1) throw new AppError('All questions answered', 400);

  const currentQ = interview.questions[currentIndex];
  const evaluation = await evaluateInterviewAnswer(
    currentQ.question,
    answer,
    interview.type,
    { ...evalContext(interview), skillArea: currentQ.skillArea }
  );

  interview.questions[currentIndex].answer = answer;
  interview.questions[currentIndex].feedback = evaluation.feedback;
  interview.questions[currentIndex].score = evaluation.score;
  interview.questions[currentIndex].issue = evaluation.issue;
  interview.questions[currentIndex].suggestion = evaluation.suggestion;

  await interview.save();

  const progress = buildProgress(interview);
  const allComplete = progress.answered >= (interview.totalQuestions || INTERVIEW_QUESTION_COUNT);
  const nextQuestion = allComplete ? null : interview.questions[currentIndex + 1]?.question;

  sendSuccess(res, {
    interview,
    evaluation,
    allComplete,
    nextQuestion,
    progress,
  });
});

export const voiceTurn = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!interview) throw new AppError('Interview not found', 404);
  if (interview.status !== 'in_progress') throw new AppError('Interview already completed', 400);

  const currentIndex = getCurrentIndex(interview);
  if (currentIndex === -1) throw new AppError('All questions answered', 400);

  const currentQ = interview.questions[currentIndex];
  const evaluation = await evaluateInterviewAnswer(
    currentQ.question,
    answer,
    interview.type,
    { ...evalContext(interview), skillArea: currentQ.skillArea }
  );

  interview.questions[currentIndex].answer = answer;
  interview.questions[currentIndex].feedback = evaluation.feedback;
  interview.questions[currentIndex].score = evaluation.score;
  interview.questions[currentIndex].issue = evaluation.issue;
  interview.questions[currentIndex].suggestion = evaluation.suggestion;

  await interview.save();

  const progress = buildProgress(interview);
  const total = interview.totalQuestions || INTERVIEW_QUESTION_COUNT;
  const allComplete = progress.answered >= total;
  const nextQuestion = allComplete ? null : interview.questions[currentIndex + 1]?.question;

  const spokenReply = generateTransitionSpeech(
    evaluation,
    nextQuestion,
    progress.current,
    total
  );

  sendSuccess(res, {
    interview,
    evaluation,
    allComplete,
    nextQuestion,
    progress,
    spokenReply,
  });
});

export const getWelcome = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!interview) throw new AppError('Interview not found', 404);

  const firstQuestion = interview.questions[0]?.question || '';
  const welcomeSpeech = generateWelcomeSpeech(interview.type, firstQuestion, interview.targetRole);
  const total = interview.totalQuestions || INTERVIEW_QUESTION_COUNT;

  sendSuccess(res, { welcomeSpeech, question: firstQuestion, totalQuestions: total });
});

export const getFollowUp = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!interview) throw new AppError('Interview not found', 404);

  const currentIndex = getCurrentIndex(interview);
  if (currentIndex === -1) throw new AppError('All questions answered', 400);

  sendSuccess(res, {
    interview,
    question: interview.questions[currentIndex].question,
    progress: buildProgress(interview),
  });
});

export const completeInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!interview) throw new AppError('Interview not found', 404);

  const total = interview.totalQuestions || INTERVIEW_QUESTION_COUNT;
  const answered = interview.questions.filter((q) => q.answer).length;
  if (answered < total) {
    throw new AppError(`Complete all ${total} questions before viewing results (${answered}/${total} done)`, 400);
  }

  const analysis = await completeInterviewAnalysis(interview.questions, evalContext(interview));
  interview.analysis = {
    ...analysis,
    fillerWords: interview.analysis?.fillerWords || [],
  };
  interview.status = 'completed';
  interview.completedAt = new Date();
  interview.duration = req.body.duration || 0;
  await interview.save();

  const { marksObtained, totalMarks } = sumInterviewMarks(interview.questions);
  const percentScore = marksToPercent(marksObtained, totalMarks);
  await updateInterviewStats(req.user._id, percentScore);
  sendSuccess(res, interview, 'Interview completed');
});

export const analyzeVoice = asyncHandler(async (req, res) => {
  const { transcript, interviewId } = req.body;
  if (!transcript) throw new AppError('Transcript required', 400);

  const voiceAnalysis = await analyzeVoiceTranscript(transcript);

  if (interviewId) {
    const interview = await Interview.findOne({ _id: interviewId, userId: req.user._id });
    if (interview) {
      interview.analysis = { ...interview.analysis, ...voiceAnalysis };
      interview.transcript = req.body.segments || [];
      await interview.save();
    }
  }

  sendSuccess(res, voiceAnalysis);
});

export const getInterviews = asyncHandler(async (req, res) => {
  const interviews = await Interview.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  sendSuccess(res, interviews);
});

export const getInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, userId: req.user._id });
  if (!interview) throw new AppError('Interview not found', 404);
  sendSuccess(res, interview);
});
