function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, j) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${keyPrefix}-${j}`} className="text-cyan-600 dark:text-cyan-300/90 bg-black/5 dark:bg-white/5 px-1 rounded text-[0.9em]">
          {part.slice(1, -1)}
        </code>
        );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${j}`} className="font-semibold text-themed">{part.slice(2, -2)}</strong>;
    }
    return <span key={`${keyPrefix}-${j}`}>{part}</span>;
  });
}

/** Inline formatted snippet for explanations */
export function FormattedText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderInline(text, 'inline')}</span>;
}

interface Props {
  text: string;
}

/** Renders LeetCode-style problem text with paragraphs, bullets, and inline code. */
export default function ProblemDescription({ text }: Props) {
  const blocks = text.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-4 text-themed-secondary leading-relaxed text-sm">
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        const isBulletList = lines.every((l) => l.trim().startsWith('•') || l.trim() === '');
        const isNumberedList = lines.every((l) => /^\d+\.\s/.test(l.trim()) || l.trim() === '');

        if (isBulletList) {
          return (
            <ul key={i} className="list-none space-y-1.5 pl-1">
              {lines.filter((l) => l.trim()).map((line, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-muted shrink-0">•</span>
                  <span>{renderInline(line.replace(/^•\s*/, ''), `b${i}-${j}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <ol key={i} className="list-decimal list-inside space-y-1.5 pl-1">
              {lines.filter((l) => l.trim()).map((line, j) => (
                <li key={j}>{renderInline(line.replace(/^\d+\.\s*/, ''), `n${i}-${j}`)}</li>
              ))}
            </ol>
          );
        }

        return (
          <p key={i} className="whitespace-pre-wrap">
            {renderInline(block, `p${i}`)}
          </p>
        );
      })}
    </div>
  );
}
