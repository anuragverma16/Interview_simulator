import mongoose from 'mongoose';

const skillGapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    targetRole: { type: String, required: true },
    jobDescription: { type: String, default: '' },
    matchedSkills: [String],
    missingSkills: [{ skill: String, priority: String, resources: [String] }],
    matchPercentage: { type: Number, default: 0 },
    roadmap: [{ week: Number, topics: [String], resources: [String], completed: { type: Boolean, default: false } }],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('SkillGap', skillGapSchema);
