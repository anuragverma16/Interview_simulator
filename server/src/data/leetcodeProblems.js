/**
 * Classic LeetCode-style problems with runnable test cases.
 */

import { ADDITIONAL_PROBLEMS } from './additionalProblems.js';
import { MORE_CLASSIC_PROBLEMS } from './moreClassicProblems.js';
import { generateProblemCatalog } from './problemGenerator.js';
import { searchProblems, getTopicCounts, TOPICS } from './problemTopics.js';
import { hashDate, todayStr as dailyTodayStr } from '../utils/dailyUtils.js';
import { buildStarterTemplates, enrichGeneratedProblem } from './starterCode.js';

const BASE_PROBLEMS = [
  {
    slug: 'two-sum',
    leetcodeId: 1,
    title: 'Two Sum',
    difficulty: 'easy',
    tags: ['Array', 'Hash Table'],
    functionName: 'twoSum',
    paramOrder: ['nums', 'target'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', '-10^9 <= target <= 10^9', 'Only one valid answer exists.'],
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1], hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};`,
      python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        `,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'valid-parentheses',
    leetcodeId: 20,
    title: 'Valid Parentheses',
    difficulty: 'easy',
    tags: ['String', 'Stack'],
    functionName: 'isValid',
    paramOrder: ['s'],
    description: `Given a string \`s\` containing just the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10^4'],
    testCases: [
      { input: { s: '()' }, expected: true },
      { input: { s: '()[]{}' }, expected: true },
      { input: { s: '(]' }, expected: false },
      { input: { s: '([)]' }, expected: false, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nvar isValid = function(s) {\n    \n};`,
      python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        `,
      java: `class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'best-time-to-buy-and-sell-stock',
    leetcodeId: 121,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'easy',
    tags: ['Array', 'Dynamic Programming'],
    functionName: 'maxProfit',
    paramOrder: ['prices'],
    description: `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a single day to buy and a different day in the future to sell.

Return the maximum profit. If you cannot achieve any profit, return \`0\`.`,
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy day 2 (price=1), sell day 5 (price=6), profit = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0' },
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    testCases: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expected: 5 },
      { input: { prices: [7, 6, 4, 3, 1] }, expected: 0 },
      { input: { prices: [2, 4, 1] }, expected: 2, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} prices\n * @return {number}\n */\nvar maxProfit = function(prices) {\n    \n};`,
      python: `class Solution:\n    def maxProfit(self, prices: List[int]) -> int:\n        `,
      java: `class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'maximum-subarray',
    leetcodeId: 53,
    title: 'Maximum Subarray',
    difficulty: 'medium',
    tags: ['Array', 'Divide and Conquer', 'DP'],
    functionName: 'maxSubArray',
    paramOrder: ['nums'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    testCases: [
      { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expected: 6 },
      { input: { nums: [1] }, expected: 1 },
      { input: { nums: [5, 4, -1, 7, 8] }, expected: 23, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar maxSubArray = function(nums) {\n    \n};`,
      python: `class Solution:\n    def maxSubArray(self, nums: List[int]) -> int:\n        `,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'climbing-stairs',
    leetcodeId: 70,
    title: 'Climbing Stairs',
    difficulty: 'easy',
    tags: ['Math', 'Dynamic Programming'],
    functionName: 'climbStairs',
    paramOrder: ['n'],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2' },
      { input: 'n = 3', output: '3' },
    ],
    constraints: ['1 <= n <= 45'],
    testCases: [
      { input: { n: 2 }, expected: 2 },
      { input: { n: 3 }, expected: 3 },
      { input: { n: 5 }, expected: 8, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number} n\n * @return {number}\n */\nvar climbStairs = function(n) {\n    \n};`,
      python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        `,
      java: `class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'longest-substring-without-repeating-characters',
    leetcodeId: 3,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    functionName: 'lengthOfLongestSubstring',
    paramOrder: ['s'],
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", length 3.' },
      { input: 's = "bbbbb"', output: '1' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4'],
    testCases: [
      { input: { s: 'abcabcbb' }, expected: 3 },
      { input: { s: 'bbbbb' }, expected: 1 },
      { input: { s: 'pwwkew' }, expected: 3, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};`,
      python: `class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        `,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'contains-duplicate',
    leetcodeId: 217,
    title: 'Contains Duplicate',
    difficulty: 'easy',
    tags: ['Array', 'Hash Table', 'Sorting'],
    functionName: 'containsDuplicate',
    paramOrder: ['nums'],
    description: `Given an integer array \`nums\`, return \`true\` if any value appears at least twice in the array, and return \`false\` if every element is distinct.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: 'true' },
      { input: 'nums = [1,2,3,4]', output: 'false' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    testCases: [
      { input: { nums: [1, 2, 3, 1] }, expected: true },
      { input: { nums: [1, 2, 3, 4] }, expected: false },
      { input: { nums: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2] }, expected: true, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @return {boolean}\n */\nvar containsDuplicate = function(nums) {\n    \n};`,
      python: `class Solution:\n    def containsDuplicate(self, nums: List[int]) -> bool:\n        `,
      java: `class Solution {\n    public boolean containsDuplicate(int[] nums) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'reverse-linked-list',
    leetcodeId: 206,
    title: 'Reverse Linked List',
    difficulty: 'easy',
    tags: ['Linked List', 'Recursion'],
    functionName: 'reverseList',
    paramOrder: ['head'],
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

For this platform, \`head\` is an array representing list values. Return the reversed array.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
    ],
    constraints: ['The number of nodes is in the range [0, 5000]'],
    testCases: [
      { input: { head: [1, 2, 3, 4, 5] }, expected: [5, 4, 3, 2, 1] },
      { input: { head: [1, 2] }, expected: [2, 1] },
      { input: { head: [] }, expected: [], hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} head - array representation\n * @return {number[]}\n */\nvar reverseList = function(head) {\n    \n};`,
      python: `class Solution:\n    def reverseList(self, head: List[int]) -> List[int]:\n        `,
      java: `class Solution {\n    public int[] reverseList(int[] head) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> reverseList(vector<int>& head) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'valid-palindrome',
    leetcodeId: 125,
    title: 'Valid Palindrome',
    difficulty: 'easy',
    tags: ['Two Pointers', 'String'],
    functionName: 'isPalindrome',
    paramOrder: ['s'],
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5'],
    testCases: [
      { input: { s: 'A man, a plan, a canal: Panama' }, expected: true },
      { input: { s: 'race a car' }, expected: false },
      { input: { s: ' ' }, expected: true, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {string} s\n * @return {boolean}\n */\nvar isPalindrome = function(s) {\n    \n};`,
      python: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        `,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isPalindrome(string s) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'house-robber',
    leetcodeId: 198,
    title: 'House Robber',
    difficulty: 'medium',
    tags: ['Array', 'Dynamic Programming'],
    functionName: 'rob',
    paramOrder: ['nums'],
    description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. Adjacent houses have security systems linked — if two adjacent houses are broken into on the same night, police are alerted.

Given an integer array \`nums\` representing the amount of money of each house, return the maximum amount you can rob tonight without alerting the police.`,
    examples: [
      { input: 'nums = [1,2,3,1]', output: '4' },
      { input: 'nums = [2,7,9,3,1]', output: '12' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    testCases: [
      { input: { nums: [1, 2, 3, 1] }, expected: 4 },
      { input: { nums: [2, 7, 9, 3, 1] }, expected: 12 },
      { input: { nums: [5, 1, 2, 10] }, expected: 15, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar rob = function(nums) {\n    \n};`,
      python: `class Solution:\n    def rob(self, nums: List[int]) -> int:\n        `,
      java: `class Solution {\n    public int rob(int[] nums) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int rob(vector<int>& nums) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'product-of-array-except-self',
    leetcodeId: 238,
    title: 'Product of Array Except Self',
    difficulty: 'medium',
    tags: ['Array', 'Prefix Sum'],
    functionName: 'productExceptSelf',
    paramOrder: ['nums'],
    description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all elements of \`nums\` except \`nums[i]\`.

You must write an algorithm that runs in O(n) time and without using the division operation.`,
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' },
    ],
    constraints: ['2 <= nums.length <= 10^5'],
    testCases: [
      { input: { nums: [1, 2, 3, 4] }, expected: [24, 12, 8, 6] },
      { input: { nums: [-1, 1, 0, -3, 3] }, expected: [0, 0, 9, 0, 0] },
      { input: { nums: [2, 3] }, expected: [3, 2], hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @return {number[]}\n */\nvar productExceptSelf = function(nums) {\n    \n};`,
      python: `class Solution:\n    def productExceptSelf(self, nums: List[int]) -> List[int]:\n        `,
      java: `class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'merge-intervals',
    leetcodeId: 56,
    title: 'Merge Intervals',
    difficulty: 'medium',
    tags: ['Array', 'Sorting'],
    functionName: 'merge',
    paramOrder: ['intervals'],
    description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]' },
      { input: 'intervals = [[1,4],[4,5]]', output: '[[1,5]]' },
    ],
    constraints: ['1 <= intervals.length <= 10^4'],
    testCases: [
      { input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }, expected: [[1, 6], [8, 10], [15, 18]] },
      { input: { intervals: [[1, 4], [4, 5]] }, expected: [[1, 5]] },
      { input: { intervals: [[1, 4], [0, 4]] }, expected: [[0, 4]], hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[][]} intervals\n * @return {number[][]}\n */\nvar merge = function(intervals) {\n    \n};`,
      python: `class Solution:\n    def merge(self, intervals: List[List[int]]) -> List[List[int]]:\n        `,
      java: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        \n    }\n};`,
    },
  },
];

const GENERATED_PROBLEMS = generateProblemCatalog(2988);

function mergeProblemCatalog(curatedLists, generated) {
  const curated = [];
  const seenIds = new Set();
  for (const list of curatedLists) {
    for (const p of list) {
      if (seenIds.has(p.leetcodeId)) continue;
      seenIds.add(p.leetcodeId);
      curated.push({ ...p, generated: false });
    }
  }
  return [...curated, ...generated].sort((a, b) => a.leetcodeId - b.leetcodeId);
}

const PROBLEMS = mergeProblemCatalog(
  [BASE_PROBLEMS, ADDITIONAL_PROBLEMS, MORE_CLASSIC_PROBLEMS],
  GENERATED_PROBLEMS
);

for (const p of BASE_PROBLEMS) {
  if (!p.acceptance) p.acceptance = { easy: 52, medium: 48, hard: 42 }[p.difficulty] || 50;
}

for (let i = 0; i < PROBLEMS.length; i++) {
  if (!PROBLEMS[i].parameters) {
    PROBLEMS[i] = enrichGeneratedProblem(PROBLEMS[i]);
  }
}

export function getProblemBySlug(slug) {
  return PROBLEMS.find((p) => p.slug === slug);
}

export function getProblemByLeetcodeId(id) {
  const n = parseInt(id, 10);
  if (!Number.isFinite(n)) return null;
  return PROBLEMS.find((p) => !p.generated && p.leetcodeId === n)
    || PROBLEMS.find((p) => p.leetcodeId === n);
}

export function getProblemsByDifficulty(difficulty) {
  if (!difficulty) return PROBLEMS;
  return PROBLEMS.filter((p) => p.difficulty === difficulty);
}

export function getDailyStreakProblem(date = new Date()) {
  const dateStr = dailyTodayStr(date);
  const idx = hashDate(dateStr) % PROBLEMS.length;
  return { ...PROBLEMS[idx], dailyDate: dateStr };
}

export function getDailyStreakProblemForDate(dateStr) {
  const idx = hashDate(dateStr) % PROBLEMS.length;
  return { ...PROBLEMS[idx], dailyDate: dateStr };
}

/** Pick a daily streak problem for a user, skipping slugs they already solved in streak history. */
export function pickStreakProblemForUser(dateStr, excludeSlugs = []) {
  const excluded = new Set(excludeSlugs);
  const startIdx = hashDate(dateStr) % PROBLEMS.length;
  for (let i = 0; i < PROBLEMS.length; i++) {
    const problem = PROBLEMS[(startIdx + i) % PROBLEMS.length];
    if (!excluded.has(problem.slug)) {
      return { ...problem, dailyDate: dateStr };
    }
  }
  return { ...PROBLEMS[startIdx], dailyDate: dateStr };
}

export function getStarterCode(problem, language) {
  if (problem.templates?.[language]) return problem.templates[language];
  const built = buildStarterTemplates(problem.functionName, problem.paramOrder, problem.testCases);
  return built[language] || built.javascript;
}

export function formatProblemForClient(problem) {
  return {
    slug: problem.slug,
    leetcodeId: problem.leetcodeId,
    title: problem.title,
    difficulty: problem.difficulty,
    tags: problem.tags,
    acceptance: problem.acceptance,
    description: problem.description,
    examples: problem.examples,
    constraints: problem.constraints,
    functionName: problem.functionName,
    returnType: problem.returnType,
    paramOrder: problem.paramOrder,
    parameters: problem.parameters,
    testCases: problem.testCases.filter((tc) => !tc.hidden).map((tc) => ({
      input: formatTestInput(tc.input, problem.paramOrder),
      expected: JSON.stringify(tc.expected),
    })),
  };
}

function formatTestInput(input, paramOrder) {
  return paramOrder.map((p) => `${p} = ${JSON.stringify(input[p])}`).join(', ');
}

export function filterProblems(filters) {
  return searchProblems(PROBLEMS, filters);
}

export function getTopics() {
  return getTopicCounts(PROBLEMS);
}

export { TOPICS, searchProblems, getTopicCounts, PROBLEMS };
