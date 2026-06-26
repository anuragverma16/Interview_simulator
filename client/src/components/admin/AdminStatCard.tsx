import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
  label: string;
  value: number;
  icon: LucideIcon;
  accent: string;
  bg: string;
  suffix?: string;
  trend?: string;
}

export default function AdminStatCard({ label, value, icon: Icon, accent, bg, suffix = '', trend }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const from = 0;
    const to = value;
    let frame: number;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - p) ** 3;
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <div className="admin-card admin-card-glow p-5 h-full relative overflow-hidden group">
      <div className={cn('absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500', bg)} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">{label}</p>
          <p className="text-3xl font-bold mt-2 tabular-nums tracking-tight">
            {display.toLocaleString()}{suffix}
          </p>
          {trend && <p className="text-[11px] text-amber-400/80 mt-1.5">{trend}</p>}
        </div>
        <div className={cn('rounded-xl bg-gradient-to-br p-2.5 shadow-lg ring-1 ring-white/5', bg)}>
          <Icon className={cn('h-5 w-5', accent)} />
        </div>
      </div>
    </div>
  );
}
