import { cn } from '../../utils/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ children, className, hover = true, glow }: CardProps) {
  return (
    <div
      className={cn(
        'glass rounded-2xl p-6',
        hover && 'glass-hover',
        glow && 'shadow-lg shadow-purple-500/10',
        className
      )}
    >
      {children}
    </div>
  );
}
