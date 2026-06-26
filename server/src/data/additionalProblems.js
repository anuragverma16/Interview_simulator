/**
 * Additional LeetCode problems covering all major data structures
 */

export const ADDITIONAL_PROBLEMS = [
  {
    slug: 'binary-search',
    leetcodeId: 704,
    title: 'Binary Search',
    difficulty: 'easy',
    tags: ['Array', 'Binary Search'],
    acceptance: 58.2,
    functionName: 'search',
    paramOrder: ['nums', 'target'],
    description: `Given an array of integers \`nums\` which is sorted in ascending order, and an integer \`target\`, write a function to search \`target\` in \`nums\`. If \`target\` exists, return its index. Otherwise, return \`-1\`.

You must write an algorithm with \`O(log n)\` runtime complexity.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '-10^4 < nums[i], target < 10^4', 'All integers in nums are unique.', 'nums is sorted in ascending order.'],
    testCases: [
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expected: 4 },
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expected: -1 },
      { input: { nums: [5], target: 5 }, expected: 0, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number}\n */\nvar search = function(nums, target) {\n    \n};`,
      python: `class Solution:\n    def search(self, nums: List[int], target: int) -> int:\n        `,
      java: `class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'group-anagrams',
    leetcodeId: 49,
    title: 'Group Anagrams',
    difficulty: 'medium',
    tags: ['Array', 'Hash Table', 'String', 'Sorting'],
    acceptance: 71.5,
    functionName: 'groupAnagrams',
    paramOrder: ['strs'],
    description: `Given an array of strings \`strs\`, group the anagrams together. You can return the answer in any order.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100'],
    testCases: [
      {
        input: { strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] },
        expected: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']],
        compare: 'anagramGroups',
      },
      { input: { strs: [''] }, expected: [['']], compare: 'anagramGroups' },
      { input: { strs: ['a'] }, expected: [['a']], compare: 'anagramGroups', hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {string[]} strs\n * @return {string[][]}\n */\nvar groupAnagrams = function(strs) {\n    \n};`,
      python: `class Solution:\n    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:\n        `,
      java: `class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'number-of-islands',
    leetcodeId: 200,
    title: 'Number of Islands',
    difficulty: 'medium',
    tags: ['Array', 'Matrix', 'Graph', 'Depth-First Search'],
    acceptance: 63.8,
    functionName: 'numIslands',
    paramOrder: ['grid'],
    description: `Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.`,
    examples: [
      { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' },
    ],
    constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300'],
    testCases: [
      {
        input: { grid: [['1', '1', '0', '0', '0'], ['1', '1', '0', '0', '0'], ['0', '0', '1', '0', '0'], ['0', '0', '0', '1', '1']] },
        expected: 3,
      },
      { input: { grid: [['1', '1', '1'], ['0', '1', '0'], ['1', '1', '1']] }, expected: 1 },
      { input: { grid: [['1', '0'], ['0', '1']] }, expected: 2, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {character[][]} grid\n * @return {number}\n */\nvar numIslands = function(grid) {\n    \n};`,
      python: `class Solution:\n    def numIslands(self, grid: List[List[str]]) -> int:\n        `,
      java: `class Solution {\n    public int numIslands(char[][] grid) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'kth-largest-element',
    leetcodeId: 215,
    title: 'Kth Largest Element in an Array',
    difficulty: 'medium',
    tags: ['Array', 'Heap', 'Divide and Conquer'],
    acceptance: 68.4,
    functionName: 'findKthLargest',
    paramOrder: ['nums', 'k'],
    description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\`th largest element in the array.

Note that it is the \`k\`th largest element in the sorted order, not the \`k\`th distinct element.`,
    examples: [
      { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' },
      { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' },
    ],
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    testCases: [
      { input: { nums: [3, 2, 1, 5, 6, 4], k: 2 }, expected: 5 },
      { input: { nums: [3, 2, 3, 1, 2, 4, 5, 5, 6], k: 4 }, expected: 4 },
      { input: { nums: [1], k: 1 }, expected: 1, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @param {number} k\n * @return {number}\n */\nvar findKthLargest = function(nums, k) {\n    \n};`,
      python: `class Solution:\n    def findKthLargest(self, nums: List[int], k: int) -> int:\n        `,
      java: `class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'coin-change',
    leetcodeId: 322,
    title: 'Coin Change',
    difficulty: 'medium',
    tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
    acceptance: 47.5,
    functionName: 'coinChange',
    paramOrder: ['coins', 'amount'],
    description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount cannot be made up by any combination of the coins, return \`-1\`.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
    ],
    constraints: ['1 <= coins.length <= 12', '0 <= amount <= 10^4'],
    testCases: [
      { input: { coins: [1, 2, 5], amount: 11 }, expected: 3 },
      { input: { coins: [2], amount: 3 }, expected: -1 },
      { input: { coins: [1], amount: 0 }, expected: 0, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} coins\n * @param {number} amount\n * @return {number}\n */\nvar coinChange = function(coins, amount) {\n    \n};`,
      python: `class Solution:\n    def coinChange(self, coins: List[int], amount: int) -> int:\n        `,
      java: `class Solution {\n    public int coinChange(int[] coins, int amount) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'jump-game',
    leetcodeId: 55,
    title: 'Jump Game',
    difficulty: 'medium',
    tags: ['Array', 'Greedy', 'Dynamic Programming'],
    acceptance: 40.1,
    functionName: 'canJump',
    paramOrder: ['nums'],
    description: `You are given an integer array \`nums\`. You are initially positioned at the array's first index, and each element represents your maximum jump length at that position.

Return \`true\` if you can reach the last index, or \`false\` otherwise.`,
    examples: [
      { input: 'nums = [2,3,1,1,4]', output: 'true' },
      { input: 'nums = [3,2,1,0,4]', output: 'false' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '0 <= nums[i] <= 10^5'],
    testCases: [
      { input: { nums: [2, 3, 1, 1, 4] }, expected: true },
      { input: { nums: [3, 2, 1, 0, 4] }, expected: false },
      { input: { nums: [0] }, expected: true, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @return {boolean}\n */\nvar canJump = function(nums) {\n    \n};`,
      python: `class Solution:\n    def canJump(self, nums: List[int]) -> bool:\n        `,
      java: `class Solution {\n    public boolean canJump(int[] nums) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'subsets',
    leetcodeId: 78,
    title: 'Subsets',
    difficulty: 'medium',
    tags: ['Array', 'Backtracking', 'Bit Manipulation'],
    acceptance: 79.2,
    functionName: 'subsets',
    paramOrder: ['nums'],
    description: `Given an integer array \`nums\` of unique elements, return all possible subsets (the power set).

The solution set must not contain duplicate subsets. Return the solution in any order.`,
    examples: [
      { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' },
    ],
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10', 'All integers are unique.'],
    testCases: [
      { input: { nums: [1, 2, 3] }, expected: [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]], compare: 'subsets' },
      { input: { nums: [0] }, expected: [[], [0]], compare: 'subsets', hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @return {number[][]}\n */\nvar subsets = function(nums) {\n    \n};`,
      python: `class Solution:\n    def subsets(self, nums: List[int]) -> List[List[int]]:\n        `,
      java: `class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'container-with-most-water',
    leetcodeId: 11,
    title: 'Container With Most Water',
    difficulty: 'medium',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    acceptance: 59.3,
    functionName: 'maxArea',
    paramOrder: ['height'],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49' },
      { input: 'height = [1,1]', output: '1' },
    ],
    constraints: ['n == height.length', '2 <= n <= 10^5', '0 <= height[i] <= 10^4'],
    testCases: [
      { input: { height: [1, 8, 6, 2, 5, 4, 8, 3, 7] }, expected: 49 },
      { input: { height: [1, 1] }, expected: 1 },
      { input: { height: [4, 3, 2, 1, 4] }, expected: 16, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} height\n * @return {number}\n */\nvar maxArea = function(height) {\n    \n};`,
      python: `class Solution:\n    def maxArea(self, height: List[int]) -> int:\n        `,
      java: `class Solution {\n    public int maxArea(int[] height) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'maximum-depth-binary-tree',
    leetcodeId: 104,
    title: 'Maximum Depth of Binary Tree',
    difficulty: 'easy',
    tags: ['Tree', 'Depth-First Search', 'Breadth-First Search'],
    acceptance: 78.5,
    functionName: 'maxDepth',
    paramOrder: ['root'],
    description: `Given the \`root\` of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.

\`root\` is a nested object: \`{ val, left?, right? }\` or \`null\`.`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '3' },
      { input: 'root = [1,null,2]', output: '2' },
    ],
    constraints: ['The number of nodes is in the range [0, 10^4]'],
    testCases: [
      {
        input: {
          root: { val: 3, left: { val: 9 }, right: { val: 20, left: { val: 15 }, right: { val: 7 } } },
        },
        expected: 3,
      },
      { input: { root: { val: 1, right: { val: 2 } } }, expected: 2 },
      { input: { root: null }, expected: 0, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {TreeNode|null} root\n * @return {number}\n */\nvar maxDepth = function(root) {\n    \n};`,
      python: `class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        `,
      java: `class Solution {\n    public int maxDepth(TreeNode root) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'merge-two-sorted-lists',
    leetcodeId: 21,
    title: 'Merge Two Sorted Lists',
    difficulty: 'easy',
    tags: ['Linked List', 'Recursion'],
    acceptance: 68.9,
    functionName: 'mergeTwoLists',
    paramOrder: ['list1', 'list2'],
    description: `Merge two sorted lists (represented as arrays) into one sorted array.

You are given the heads of two sorted linked lists as arrays. Merge them into one sorted array.`,
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' },
      { input: 'list1 = [], list2 = []', output: '[]' },
    ],
    constraints: ['The number of nodes in both lists is in the range [0, 50]'],
    testCases: [
      { input: { list1: [1, 2, 4], list2: [1, 3, 4] }, expected: [1, 1, 2, 3, 4, 4] },
      { input: { list1: [], list2: [] }, expected: [] },
      { input: { list1: [1], list2: [2] }, expected: [1, 2], hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} list1\n * @param {number[]} list2\n * @return {number[]}\n */\nvar mergeTwoLists = function(list1, list2) {\n    \n};`,
      python: `class Solution:\n    def mergeTwoLists(self, list1: List[int], list2: List[int]) -> List[int]:\n        `,
      java: `class Solution {\n    public int[] mergeTwoLists(int[] list1, int[] list2) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> mergeTwoLists(vector<int>& list1, vector<int>& list2) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'valid-anagram',
    leetcodeId: 242,
    title: 'Valid Anagram',
    difficulty: 'easy',
    tags: ['Hash Table', 'String', 'Sorting'],
    acceptance: 67.8,
    functionName: 'isAnagram',
    paramOrder: ['s', 't'],
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.`,
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
    testCases: [
      { input: { s: 'anagram', t: 'nagaram' }, expected: true },
      { input: { s: 'rat', t: 'car' }, expected: false },
      { input: { s: 'a', t: 'ab' }, expected: false, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {string} s\n * @param {string} t\n * @return {boolean}\n */\nvar isAnagram = function(s, t) {\n    \n};`,
      python: `class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        `,
      java: `class Solution {\n    public boolean isAnagram(String s, String t) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'daily-temperatures',
    leetcodeId: 739,
    title: 'Daily Temperatures',
    difficulty: 'medium',
    tags: ['Array', 'Stack', 'Monotonic Stack'],
    acceptance: 68.2,
    functionName: 'dailyTemperatures',
    paramOrder: ['temperatures'],
    description: `Given an array of integers \`temperatures\` representing daily temperatures, return an array \`answer\` such that \`answer[i]\` is the number of days you have to wait after the \`i\`th day to get a warmer temperature.`,
    examples: [
      { input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' },
    ],
    constraints: ['1 <= temperatures.length <= 10^5', '30 <= temperatures[i] <= 100'],
    testCases: [
      { input: { temperatures: [73, 74, 75, 71, 69, 72, 76, 73] }, expected: [1, 1, 4, 2, 1, 1, 0, 0] },
      { input: { temperatures: [30, 40, 50, 60] }, expected: [1, 1, 1, 0] },
      { input: { temperatures: [55] }, expected: [0], hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} temperatures\n * @return {number[]}\n */\nvar dailyTemperatures = function(temperatures) {\n    \n};`,
      python: `class Solution:\n    def dailyTemperatures(self, temperatures: List[int]) -> List[int]:\n        `,
      java: `class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'min-subarray-len',
    leetcodeId: 209,
    title: 'Minimum Size Subarray Sum',
    difficulty: 'medium',
    tags: ['Array', 'Sliding Window', 'Binary Search'],
    acceptance: 50.3,
    functionName: 'minSubArrayLen',
    paramOrder: ['target', 'nums'],
    description: `Given an array of positive integers \`nums\` and a positive integer \`target\`, return the minimal length of a subarray whose sum is greater than or equal to \`target\`. If there is no such subarray, return \`0\`.`,
    examples: [
      { input: 'target = 7, nums = [2,3,1,2,4,3]', output: '2' },
      { input: 'target = 4, nums = [1,4,4]', output: '1' },
    ],
    constraints: ['1 <= target <= 10^9', '1 <= nums.length <= 10^5', '1 <= nums[i] <= 10^4'],
    testCases: [
      { input: { target: 7, nums: [2, 3, 1, 2, 4, 3] }, expected: 2 },
      { input: { target: 4, nums: [1, 4, 4] }, expected: 1 },
      { input: { target: 11, nums: [1, 1, 1, 1, 1, 1, 1, 1] }, expected: 0, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number} target\n * @param {number[]} nums\n * @return {number}\n */\nvar minSubArrayLen = function(target, nums) {\n    \n};`,
      python: `class Solution:\n    def minSubArrayLen(self, target: int, nums: List[int]) -> int:\n        `,
      java: `class Solution {\n    public int minSubArrayLen(int target, int[] nums) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int minSubArrayLen(int target, vector<int>& nums) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'rotate-image',
    leetcodeId: 48,
    title: 'Rotate Image',
    difficulty: 'medium',
    tags: ['Array', 'Matrix'],
    acceptance: 79.1,
    functionName: 'rotate',
    paramOrder: ['matrix'],
    description: `You are given an \`n x n\` 2D matrix representing an image. Rotate the image by 90 degrees (clockwise). You have to rotate the image in-place.`,
    examples: [
      { input: 'matrix = [[1,2,3],[4,5,6],[7,8,9]]', output: '[[7,4,1],[8,5,2],[9,6,3]]' },
    ],
    constraints: ['n == matrix.length == matrix[i].length', '1 <= n <= 20'],
    testCases: [
      { input: { matrix: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }, expected: [[7, 4, 1], [8, 5, 2], [9, 6, 3]], compare: 'matrix' },
      { input: { matrix: [[5]] }, expected: [[5]], compare: 'matrix', hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[][]} matrix\n * @return {number[][]}\n */\nvar rotate = function(matrix) {\n    \n};`,
      python: `class Solution:\n    def rotate(self, matrix: List[List[int]]) -> List[List[int]]:\n        `,
      java: `class Solution {\n    public int[][] rotate(int[][] matrix) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<vector<int>> rotate(vector<vector<int>>& matrix) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'implement-queue-using-stacks',
    leetcodeId: 232,
    title: 'Implement Queue using Stacks',
    difficulty: 'easy',
    tags: ['Stack', 'Queue', 'Design'],
    acceptance: 68.5,
    functionName: 'simulateQueue',
    paramOrder: ['operations', 'values'],
    description: `Simulate a queue using stacks. Given \`operations\` array of \`"push"\`, \`"pop"\`, \`"peek"\`, \`"empty"\` and corresponding \`values\`, return outputs for each operation.`,
    examples: [
      { input: 'operations = ["push","push","peek","pop","empty"], values = [1,2,null,null,null]', output: '[null,null,1,1,false]' },
    ],
    constraints: ['1 <= operations.length <= 100'],
    testCases: [
      {
        input: { operations: ['push', 'push', 'peek', 'pop', 'empty'], values: [1, 2, null, null, null] },
        expected: [null, null, 1, 1, false],
      },
      { input: { operations: ['push', 'pop', 'empty'], values: [5, null, null] }, expected: [null, 5, true], hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {string[]} operations\n * @param {any[]} values\n * @return {any[]}\n */\nvar simulateQueue = function(operations, values) {\n    const stack1 = [], stack2 = [];\n    const results = [];\n    // Implement queue using two stacks\n    \n};`,
      python: `class Solution:\n    def simulateQueue(self, operations: List[str], values: List) -> List:\n        `,
      java: `class Solution {\n    public Object[] simulateQueue(String[] operations, Object[] values) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    vector<any> simulateQueue(vector<string>& operations, vector<any>& values) {\n        \n    }\n};`,
    },
  },
  {
    slug: 'single-number',
    leetcodeId: 136,
    title: 'Single Number',
    difficulty: 'easy',
    tags: ['Array', 'Bit Manipulation'],
    acceptance: 76.4,
    functionName: 'singleNumber',
    paramOrder: ['nums'],
    description: `Given a non-empty array of integers \`nums\`, every element appears twice except for one. Find that single one.

You must implement a solution with linear runtime and use only constant extra space.`,
    examples: [
      { input: 'nums = [2,2,1]', output: '1' },
      { input: 'nums = [4,1,2,1,2]', output: '4' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', 'Each element appears twice except for one.'],
    testCases: [
      { input: { nums: [2, 2, 1] }, expected: 1 },
      { input: { nums: [4, 1, 2, 1, 2] }, expected: 4 },
      { input: { nums: [1] }, expected: 1, hidden: true },
    ],
    templates: {
      javascript: `/**\n * @param {number[]} nums\n * @return {number}\n */\nvar singleNumber = function(nums) {\n    \n};`,
      python: `class Solution:\n    def singleNumber(self, nums: List[int]) -> int:\n        `,
      java: `class Solution {\n    public int singleNumber(int[] nums) {\n        \n    }\n}`,
      cpp: `class Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        \n    }\n};`,
    },
  },
];
