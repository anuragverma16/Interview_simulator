import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['hr', 'technical', 'behavioral', 'faang', 'startup'],
      required: true,
    },
    targetRole: { type: String, default: 'Software Engineer' },
    skills: [{ type: String }],
    totalQuestions: { type: Number, default: 10 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'adaptive'], default: 'medium' },
    mode: { type: String, enum: ['text', 'voice'], default: 'text' },
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
    questions: [
      {
        question: String,
        answer: String,
        feedback: String,
        score: Number,
        issue: String,
        suggestion: String,
        skillArea: String,
        followUps: [{ question: String, answer: String, feedback: String }],
      },
    ],
    transcript: [{ speaker: String, text: String, timestamp: Date, confidence: Number }],
    analysis: {
      overallScore: { type: Number, default: 0 },
      marksObtained: { type: Number, default: 0 },
      totalMarks: { type: Number, default: 10 },
      communicationScore: { type: Number, default: 0 },
      technicalScore: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
      fillerWords: [{ word: String, count: Number }],
      strengths: [String],
      improvements: [String],
      mistakes: [{
        question: String,
        yourAnswer: String,
        issue: String,
        suggestion: String,
        score: Number,
        skillArea: String,
      }],
      bestAnswers: [{
        question: String,
        yourAnswer: String,
        highlight: String,
        score: Number,
        skillArea: String,
      }],
      summary: String,
    },
    duration: { type: Number, default: 0 },
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);
