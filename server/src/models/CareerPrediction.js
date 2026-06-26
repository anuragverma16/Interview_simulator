import mongoose from 'mongoose';

const careerPredictionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    placementReadiness: { type: Number, default: 0 },
    careerMatches: [{ role: String, matchScore: Number, reasoning: String }],
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    marketInsights: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('CareerPrediction', careerPredictionSchema);
