import { runCodeAsync } from '../src/services/codeRunner.js';
import { PROBLEMS } from '../src/data/leetcodeProblems.js';

const problem = PROBLEMS.find((p) => p.functionName === 'maxProfitOnce');
const code = `class Solution {
    public int maxProfitOnce(int[] prices) {
        int min = prices[0], max = 0;
        for (int p : prices) {
            min = Math.min(min, p);
            max = Math.max(max, p - min);
        }
        return max;
    }
}`;

const r = await runCodeAsync('java', code, problem);
console.log(JSON.stringify(r, null, 2));
