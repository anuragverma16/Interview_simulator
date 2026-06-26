import mongoose from 'mongoose';

const learningRoadmapSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    targetRole: { type: String, required: true },
    duration: { type: String, default: '12 weeks' },
    phases: [
      {
        phase: Number,
        title: String,
        weeks: Number,
        topics: [{ name: String, completed: { type: Boolean, default: false }, resources: [String] }],
        milestones: [String],
      },
    ],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('LearningRoadmap', learningRoadmapSchema);
