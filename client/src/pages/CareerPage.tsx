import { useState, useEffect } from 'react';
import { TrendingUp, Target, AlertTriangle, Lightbulb } from 'lucide-react';
import { careerApi, resumeApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar from '../components/ui/ProgressBar';
import FadeInUp from '../components/animations/FadeInUp';
import type { CareerPrediction, Resume } from '../types';
import toast from 'react-hot-toast';

export default function CareerPage() {
  const [targetRole, setTargetRole] = useState('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState('');
  const [prediction, setPrediction] = useState<CareerPrediction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resumeApi.getAll().then(({ data }) => setResumes(data.data)).catch(() => {});
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const { data } = await careerApi.predict({ targetRole: targetRole || undefined, resumeId: resumeId || undefined });
      setPrediction(data.data);
      toast.success('Career prediction generated');
    } catch {
      toast.error('Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <FadeInUp>
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
          Career <span className="neon-text">Prediction</span>
        </h1>
        <p className="text-white/50 mt-1">AI-powered career intelligence and placement readiness</p>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="Target Role (optional)" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer" />
            {resumes.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-white/70">Resume</label>
                <select value={resumeId} onChange={(e) => setResumeId(e.target.value)} className="w-full rounded-xl glass px-4 py-3 text-white outline-none">
                  <option value="">Select resume</option>
                  {resumes.map((r) => <option key={r._id} value={r._id}>{r.fileName}</option>)}
                </select>
              </div>
            )}
          </div>
          <Button onClick={handlePredict} loading={loading}>
            <TrendingUp className="h-4 w-4" /> Generate Prediction
          </Button>
        </Card>
      </FadeInUp>

      {prediction && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeInUp delay={0.2} className="md:col-span-1">
              <Card glow className="flex flex-col items-center">
                <ProgressRing score={prediction.placementReadiness} label="Placement Readiness" size={160} />
              </Card>
            </FadeInUp>
            <FadeInUp delay={0.3} className="md:col-span-2">
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" /> Career Matches
                </h3>
                <div className="space-y-4">
                  {prediction.careerMatches.map((m) => (
                    <div key={m.role} className="rounded-xl bg-white/5 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{m.role}</span>
                        <span className="text-lg font-bold neon-text">{m.matchScore}%</span>
                      </div>
                      <ProgressBar value={m.matchScore} />
                      <p className="text-sm text-white/50 mt-2">{m.reasoning}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </FadeInUp>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeInUp delay={0.4}>
              <Card>
                <h3 className="font-semibold mb-4">Strengths</h3>
                <ul className="space-y-2">
                  {prediction.strengths.map((s) => (
                    <li key={s} className="text-sm text-emerald-300 flex items-center gap-2">✓ {s}</li>
                  ))}
                </ul>
              </Card>
            </FadeInUp>
            <FadeInUp delay={0.5}>
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" /> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {prediction.weaknesses.map((w) => (
                    <li key={w} className="text-sm text-amber-300 flex items-center gap-2">△ {w}</li>
                  ))}
                </ul>
              </Card>
            </FadeInUp>
          </div>

          <FadeInUp delay={0.6}>
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" /> Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prediction.recommendations.map((r, i) => (
                  <div key={i} className="rounded-xl bg-white/5 p-4 text-sm text-white/70">{r}</div>
                ))}
              </div>
              {prediction.marketInsights && (
                <div className="mt-4 rounded-xl bg-purple-500/10 border border-purple-500/20 p-4">
                  <p className="text-sm text-purple-300">📊 {prediction.marketInsights}</p>
                </div>
              )}
            </Card>
          </FadeInUp>
        </>
      )}
    </div>
  );
}
