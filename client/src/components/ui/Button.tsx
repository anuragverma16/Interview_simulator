import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'voice';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function Button({
  children,
  className,
  variant = 'primary',
  loading,
  size = 'md',
  disabled,
  fullWidth,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] border border-white/10',
    secondary:
      'bg-[#1a1a27] text-white border-2 border-white/25 hover:border-purple-400/50 hover:bg-purple-500/10 shadow-md hover:scale-[1.02] active:scale-[0.98]',
    ghost:
      'bg-white/5 text-white/90 border-2 border-white/15 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98]',
    danger:
      'bg-red-500/20 text-red-300 border-2 border-red-500/40 hover:bg-red-500/30 hover:border-red-400/60 hover:scale-[1.02] active:scale-[0.98]',
    success:
      'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40 hover:bg-emerald-500/30 hover:border-emerald-400/60 hover:scale-[1.02] active:scale-[0.98]',
    voice:
      'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] border border-white/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
