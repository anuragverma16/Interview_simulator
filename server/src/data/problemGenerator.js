/**
 * Generates 3000+ LeetCode-style problems with runnable test cases.
 * Hand-crafted classics are merged in leetcodeProblems.js.
 */

import { enrichGeneratedProblem } from './starterCode.js';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TOPIC_POOL = [
  'Array', 'String', 'Hash Table', 'Math', 'Two Pointers', 'Sliding Window',
  'Stack', 'Queue', 'Linked List', 'Tree', 'Graph', 'Heap', 'Binary Search',
  'Dynamic Programming', 'Greedy', 'Backtracking', 'Matrix', 'Bit Manipulation',
];

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickTags(rng, difficulty) {
  const count = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;
  const shuffled = [...TOPIC_POOL].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

const PATTERN_BUILDERS = [
  // 0: Array sum pair count
  (i, rng) => {
    const target = 5 + (i % 20);
    const nums = [1, 2, target - 3, 4, target - 1].filter((x) => x > 0);
    const pairs = [];
    for (let a = 0; a < nums.length; a++)
      for (let b = a + 1; b < nums.length; b++)
        if (nums[a] + nums[b] === target) pairs.push(1);
    return {
      title: `Count Pairs With Sum ${target}`,
      functionName: 'countPairs',
      paramOrder: ['nums', 'target'],
      description: `Given an integer array \`nums\` and integer \`target\`, return how many unique pairs \`(i, j)\` where \`i < j\` and \`nums[i] + nums[j] === target\`.`,
      tags: ['Array', 'Hash Table'],
      testCases: [
        { input: { nums, target }, expected: pairs.length },
        { input: { nums: [1, 1, 1, 1], target: 2 }, expected: 6 },
        { input: { nums: [1, 2], target: 100 }, expected: 0, hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}, target = ${target}`, output: String(pairs.length), explanation: `Pairs that sum to ${target} are counted with i < j.` }],
    };
  },
  // 1: Max element
  (i) => {
    const nums = [3, 1, 4, i % 50, 2, 9];
    return {
      title: `Find Maximum Element #${i + 1}`,
      functionName: 'findMax',
      paramOrder: ['nums'],
      description: 'Return the maximum value in the integer array `nums`.',
      tags: ['Array'],
      testCases: [
        { input: { nums }, expected: Math.max(...nums) },
        { input: { nums: [-5, -2, -9] }, expected: -2 },
        { input: { nums: [42] }, expected: 42, hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}`, output: String(Math.max(...nums)) }],
    };
  },
  // 2: Reverse array
  (i) => {
    const nums = [1, 2, 3, i % 10 + 4];
    return {
      title: `Reverse Array #${i + 1}`,
      functionName: 'reverseArray',
      paramOrder: ['nums'],
      description: 'Return a new array with elements of `nums` in reverse order.',
      tags: ['Array', 'Two Pointers'],
      testCases: [
        { input: { nums }, expected: [...nums].reverse() },
        { input: { nums: [] }, expected: [] },
        { input: { nums: [1] }, expected: [1], hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}`, output: JSON.stringify([...nums].reverse()) }],
    };
  },
  // 3: Sum array
  (i) => {
    const nums = Array.from({ length: 5 }, (_, j) => (i + j) % 7 + 1);
    return {
      title: `Array Sum #${i + 1}`,
      functionName: 'arraySum',
      paramOrder: ['nums'],
      description: 'Return the sum of all elements in `nums`.',
      tags: ['Array', 'Math'],
      testCases: [
        { input: { nums }, expected: nums.reduce((a, b) => a + b, 0) },
        { input: { nums: [0, 0, 0] }, expected: 0 },
        { input: { nums: [-1, 1] }, expected: 0, hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}`, output: String(nums.reduce((a, b) => a + b, 0)) }],
    };
  },
  // 4: Palindrome string
  (i) => {
    const base = `level${i % 3 === 0 ? '' : 'x'}`.replace('x', '');
    const s = i % 2 === 0 ? base : `race${i % 5}`;
    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isPal = clean === [...clean].reverse().join('');
    return {
      title: `Check Palindrome #${i + 1}`,
      functionName: 'isPalindromeStr',
      paramOrder: ['s'],
      description: 'Return `true` if `s` reads the same forward and backward (alphanumeric only, case-insensitive).',
      tags: ['String', 'Two Pointers'],
      testCases: [
        { input: { s: 'A man a plan a canal Panama' }, expected: true },
        { input: { s }, expected: isPal },
        { input: { s: 'hello' }, expected: false, hidden: true },
      ],
      examples: [{ input: `s = "${s}"`, output: String(isPal) }],
    };
  },
  // 5: Factorial
  (i) => {
    const n = (i % 8) + 3;
    let fact = 1;
    for (let k = 2; k <= n; k++) fact *= k;
    return {
      title: `Factorial of ${n}`,
      functionName: 'factorial',
      paramOrder: ['n'],
      description: 'Return `n!` (factorial of n).',
      tags: ['Math', 'Recursion'],
      testCases: [
        { input: { n }, expected: fact },
        { input: { n: 0 }, expected: 1 },
        { input: { n: 1 }, expected: 1, hidden: true },
      ],
      examples: [{ input: `n = ${n}`, output: String(fact) }],
    };
  },
  // 6: Fibonacci
  (i) => {
    const n = (i % 15) + 2;
    const fib = [0, 1];
    for (let k = 2; k <= n; k++) fib[k] = fib[k - 1] + fib[k - 2];
    return {
      title: `Fibonacci Number #${i + 1}`,
      functionName: 'fibonacci',
      paramOrder: ['n'],
      description: 'Return the `n`th Fibonacci number (F0=0, F1=1).',
      tags: ['Math', 'Dynamic Programming'],
      testCases: [
        { input: { n }, expected: fib[n] },
        { input: { n: 0 }, expected: 0 },
        { input: { n: 10 }, expected: 55, hidden: true },
      ],
      examples: [{ input: `n = ${n}`, output: String(fib[n]) }],
    };
  },
  // 7: Binary search exists
  (i) => {
    const nums = Array.from({ length: 10 }, (_, j) => j * 2 + i % 3);
    const target = nums[3];
    return {
      title: `Binary Search Exists #${i + 1}`,
      functionName: 'searchExists',
      paramOrder: ['nums', 'target'],
      description: 'Given sorted `nums`, return `true` if `target` exists.',
      tags: ['Array', 'Binary Search'],
      testCases: [
        { input: { nums, target }, expected: true },
        { input: { nums, target: 999 }, expected: false },
        { input: { nums: [1], target: 1 }, expected: true, hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}, target = ${target}`, output: 'true' }],
    };
  },
  // 8: Remove duplicates sorted
  (i) => {
    const nums = [1, 1, 2, 2, 3, i % 4 + 3];
    const unique = [...new Set(nums)];
    return {
      title: `Remove Duplicates #${i + 1}`,
      functionName: 'removeDuplicates',
      paramOrder: ['nums'],
      description: 'Given sorted `nums`, return array with duplicates removed.',
      tags: ['Array', 'Two Pointers'],
      testCases: [
        { input: { nums }, expected: unique },
        { input: { nums: [1, 1, 1] }, expected: [1] },
        { input: { nums: [] }, expected: [], hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}`, output: JSON.stringify(unique) }],
    };
  },
  // 9: Missing number
  (i) => {
    const n = 5 + (i % 5);
    const full = Array.from({ length: n + 1 }, (_, j) => j);
    const missing = i % (n + 1);
    const nums = full.filter((x) => x !== missing);
    return {
      title: `Find Missing Number #${i + 1}`,
      functionName: 'findMissing',
      paramOrder: ['nums'],
      description: 'Array contains `n` distinct numbers in range [0, n]. Find the missing one.',
      tags: ['Array', 'Math', 'Bit Manipulation'],
      testCases: [
        { input: { nums }, expected: missing },
        { input: { nums: [0] }, expected: 1 },
        { input: { nums: [1] }, expected: 0, hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}`, output: String(missing) }],
    };
  },
  // 10: Climbing stairs variant
  (i) => {
    const n = 3 + (i % 8);
    const ways = [0, 1, 2];
    for (let k = 3; k <= n; k++) ways[k] = ways[k - 1] + ways[k - 2];
    return {
      title: `Climbing Stairs ${n} Steps`,
      functionName: 'climbWays',
      paramOrder: ['n'],
      description: 'You can climb 1 or 2 steps. Return distinct ways to reach step `n`.',
      tags: ['Dynamic Programming', 'Math'],
      testCases: [
        { input: { n }, expected: ways[n] },
        { input: { n: 2 }, expected: 2 },
        { input: { n: 1 }, expected: 1, hidden: true },
      ],
      examples: [{ input: `n = ${n}`, output: String(ways[n]) }],
    };
  },
  // 11: Max profit single transaction
  (i) => {
    const prices = [7, 1, 5, 3, 6 + (i % 4), 4];
    let minP = prices[0], maxProfit = 0;
    for (const p of prices) {
      minP = Math.min(minP, p);
      maxProfit = Math.max(maxProfit, p - minP);
    }
    return {
      title: `Stock Profit #${i + 1}`,
      functionName: 'maxProfitOnce',
      paramOrder: ['prices'],
      description: 'Return max profit from one buy and one sell.',
      tags: ['Array', 'Dynamic Programming'],
      testCases: [
        { input: { prices }, expected: maxProfit },
        { input: { prices: [7, 6, 4, 3] }, expected: 0 },
        { input: { prices: [2, 4] }, expected: 2, hidden: true },
      ],
      examples: [{ input: `prices = ${JSON.stringify(prices)}`, output: String(maxProfit) }],
    };
  },
  // 12: Valid parentheses simplified
  (i) => {
    const s = i % 2 === 0 ? '()[]{}' : '([{}])';
    return {
      title: `Valid Brackets #${i + 1}`,
      functionName: 'isValidBracket',
      paramOrder: ['s'],
      description: 'Return true if bracket string is valid.',
      tags: ['String', 'Stack'],
      testCases: [
        { input: { s: '()' }, expected: true },
        { input: { s }, expected: true },
        { input: { s: '(]' }, expected: false, hidden: true },
      ],
      examples: [{ input: `s = "${s}"`, output: 'true' }],
    };
  },
  // 13: Count vowels
  (i) => {
    const s = `Hello World ${i}`;
    const count = (s.match(/[aeiouAEIOU]/g) || []).length;
    return {
      title: `Count Vowels #${i + 1}`,
      functionName: 'countVowels',
      paramOrder: ['s'],
      description: 'Return the number of vowels in string `s`.',
      tags: ['String'],
      testCases: [
        { input: { s }, expected: count },
        { input: { s: 'xyz' }, expected: 0 },
        { input: { s: 'aeiou' }, expected: 5, hidden: true },
      ],
      examples: [{ input: `s = "${s}"`, output: String(count) }],
    };
  },
  // 14: Matrix diagonal sum
  (i) => {
    const mat = [[1, 2, 3], [4, 5, 6], [7, 8, 9 + (i % 3)]];
    const sum = mat[0][0] + mat[1][1] + mat[2][2];
    return {
      title: `Matrix Diagonal Sum #${i + 1}`,
      functionName: 'diagonalSum',
      paramOrder: ['mat'],
      description: 'Return sum of main diagonal of square matrix.',
      tags: ['Matrix', 'Array'],
      testCases: [
        { input: { mat }, expected: sum },
        { input: { mat: [[5]] }, expected: 5 },
        { input: { mat: [[1, 2], [3, 4]] }, expected: 5, hidden: true },
      ],
      examples: [{ input: `mat = ${JSON.stringify(mat)}`, output: String(sum) }],
    };
  },
  // 15: Single number XOR pattern
  (i) => {
    const nums = [4, 1, 2, 1, 2, 4, 7 + (i % 5)];
    const xor = nums.reduce((a, b) => a ^ b, 0);
    return {
      title: `Find Single Number #${i + 1}`,
      functionName: 'singleXor',
      paramOrder: ['nums'],
      description: 'Every element appears twice except one. Find it.',
      tags: ['Array', 'Bit Manipulation'],
      testCases: [
        { input: { nums }, expected: xor },
        { input: { nums: [1] }, expected: 1 },
        { input: { nums: [2, 2, 3] }, expected: 3, hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}`, output: String(xor) }],
    };
  },
  // 16: Merge sorted
  (i) => {
    const a = [1, 3, 5 + (i % 3)];
    const b = [2, 4, 6];
    const merged = [...a, ...b].sort((x, y) => x - y);
    return {
      title: `Merge Sorted Arrays #${i + 1}`,
      functionName: 'mergeSorted',
      paramOrder: ['a', 'b'],
      description: 'Merge two sorted arrays into one sorted array.',
      tags: ['Array', 'Two Pointers', 'Sorting'],
      testCases: [
        { input: { a, b }, expected: merged },
        { input: { a: [], b: [1] }, expected: [1] },
        { input: { a: [1], b: [] }, expected: [1], hidden: true },
      ],
      examples: [{ input: `a = ${JSON.stringify(a)}, b = ${JSON.stringify(b)}`, output: JSON.stringify(merged) }],
    };
  },
  // 17: Contains duplicate
  (i) => {
    const nums = i % 2 === 0 ? [1, 2, 3, 1] : [1, 2, 3, 4];
    return {
      title: `Has Duplicate #${i + 1}`,
      functionName: 'hasDuplicate',
      paramOrder: ['nums'],
      description: 'Return true if any value appears at least twice.',
      tags: ['Array', 'Hash Table'],
      testCases: [
        { input: { nums }, expected: new Set(nums).size !== nums.length },
        { input: { nums: [1, 2, 3, 4] }, expected: false },
        { input: { nums: [1, 1] }, expected: true, hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}`, output: String(new Set(nums).size !== nums.length) }],
    };
  },
  // 18: Longest increasing subsequence length (simplified)
  (i) => {
    const nums = [1, 3, 2, 4, 5 + (i % 2)];
    let maxLen = 1, cur = 1;
    for (let k = 1; k < nums.length; k++) {
      if (nums[k] > nums[k - 1]) cur++;
      else cur = 1;
      maxLen = Math.max(maxLen, cur);
    }
    return {
      title: `Longest Increasing Run #${i + 1}`,
      functionName: 'longestRun',
      paramOrder: ['nums'],
      description: 'Return length of longest contiguous strictly increasing subarray.',
      tags: ['Array', 'Dynamic Programming'],
      testCases: [
        { input: { nums }, expected: maxLen },
        { input: { nums: [5, 4, 3] }, expected: 1 },
        { input: { nums: [1, 2, 3] }, expected: 3, hidden: true },
      ],
      examples: [{ input: `nums = ${JSON.stringify(nums)}`, output: String(maxLen) }],
    };
  },
  // 19: Grid islands count (small)
  (i) => {
    const grid = [
      ['1', '1', '0'],
      ['0', '1', '0'],
      [i % 2 ? '1' : '0', '0', '1'],
    ];
    const countIslands = (g) => {
      let count = 0;
      const rows = g.length, cols = g[0].length;
      const dfs = (r, c) => {
        if (r < 0 || c < 0 || r >= rows || c >= cols || g[r][c] !== '1') return;
        g[r][c] = '0';
        dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);
      };
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          if (g[r][c] === '1') { count++; dfs(r, c); }
      return count;
    };
    const expected = countIslands(grid.map((r) => [...r]));
    return {
      title: `Count Islands Mini #${i + 1}`,
      functionName: 'countIslandsMini',
      paramOrder: ['grid'],
      description: 'Count islands of `1` in binary grid (`1` land, `0` water).',
      tags: ['Matrix', 'Graph', 'Depth-First Search'],
      testCases: [
        { input: { grid: [['1', '1', '0'], ['0', '1', '0'], ['0', '0', '1']] }, expected: 2 },
        { input: { grid }, expected },
        { input: { grid: [['0']] }, expected: 0, hidden: true },
      ],
      examples: [{ input: 'grid = 3x3', output: String(expected) }],
    };
  },
];

export function generateProblemCatalog(count = 3000) {
  const problems = [];
  const patternCount = PATTERN_BUILDERS.length;

  for (let i = 0; i < count; i++) {
    const rng = mulberry32(i * 9973 + 42);
    const difficulty = DIFFICULTIES[i % 3];
    const builder = PATTERN_BUILDERS[i % patternCount];
    const base = builder(i, rng);

    problems.push(enrichGeneratedProblem({
      slug: `iq-${String(i + 1000).padStart(4, '0')}-${base.functionName}`,
      leetcodeId: 1000 + i,
      title: base.title,
      difficulty,
      tags: [...new Set([...base.tags, ...pickTags(rng, difficulty)])].slice(0, 4),
      acceptance: Math.round(35 + rng() * 45),
      functionName: base.functionName,
      paramOrder: base.paramOrder,
      description: base.description,
      examples: base.examples,
      testCases: base.testCases,
      generated: true,
    }));
  }

  return problems;
}
