import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    rawText: { type: String, default: '' },
    parsed: {
      skills: [String],
      projects: [{ name: String, description: String, technologies: [String] }],
      education: [{ degree: String, institution: String, year: String }],
      experience: [{ company: String, role: String, duration: String, description: String }],
      contact: { email: String, phone: String, linkedin: String },
    },
    analysis: {
      atsScore: { type: Number, default: 0 },
      resumeScore: { type: Number, default: 0 },
      missingKeywords: [String],
      suggestions: [String],
      strengths: [String],
      weaknesses: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
