import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

type VoiceState = 'idle' | 'speaking' | 'listening' | 'thinking';

interface VoiceOrbProps {
  state: VoiceState;
  name?: string;
  role?: string;
}

export default function VoiceOrb({ state, name = 'Alex', role = 'AI Interviewer' }: VoiceOrbProps) {
  const stateLabels: Record<VoiceState, string> = {
    idle: 'Ready to talk',
    speaking: 'Speaking...',
    listening: 'Listening to you...',
    thinking: 'Thinking...',
  };

  const stateColors: Record<VoiceState, string> = {
    idle: 'from-cyan-500/30 to-purple-500/30',
    speaking: 'from-purple-500/50 to-pink-500/50',
    listening: 'from-emerald-500/50 to-cyan-500/50',
    thinking: 'from-amber-500/40 to-orange-500/40',
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {/* Outer pulse rings */}
        {(state === 'speaking' || state === 'listening') &&
          [1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className={cn(
                'absolute inset-0 rounded-full border-2',
                state === 'speaking' ? 'border-purple-400/40' : 'border-emerald-400/40'
              )}
              animate={{ scale: [1, 1.4 + i * 0.15], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}

        {/* Main orb */}
        <motion.div
          animate={{
            scale: state === 'speaking' ? [1, 1.06, 1] : state === 'listening' ? [1, 1.04, 1] : 1,
          }}
          transition={{ duration: state === 'idle' ? 0.3 : 0.8, repeat: state === 'idle' ? 0 : Infinity }}
          className={cn(
            'relative h-36 w-36 rounded-full bg-gradient-to-br flex items-center justify-center',
            stateColors[state],
            'border-2 border-white/20 shadow-2xl shadow-purple-500/20'
          )}
        >
          <div className="absolute inset-3 rounded-full bg-[#0a0a0f]/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-4xl font-bold neon-text">{name.charAt(0)}</span>
          </div>

          {/* Waveform inside orb when active */}
          {(state === 'speaking' || state === 'listening') && (
            <div className="absolute bottom-6 flex items-end gap-1 h-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={cn('w-1 rounded-full', state === 'speaking' ? 'bg-purple-400' : 'bg-emerald-400')}
                  animate={{ height: [8, 24 + Math.random() * 12, 8] }}
                  transition={{ duration: 0.4 + i * 0.1, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.p
        key={state}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-lg font-semibold"
      >
        {name}
      </motion.p>
      <p className="text-sm text-white/50">{role}</p>
      <motion.p
        key={state + '-status'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'mt-2 text-sm font-medium px-4 py-1.5 rounded-full',
          state === 'speaking' && 'text-purple-300 bg-purple-500/20',
          state === 'listening' && 'text-emerald-300 bg-emerald-500/20',
          state === 'thinking' && 'text-amber-300 bg-amber-500/20',
          state === 'idle' && 'text-white/50 bg-white/5'
        )}
      >
        {stateLabels[state]}
      </motion.p>
    </div>
  );
}
