import { useState } from 'react';
import { Target, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { skillGapApi, resumeApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input, { Textarea, Select } from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import FadeInUp from '../components/animations/FadeInUp';
import type { SkillGap, Resume } from '../types';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

export default function SkillGapPage() {
  const [targetRole, setTargetRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [resumeId, setResumeId] = useState('');
  const [result, setResult] = useState<SkillGap | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    resumeApi.getAll().then(({ data }) => setResumes(data.data)).catch(() => {});
  }, []);

  const handleAnalyze = async () => {
    if (!targetRole) {
      toast.error('Enter a target role');
      return;
    }
    setLoading(true);
    try {
      const { data } = await skillGapApi.analyze({ targetRole, jobDescription, resumeId: resumeId || undefined });
      setResult(data.data);
      toast.success('Skill gap analysis complete');
    } catch {
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = (p: string) => {
    if (p === 'high') return 'text-red-400 bg-red-500/20 border-red-500/30';
    if (p === 'medium') return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
  };

  return (
    <div className="space-y-8">
      <FadeInUp>
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
          Skill Gap <span className="neon-text">Analyzer</span>
        </h1>
        <p className="text-white/50 mt-1">Compare your skills against any job role</p>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Input label="Target Role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Senior Full Stack Developer" />
            {resumes.length > 0 && (
              <Select
                label="Resume (optional)"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
              >
                <option value="">Select resume</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>{r.fileName}</option>
                ))}
              </Select>
            )}
          </div>
          <Textarea label="Job Description (optional)" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the job description here..." />
          <Button onClick={handleAnalyze} loading={loading} className="mt-4">
            <Target className="h-4 w-4" /> Analyze Skill Gap
          </Button>
        </Card>
      </FadeInUp>

      {result && (
        <>
          <FadeInUp delay={0.2}>
            <Card glow>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Match Score for {result.targetRole}</h3>
                <span className="text-3xl font-bold neon-text">{result.matchPercentage}%</span>
              </div>
              <ProgressBar value={result.matchPercentage} />
            </Card>
          </FadeInUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeInUp delay={0.3}>
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" /> Matched Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills.map((s) => (
                    <span key={s} className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-sm text-emerald-300">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </Card>
            </FadeInUp>
            <FadeInUp delay={0.4}>
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-400" /> Missing Skills
                </h3>
                <div className="space-y-3">
                  {result.missingSkills.map((s) => (
                    <div key={s.skill} className="rounded-xl bg-white/5 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{s.skill}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor(s.priority)}`}>
                          {s.priority}
                        </span>
                      </div>
                      {s.resources?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.resources.map((r) => (
                            <span key={r} className="text-xs text-white/40 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" /> {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </FadeInUp>
          </div>

          {result.roadmap?.length > 0 && (
            <FadeInUp delay={0.5}>
              <Card>
                <h3 className="font-semibold mb-4">Learning Roadmap</h3>
                <div className="space-y-4">
                  {result.roadmap.map((week) => (
                    <div key={week.week} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/20 border border-purple-500/30 text-sm font-bold">
                          W{week.week}
                        </div>
                        <div className="w-px flex-1 bg-white/10 mt-2" />
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex flex-wrap gap-2">
                          {week.topics.map((t) => (
                            <span key={t} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </FadeInUp>
          )}
        </>
      )}
    </div>
  );
}
