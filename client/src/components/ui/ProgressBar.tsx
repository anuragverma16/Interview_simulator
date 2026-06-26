import { cn } from '../../utils/cn';

interface Props {
  value: number;
  label?: string;
  className?: string;
}

export default function ProgressBar({ value, label, className }: Props) {
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-white/70">{label}</span>
          <span className="text-white/50">{value}%</span>
        </div>
      )}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700"
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}
