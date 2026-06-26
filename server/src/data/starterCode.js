/**
 * LeetCode-style starter code for JavaScript, Python, Java, C++, and C.
 */

const PARAM_TYPE_HINTS = {
  nums: 'int[]',
  prices: 'int[]',
  heights: 'int[]',
  mat: 'int[][]',
  grid: 'char[][]',
  target: 'int',
  k: 'int',
  n: 'int',
  x: 'int',
  s: 'string',
  word: 'string',
  pattern: 'string',
  a: 'int',
  b: 'int',
};

const RETURN_HINTS = {
  countPairs: 'int',
  findMax: 'int',
  reverseArray: 'int[]',
  arraySum: 'int',
  isPalindrome: 'bool',
  factorial: 'int',
  fibonacci: 'int',
  twoSumVariant: 'int[]',
  containsDuplicate: 'bool',
  productExceptSelf: 'int[]',
  climbStairs: 'int',
  maxProfitOnce: 'int',
  reverseString: 'string',
  isAnagram: 'bool',
  rotateMatrix: 'int[][]',
  findMissing: 'int',
  power: 'int',
  sortArray: 'int[]',
  longestIncreasing: 'int',
  countIslandsMini: 'int',
  isPalindromeStr: 'bool',
  searchExists: 'bool',
  removeDuplicates: 'int[]',
  climbWays: 'int',
  isValidBracket: 'bool',
  countVowels: 'int',
  diagonalSum: 'int',
  singleXor: 'int',
  mergeSorted: 'int[]',
  hasDuplicate: 'bool',
  longestRun: 'int',
};

function inferParamType(name) {
  return PARAM_TYPE_HINTS[name] || 'int';
}

function inferReturnType(functionName, paramOrder, testCases) {
  if (RETURN_HINTS[functionName]) return RETURN_HINTS[functionName];
  if (testCases?.[0]) {
    const exp = testCases[0].expected;
    if (Array.isArray(exp)) {
      if (exp.length && Array.isArray(exp[0])) return 'int[][]';
      if (exp.length && typeof exp[0] === 'string') return 'string[]';
      return 'int[]';
    }
    if (typeof exp === 'boolean') return 'bool';
    if (typeof exp === 'string') return 'string';
    return 'int';
  }
  return 'int';
}

function jsType(t) {
  if (t === 'int[]') return 'number[]';
  if (t === 'int[][]') return 'number[][]';
  if (t === 'char[][]') return 'character[][]';
  if (t === 'string') return 'string';
  if (t === 'bool') return 'boolean';
  if (t === 'int') return 'number';
  return 'number';
}

function pyType(t) {
  if (t === 'int[]') return 'List[int]';
  if (t === 'int[][]') return 'List[List[int]]';
  if (t === 'char[][]') return 'List[List[str]]';
  if (t === 'string') return 'str';
  if (t === 'bool') return 'bool';
  return 'int';
}

function javaType(t) {
  if (t === 'int[]') return 'int[]';
  if (t === 'int[][]') return 'int[][]';
  if (t === 'char[][]') return 'char[][]';
  if (t === 'string') return 'String';
  if (t === 'bool') return 'boolean';
  return 'int';
}

function cppType(t) {
  if (t === 'int[]') return 'vector<int>&';
  if (t === 'int[][]') return 'vector<vector<int>>&';
  if (t === 'char[][]') return 'vector<vector<char>>&';
  if (t === 'string') return 'string';
  if (t === 'bool') return 'bool';
  return 'int';
}

function cType(t) {
  if (t === 'int[]') return 'int*';
  if (t === 'int[][]') return 'int**';
  if (t === 'char[][]') return 'char**';
  if (t === 'string') return 'char*';
  if (t === 'bool') return 'bool';
  return 'int';
}

function cReturnType(t) {
  if (t === 'int[]') return 'int*';
  if (t === 'int[][]') return 'int**';
  if (t === 'string') return 'char*';
  if (t === 'bool') return 'bool';
  return 'int';
}

function cSizeParam(name, type) {
  if (type === 'int[]') return [{ name: `${name}Size`, type: 'int' }];
  if (type === 'int[][]' || type === 'char[][]') {
    return [
      { name: `${name}Size`, type: 'int' },
      { name: `${name}ColSize`, type: 'int' },
    ];
  }
  return [];
}

