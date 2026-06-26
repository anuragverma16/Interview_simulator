import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { reduceMotion } = useTheme();

  if (reduceMotion) {
    return <div key={location.pathname}>{children}</div>;
  }

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
