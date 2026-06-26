import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AlertCircle, Award, CheckCircle2, Sparkles, Star, TrendingUp, XCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { Interview } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  interview: Interview;
  onRestart: () => void;
}

export default function InterviewResults({ interview, onRestart }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const a = interview.analysis;

  const totalMarks = a.totalMarks ?? interview.totalQuestions ?? 10;
  const marksObtained = a.marksObtained ?? a.overallScore ?? 0;
  const mistakes = a.mistakes || [];
  const bestAnswers = a.bestAnswers || [];
  const recommendations = a.improvements || [];

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.ir-hero', { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out' });
      gsap.from('.ir-marks-ring', { scale: 0, duration: 0.8, delay: 0.2, ease: 'back.out(1.7)' });
      gsap.from('.ir-report-section', {
        opacity: 0,
        y: 28,
        duration: 0.55,
        stagger: 0.1,
        delay: 0.4,
        ease: 'power2.out',
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const verdict =
    marksObtained >= 8 ? 'Excellent' : marksObtained >= 6 ? 'Good' : marksObtained >= 4 ? 'Fair' : 'Needs practice';

  return (
    <div ref={rootRef} className="space-y-6">
      {/* Marks box — main result */}
      <Card glow className="!p-8 ir-hero border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/5">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="ir-marks-ring relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full border-4 border-purple-500/40 bg-purple-500/10">
            <div className="text-center">
              <p className="text-4xl font-bold neon-text">{marksObtained}</p>
              <p className="text-sm text-white/50">/ {totalMarks}</p>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-400/80 mb-1">Final result</p>
            <h2 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
              {marksObtained} / {totalMarks} <span className="neon-text">Marks</span>
            </h2>
            <p className="text-lg text-white/60 mt-1">{verdict} — {interview.targetRole}</p>
            <p className="text-sm text-white/45 mt-3 leading-relaxed max-w-lg">
              {a.summary || `Each question was worth 1 mark. You earned ${marksObtained} out of ${totalMarks}.`}
            </p>
          </div>
        </div>

        {/* Per-question marks strip */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 pt-6 border-t border-white/10">
          {interview.questions.map((q, i) => {
            const earned = q.score === 1;
            return (
              <div
                key={i}
                title={q.question}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-3 py-2 min-w-[52px] border',
                  earned
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-red-500/10 border-red-500/25 text-red-300'
                )}
              >
                <span className="text-[10px] text-white/40">Q{i + 1}</span>
                {earned ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span className="text-xs font-bold">{earned ? '1' : '0'}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="!p-6 ir-report-section border-cyan-500/25 bg-gradient-to-br from-cyan-500/8 to-transparent">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            Recommendations
          </h3>
          <p className="text-xs text-white/40 mb-4">What to improve before your next interview</p>
          <ol className="space-y-3">
            {recommendations.map((item, i) => (
              <li key={i} className="text-sm text-white/80 flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Best answers */}
      {bestAnswers.length > 0 && (
        <Card className="!p-6 ir-report-section border-emerald-500/25">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-emerald-400" />
            What you did best (+1 mark each)
          </h3>
          <div className="space-y-3">
            {bestAnswers.map((b, i) => (
              <div key={i} className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  {b.skillArea && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">{b.skillArea}</span>
                  )}
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400/40 ml-auto" />
                  <span className="text-xs font-bold text-emerald-400">+1 mark</span>
                </div>
                <p className="text-sm font-medium text-white/90">{b.question}</p>
                <p className="text-xs text-emerald-200/80 mt-2">{b.highlight}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mistakes */}
      {mistakes.length > 0 && (
        <Card className="!p-6 ir-report-section border-amber-500/25">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            Mistakes (0 marks)
          </h3>
          <div className="space-y-3">
            {mistakes.map((m, i) => (
              <div key={i} className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  {m.skillArea && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{m.skillArea}</span>
                  )}
                  <span className="text-xs font-bold text-red-400 ml-auto">0 marks</span>
                </div>
                <p className="text-sm font-medium text-white/90">{m.question}</p>
                {m.yourAnswer && (
                  <p className="text-xs text-white/40 mt-1 line-clamp-2 italic">Your answer: {m.yourAnswer}</p>
                )}
                <p className="text-sm text-red-300/90 mt-2"><span className="font-semibold">Mistake:</span> {m.issue}</p>
                <p className="text-sm text-cyan-200/90 mt-1"><span className="font-semibold">Fix:</span> {m.suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="text-center ir-report-section pb-4">
        <Button size="lg" onClick={onRestart}>
          <Sparkles className="h-5 w-5" /> Start New Interview
        </Button>
      </div>
    </div>
  );
}