function buildParams(paramOrder, testCases) {
  return paramOrder.map((name) => ({
    name,
    type: inferParamType(name),
  }));
}

export function buildStarterTemplates(functionName, paramOrder, testCases) {
  const params = buildParams(paramOrder, testCases);
  const returnType = inferReturnType(functionName, paramOrder, testCases);

  const jsParams = params.map((p) => `@param {${jsType(p.type)}} ${p.name}`).join('\n * ');
  const jsSig = params.map((p) => p.name).join(', ');

  const pyParams = params.map((p) => `${p.name}: ${pyType(p.type)}`).join(', ');
  const pyRet = pyType(returnType === 'bool' ? 'bool' : returnType === 'string' ? 'string' : returnType === 'int[]' ? 'List[int]' : returnType === 'int[][]' ? 'List[List[int]]' : 'int');

  const javaParams = params.map((p) => `${javaType(p.type)} ${p.name}`).join(', ');
  const cppParams = params.map((p) => `${cppType(p.type)} ${p.name}`).join(', ');

  const cExtra = [];
  const cParams = [];
  for (const p of params) {
    cParams.push(`${cType(p.type)} ${p.name}`);
    cExtra.push(...cSizeParam(p.name, p.type));
  }
  if (returnType === 'int[]' || returnType === 'int[][]') {
    cExtra.push({ name: 'returnSize', type: 'int' });
  }
  const cParamStr = [...cParams, ...cExtra.map((e) => `${e.type} ${e.name}`)].join(', ');

  return {
    javascript: `/**\n * ${jsParams}\n * @return {${jsType(returnType)}}\n */\nvar ${functionName} = function(${jsSig}) {\n    \n};`,
    python: `class Solution:\n    def ${functionName}(self, ${pyParams}) -> ${pyRet}:\n        `,
    java: `class Solution {\n    public ${javaType(returnType)} ${functionName}(${javaParams}) {\n        \n    }\n}`,
    cpp: `class Solution {\npublic:\n    ${cppType(returnType)} ${functionName}(${cppParams}) {\n        \n    }\n};`,
    c: `${cReturnType(returnType)} ${functionName}(${cParamStr}) {\n    \n}`,
  };
}

function formatExampleInput(tc, paramOrder) {
  return paramOrder.map((p) => `${p} = ${JSON.stringify(tc.input[p])}`).join(', ');
}

