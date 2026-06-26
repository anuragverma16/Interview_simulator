import mongoose from 'mongoose';

const codingSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    language: { type: String, enum: ['javascript', 'python', 'java', 'cpp', 'c'], required: true },
    mode: { type: String, enum: ['practice', 'streak', 'catchup'], default: 'practice' },
    catchUpDate: { type: String, default: '' },
    problemSlug: { type: String, default: '' },
    problem: {
      slug: String,
      leetcodeId: Number,
      title: String,
      description: String,
      difficulty: String,
      tags: [String],
      examples: [{ input: String, output: String, explanation: String }],
      constraints: [String],
      functionName: String,
      testCases: [{ input: String, expected: String }],
    },
    code: { type: String, default: '' },
    runResults: {
      passed: Number,
      total: Number,
      allPassed: Boolean,
      results: [{ index: Number, passed: Boolean, input: String, expected: String, actual: String, error: String, hidden: Boolean }],
    },
    feedback: {
      correctness: Number,
      efficiency: String,
      timeComplexity: String,
      spaceComplexity: String,
      suggestions: [String],
      score: Number,
    },
    status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress' },
    submittedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('CodingSession', codingSessionSchema);
