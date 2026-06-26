import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import type { LucideIcon } from 'lucide-react';

interface SelectOptionProps {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  selected: boolean;
  onClick: () => void;
  color?: string;
  index?: number;
}

export default function SelectOption({
  label,
  description,
  icon: Icon,
  selected,
  onClick,
  color = 'from-purple-500 to-cyan-500',
  index = 0,
}: SelectOptionProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-300',
        'bg-[#14141f]/90 backdrop-blur-sm min-h-[88px] flex flex-col justify-center',
        selected
          ? 'border-purple-400/80 shadow-lg shadow-purple-500/25 bg-purple-500/15'
          : 'border-white/20 hover:border-white/40 hover:bg-white/10'
      )}
    >
      {selected && (
        <motion.div
          layoutId="select-glow"
          className={cn('absolute inset-0 rounded-2xl opacity-20 bg-gradient-to-br', color)}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      <div className="relative flex items-center gap-3">
        {Icon && (
          <div
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white',
              color,
              selected ? 'shadow-lg' : 'opacity-80'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className={cn('font-semibold text-sm md:text-base', selected ? 'text-white' : 'text-white/90')}>
            {label}
          </p>
          {description && (
            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
        <div
          className={cn(
            'h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-all',
            selected ? 'border-purple-400 bg-purple-500' : 'border-white/30'
          )}
        >
          {selected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
    </motion.button>
  );
}

interface SelectGroupProps {
  label: string;
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
}

export function SelectGroup({ label, children, columns = 3 }: SelectGroupProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">{label}</h3>
      <div className={cn('grid gap-3', gridCols[columns])}>{children}</div>
    </div>
  );
}