const TASK_DESCRIPTIONS = {
  countPairs: () => `Given an integer array \`nums\` and an integer \`target\`, return the number of unique index pairs \`(i, j)\` such that \`i < j\` and \`nums[i] + nums[j] == target\`.

Each pair of indices counts once. Order matters only in the sense that \`i\` must be strictly less than \`j\`.`,
  findMax: () => `Given an integer array \`nums\`, return the maximum value among all elements.

If the array contains a single element, that element is the answer.`,
  reverseArray: () => `Given an integer array \`nums\`, return a **new** array that contains the same elements in reverse order.

The original array should remain unchanged.`,
  arraySum: () => `Given an integer array \`nums\`, return the sum of all elements in the array.

An empty array has sum \`0\`.`,
  isPalindromeStr: () => `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string \`s\`, return \`true\` if it is a palindrome, or \`false\` otherwise.`,
  factorial: () => `Given a non-negative integer \`n\`, return \`n!\` (n factorial).

By definition, \`0! = 1\`.`,
  fibonacci: () => `The Fibonacci numbers are defined as:

• \`F(0) = 0\`
• \`F(1) = 1\`
• \`F(n) = F(n - 1) + F(n - 2)\` for \`n > 1\`

Given \`n\`, return \`F(n)\`.`,
  searchExists: () => `Given a **sorted** integer array \`nums\` in ascending order and an integer \`target\`, return \`true\` if \`target\` exists in \`nums\`, or \`false\` otherwise.

You may assume the array has no duplicate values unless stated in the examples.`,
  removeDuplicates: () => `Given a sorted integer array \`nums\` in non-decreasing order, remove the duplicate values and return a new array where each distinct value appears exactly once.

The relative order of the elements must be kept.`,
  findMissing: () => `Given an array \`nums\` containing \`n\` distinct numbers in the range \`[0, n]\`, return the only number in the range that is missing from the array.`,
  climbWays: () => `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can climb either \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
  maxProfitOnce: () => `You are given an array \`prices\` where \`prices[i]\` is the price of a given stock on the \`i\`th day.

You want to maximize your profit by choosing a **single day** to buy one stock and choosing a **different day in the future** to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return \`0\`.`,
  isValidBracket: () => `Given a string \`s\` containing only the characters \`(\`, \`)\`, \`{\`, \`}\`, \`[\` and \`]\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets are closed by the same type of brackets.
2. Open brackets are closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
  countVowels: () => `Given a string \`s\`, return the number of vowels in the string.

Vowels are \`a\`, \`e\`, \`i\`, \`o\`, and \`u\` (both uppercase and lowercase count).`,
  diagonalSum: () => `Given a square matrix \`mat\`, return the sum of the elements on the main diagonal.

The main diagonal consists of positions \`(0,0), (1,1), (2,2), ...\`.`,
  singleXor: () => `Given a non-empty integer array \`nums\`, every element appears **twice** except for one element which appears only once.

Find and return that single element.`,
  mergeSorted: () => `You are given two integer arrays \`a\` and \`b\`, both sorted in **non-decreasing** order.

Merge them into one sorted array and return the result. The returned array should also be sorted in non-decreasing order.`,
  hasDuplicate: () => `Given an integer array \`nums\`, return \`true\` if any value appears **at least twice** in the array, or \`false\` if every element is distinct.`,
  longestRun: () => `Given an unsorted integer array \`nums\`, return the length of the longest contiguous subarray where each element is exactly \`1\` greater than the previous element.

For example, in \`[1, 2, 3, 2, 5]\`, the longest such subarray is \`[1, 2, 3]\` with length \`3\`.`,
  countIslandsMini: () => `Given a 2D grid \`grid\` of \`'1'\`s (land) and \`'0'\`s (water), count the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.`,
};

function bestStockProfit(prices) {
  let minP = prices[0];
  let minI = 0;
  let best = 0;
  let buy = 0;
  let sell = 0;
  for (let i = 0; i < prices.length; i++) {
    if (prices[i] < minP) {
      minP = prices[i];
      minI = i;
    }
    const profit = prices[i] - minP;
    if (profit > best) {
      best = profit;
      buy = minI;
      sell = i;
    }
  }
  return { profit: best, buy, sell };
}

function explainExample(functionName, tc, paramOrder) {
  const expected = tc.expected;
  const input = tc.input;

  switch (functionName) {
    case 'maxProfitOnce': {
      const { profit, buy, sell } = bestStockProfit(input.prices);
      if (expected === 0 || profit === 0) {
        return 'Prices never rise after a prior minimum, so no profitable buy/sell pair exists. Return `0`.';
      }
      return `Buy on day ${buy + 1} (price = \`${input.prices[buy]}\`) and sell on day ${sell + 1} (price = \`${input.prices[sell]}\`). Profit = \`${input.prices[sell]} - ${input.prices[buy]} = ${expected}\`.`;
    }
    case 'countPairs': {
      const { nums, target } = input;
      const pairs = [];
      for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
          if (nums[i] + nums[j] === target) pairs.push(`(${i}, ${j})`);
        }
      }
      if (pairs.length === 0) return `No pair sums to \`${target}\`. Return \`0\`.`;
      return `The valid pairs with \`i < j\` are ${pairs.join(', ')}. Return \`${expected}\`.`;
    }
    case 'findMax':
      return `The largest value in the array is \`${expected}\`.`;
    case 'reverseArray':
      return `Reversing the array gives \`${JSON.stringify(expected)}\`.`;
    case 'arraySum':
      return `The sum of all elements is \`${expected}\`.`;
    case 'isPalindromeStr':
      return expected
        ? 'After normalizing letters and ignoring non-alphanumeric characters, the string reads the same forward and backward.'
        : 'The normalized string is not a palindrome.';
    case 'factorial':
      return `\`${input.n}!\` equals \`${expected}\`.`;
    case 'fibonacci':
      return `The ${input.n}th Fibonacci number is \`${expected}\`.`;
    case 'searchExists':
      return expected
        ? `\`target\` appears in the sorted array.`
        : `\`target\` is not present in the array.`;
    case 'removeDuplicates':
      return `After removing duplicates while preserving order, the result is \`${JSON.stringify(expected)}\`.`;
    case 'findMissing':
      return `The number missing from range \`[0, ${input.nums.length}]\` is \`${expected}\`.`;
    case 'climbWays':
      return `There are \`${expected}\` distinct ways to climb \`${input.n}\` steps when you may take 1 or 2 steps at a time.`;
    case 'isValidBracket':
      return expected
        ? 'Every opening bracket is closed by the same type in the correct order.'
        : 'At least one bracket is unmatched or closed out of order.';
    case 'countVowels':
      return `The string contains \`${expected}\` vowel(s).`;
    case 'diagonalSum':
      return `The main diagonal elements sum to \`${expected}\`.`;
    case 'singleXor':
      return `All values appear twice except \`${expected}\`, which appears once.`;
    case 'mergeSorted':
      return `Merging the two sorted arrays produces \`${JSON.stringify(expected)}\`.`;
    case 'hasDuplicate':
      return expected
        ? 'At least one value appears more than once.'
        : 'Every element in the array is distinct.';
    case 'longestRun':
      return `The longest contiguous strictly increasing-by-1 subarray has length \`${expected}\`.`;
    case 'countIslandsMini':
      return `The grid contains \`${expected}\` separate island(s) of land.`;
    default:
      return `For the given input, the correct output is \`${JSON.stringify(expected)}\`.`;
  }
}

