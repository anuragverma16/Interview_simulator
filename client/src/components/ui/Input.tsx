import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-white/70">{label}</label>}
      <input
        className={cn(
          'w-full rounded-xl glass px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-white/70">{label}</label>}
      <textarea
        className={cn(
          'w-full rounded-xl glass px-4 py-3 text-white placeholder:text-white/30 outline-none transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 min-h-[120px] resize-y',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const selectClassName =
  'w-full rounded-xl border border-white/15 bg-[#12121a] px-4 py-3 text-sm text-white outline-none transition-all focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 cursor-pointer appearance-none';

export function Select({ label, error, className, children, ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-white/70">{label}</label>}
      <select
        className={cn(selectClassName, error && 'border-red-500/50', className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
