/**
 * All data structure & algorithm topics (LeetCode-style)
 */
export const TOPICS = [
  { id: 'Array', label: 'Array', icon: '📊' },
  { id: 'String', label: 'String', icon: '🔤' },
  { id: 'Hash Table', label: 'Hash Table', icon: '🗂️' },
  { id: 'Stack', label: 'Stack', icon: '📚' },
  { id: 'Queue', label: 'Queue', icon: '📥' },
  { id: 'Linked List', label: 'Linked List', icon: '🔗' },
  { id: 'Tree', label: 'Tree', icon: '🌳' },
  { id: 'Graph', label: 'Graph', icon: '🕸️' },
  { id: 'Heap', label: 'Heap', icon: '⛰️' },
  { id: 'Binary Search', label: 'Binary Search', icon: '🔍' },
  { id: 'Two Pointers', label: 'Two Pointers', icon: '👆' },
  { id: 'Sliding Window', label: 'Sliding Window', icon: '🪟' },
  { id: 'Dynamic Programming', label: 'Dynamic Programming', icon: '🧮' },
  { id: 'Backtracking', label: 'Backtracking', icon: '↩️' },
  { id: 'Greedy', label: 'Greedy', icon: '💰' },
  { id: 'Sorting', label: 'Sorting', icon: '🔢' },
  { id: 'Math', label: 'Math', icon: '➗' },
  { id: 'Matrix', label: 'Matrix', icon: '▦' },
  { id: 'Bit Manipulation', label: 'Bit Manipulation', icon: '⚡' },
  { id: 'Divide and Conquer', label: 'Divide and Conquer', icon: '✂️' },
];

export function getTopicCounts(problems) {
  const counts = {};
  for (const t of TOPICS) counts[t.id] = 0;
  for (const p of problems) {
    for (const tag of p.tags || []) {
      if (counts[tag] !== undefined) counts[tag]++;
    }
  }
  return TOPICS.map((t) => ({ ...t, count: counts[t.id] || 0 }));
}

import { parseProblemSearchQuery, matchesProblemSearch } from './problemSearch.js';

export function searchProblems(problems, { search, difficulty, topic, sort = 'leetcodeId', page = 1, limit = 20 }) {
  let filtered = [...problems];
  const parsed = parseProblemSearchQuery(search);

  if (parsed) {
    filtered = filtered.filter((p) => matchesProblemSearch(p, parsed));
    if (parsed.mode === 'leetcodeId') {
      filtered.sort((a, b) => {
        const aCur = a.generated ? 1 : 0;
        const bCur = b.generated ? 1 : 0;
        return aCur - bCur;
      });
    }
  }

  if (difficulty) {
    filtered = filtered.filter((p) => p.difficulty === difficulty);
  }

  if (topic) {
    filtered = filtered.filter((p) => p.tags?.includes(topic));
  }

  if (sort === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'difficulty') {
    const order = { easy: 0, medium: 1, hard: 2 };
    filtered.sort((a, b) => order[a.difficulty] - order[b.difficulty]);
  } else {
    filtered.sort((a, b) => a.leetcodeId - b.leetcodeId);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return {
    items: items.map((p) => ({
      slug: p.slug,
      leetcodeId: p.leetcodeId,
      title: p.title,
      difficulty: p.difficulty,
      tags: p.tags,
      acceptance: p.acceptance || null,
      generated: Boolean(p.generated),
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    difficulties: {
      easy: problems.filter((p) => p.difficulty === 'easy').length,
      medium: problems.filter((p) => p.difficulty === 'medium').length,
      hard: problems.filter((p) => p.difficulty === 'hard').length,
    },
  };
}
