import ProblemDescription, { FormattedText } from './ProblemDescription';
import { formatFunctionSignature } from '../../utils/problemSignature';

interface ProblemParam {
  name: string;
  type: string;
}

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Props {
  description: string;
  examples?: Example[];
  constraints?: string[];
  functionName?: string;
  returnType?: string;
  parameters?: ProblemParam[];
  language: string;
}

export default function ProblemDetailPanel({
  description,
  examples,
  constraints,
  functionName,
  returnType,
  parameters,
  language,
}: Props) {
  const signature = formatFunctionSignature(functionName || '', parameters, returnType, language);

  return (
    <div className="space-y-6">
      <div className="coding-prose">
        <ProblemDescription text={description} />
      </div>

      {signature && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Function signature</p>
          <pre className="rounded-xl bg-[#0a0a12] border border-white/10 px-4 py-3 text-xs text-emerald-300/90 overflow-x-auto font-mono">
            {signature}
          </pre>
        </div>
      )}

      {parameters && parameters.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Input / Output</p>
          <div className="rounded-xl bg-black/5 dark:bg-white/[0.03] border border-themed px-4 py-3 space-y-2 text-sm">
            <p>
              <span className="text-muted">Parameters: </span>
              {parameters.map((p, i) => (
                <span key={p.name}>
                  {i > 0 && ', '}
                  <code className="text-cyan-600 dark:text-cyan-300/90">{p.name}</code>
                  <span className="text-muted"> ({p.type})</span>
                </span>
              ))}
            </p>
            {returnType && (
              <p>
                <span className="text-muted">Return type: </span>
                <code className="text-emerald-600 dark:text-emerald-400/90">{returnType}</code>
              </p>
            )}
            <p className="text-xs text-muted pt-1">
              Your solution will be judged against multiple hidden test cases in addition to the examples below.
            </p>
          </div>
        </div>
      )}

      {examples && examples.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Examples</p>
          {examples.map((ex, i) => (
            <div key={i} className="rounded-xl bg-[#0a0a12] border border-white/10 p-4 coding-mono text-sm">
              <p className="text-white/50 text-xs font-sans mb-2 font-semibold">Example {i + 1}:</p>
              <p className="text-cyan-300/90">
                <span className="text-white/40 font-sans">Input: </span>
                {ex.input}
              </p>
              <p className="text-emerald-400/90 mt-1">
                <span className="text-white/40 font-sans">Output: </span>
                {ex.output}
              </p>
              {ex.explanation && (
                <p className="text-white/50 text-xs font-sans mt-2 leading-relaxed border-t border-white/5 pt-2">
                  <span className="text-white/40">Explanation: </span>
                  <FormattedText text={ex.explanation} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {constraints && constraints.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Constraints</p>
          <ul className="space-y-1.5">
            {constraints.map((c) => (
              <li key={c} className="flex gap-2 text-sm text-themed-secondary">
                <span className="text-muted shrink-0">•</span>
                <code className="text-[0.85em] text-cyan-600/80 dark:text-cyan-300/70">{c}</code>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
