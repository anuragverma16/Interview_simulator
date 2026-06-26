import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface TestResult {
  index: number;
  passed: boolean;
  input: string;
  expected: string;
  actual: string | null;
  error?: string;
  hidden?: boolean;
}

interface Props {
  results: TestResult[];
  passed: number;
  total: number;
  allPassed?: boolean;
  loading?: boolean;
}

export default function TestResultsPanel({ results, passed, total, allPassed, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0d0d14] p-4">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          Running test cases...
        </div>
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0d0d14] p-4 text-sm text-white/40 text-center">
        Click <span className="text-emerald-400 font-medium">Run</span> to execute against test cases
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d14] overflow-hidden">
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b border-white/10',
          allPassed ? 'bg-emerald-500/10' : passed > 0 ? 'bg-amber-500/10' : 'bg-red-500/10'
        )}
      >
        <div className="flex items-center gap-2">
          {allPassed ? (
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          ) : (
            <XCircle className="h-5 w-5 text-red-400" />
          )}
          <span className={cn('font-semibold text-sm', allPassed ? 'text-emerald-300' : 'text-white')}>
            {allPassed ? 'Accepted' : 'Wrong Answer'}
          </span>
        </div>
        <span className="text-sm text-white/60">
          {passed}/{total} test cases passed
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto p-2 space-y-2">
        {results.filter((r) => !r.hidden).map((r) => (
          <motion.div
            key={r.index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              'rounded-lg p-3 text-xs font-mono border',
              r.passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              {r.passed ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-400" />
              )}
              <span className="font-sans font-medium text-white/70">Case {r.index}</span>
            </div>
            <p className="text-white/50">Input: {r.input}</p>
            <p className="text-white/50">Expected: {r.expected}</p>
            {!r.passed && (
              <>
                <p className="text-red-300">Got: {r.actual ?? 'undefined'}</p>
                {r.error && (
                  <p className="text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {r.error}
                  </p>
                )}
              </>
            )}
          </motion.div>
        ))}
        {results.some((r) => r.hidden) && (
          <p className="text-center text-xs text-white/30 py-2">+ hidden test cases on submit</p>
        )}
      </div>
    </div>
  );
}