function buildConstraintList(paramOrder, functionName) {
  const constraints = [];
  for (const p of paramOrder) {
    const t = inferParamType(p);
    if (t === 'int[]') constraints.push(`1 <= ${p}.length <= 10^4`);
    else if (t === 'int[][]') constraints.push(`1 <= ${p}.length, ${p}[0].length <= 300`);
    else if (t === 'char[][]') constraints.push(`m == ${p}.length`, `n == ${p}[i].length`, `${p}[i][j] is '0' or '1'`);
    else if (t === 'string') constraints.push(`1 <= ${p}.length <= 10^4`);
    else if (t === 'int') {
      if (p === 'n' && ['factorial', 'climbWays', 'fibonacci'].includes(functionName)) {
        constraints.push(`0 <= ${p} <= 45`);
      } else {
        constraints.push(`-10^9 <= ${p} <= 10^9`);
      }
    }
  }
  if (functionName === 'maxProfitOnce') {
    constraints.push('1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4');
  }
  if (functionName === 'findMissing') {
    constraints.push('n == nums.length');
  }
  if (functionName === 'mergeSorted') {
    constraints.push('a and b are sorted in non-decreasing order');
  }
  return constraints;
}

function buildLeetCodeDescription(problem) {
  const { description, functionName } = problem;
  const builder = TASK_DESCRIPTIONS[functionName];
  if (builder) return builder(problem);
  if (description.length > 80) return description;
  return description;
}

function buildRichExamples(problem) {
  const { paramOrder, testCases, examples, functionName } = problem;
  const visible = testCases.filter((tc) => !tc.hidden);

  if (examples?.length >= 2 && examples.every((e) => e.input && e.output)) {
    return examples.map((ex, i) => ({
      ...ex,
      explanation: ex.explanation || explainExample(functionName, visible[i] || visible[0], paramOrder),
    }));
  }

  return visible.slice(0, Math.min(3, visible.length)).map((tc) => ({
    input: formatExampleInput(tc, paramOrder),
    output: JSON.stringify(tc.expected),
    explanation: explainExample(functionName, tc, paramOrder),
  }));
}

export function enrichGeneratedProblem(problem) {
  const { paramOrder, testCases, functionName } = problem;
  const parameters = buildParams(paramOrder, testCases);
  const returnType = inferReturnType(functionName, paramOrder, testCases);
  const templates = buildStarterTemplates(functionName, paramOrder, testCases);

  return {
    ...problem,
    description: buildLeetCodeDescription(problem),
    examples: buildRichExamples(problem),
    constraints: problem.constraints?.length ? problem.constraints : buildConstraintList(paramOrder, functionName),
    templates,
    returnType,
    parameters,
  };
}
