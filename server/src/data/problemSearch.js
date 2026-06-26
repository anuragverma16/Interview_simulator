/**
 * Parse problem bank search queries (#70, 70, title, topic).
 */
export function parseProblemSearchQuery(search) {
  if (!search?.trim()) return null;
  const raw = search.trim();
  const hashMatch = raw.match(/^#\s*(\d+)\s*$/);
  if (hashMatch) return { mode: 'leetcodeId', id: parseInt(hashMatch[1], 10) };
  if (/^\d+$/.test(raw)) return { mode: 'leetcodeId', id: parseInt(raw, 10) };
  return { mode: 'text', q: raw.toLowerCase() };
}

export function matchesProblemSearch(problem, parsed) {
  if (!parsed) return true;

  if (parsed.mode === 'leetcodeId') {
    if (problem.generated) return problem.leetcodeId === parsed.id;
    return problem.leetcodeId === parsed.id;
  }

  const q = parsed.q;
  return (
    problem.title.toLowerCase().includes(q)
    || problem.slug.replace(/-/g, ' ').includes(q)
    || problem.slug.includes(q.replace(/\s+/g, '-'))
    || (!problem.generated && String(problem.leetcodeId) === q)
    || problem.tags?.some((t) => t.toLowerCase().includes(q))
  );
}
