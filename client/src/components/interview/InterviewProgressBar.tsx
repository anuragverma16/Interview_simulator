import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Props {
  current: number;
  total: number;
  className?: string;
}

export default function InterviewProgressBar({ current, total, className = '' }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const pct = Math.min(100, Math.round((current / total) * 100));

  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${pct}%`, duration: 0.6, ease: 'power2.out' });
    }
    if (labelRef.current) {
      gsap.fromTo(labelRef.current, { opacity: 0.4, y: 4 }, { opacity: 1, y: 0, duration: 0.35 });
    }
  }, [current, pct]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <p ref={labelRef} className="text-xs font-semibold uppercase tracking-wider text-purple-300/80">
          Question {current} of {total}
        </p>
        <span className="text-xs text-white/40">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          ref={barRef}
          className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400"
          style={{ width: '0%' }}
        />
      </div>
    </div>
  );
}
