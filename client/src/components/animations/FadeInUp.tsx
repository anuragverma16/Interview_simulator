import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function FadeInUp({ children, className = '', delay = 0 }: Props) {
  const { reduceMotion } = useTheme();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
