import vm from 'vm';
import { spawn } from 'child_process';
import { writeFile, unlink, mkdir, rm, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { tmpdir, homedir } from 'os';
import { randomUUID } from 'crypto';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { JavaCaller } = require('java-caller');

const EXE_EXT = process.platform === 'win32' ? '.exe' : '';

let javaToolsPromise = null;

/** JDKs previously downloaded by java-caller live under ~/.java-caller/jre/<version>/bin. */
async function findDownloadedJdk() {
  const jreRoot = join(homedir(), '.java-caller', 'jre');
  try {
    const entries = await readdir(jreRoot);
    for (const entry of entries.sort().reverse()) {
      const bin = join(jreRoot, entry, 'bin');
      const javac = join(bin, `javac${EXE_EXT}`);
      if (existsSync(javac)) {
        return { java: join(bin, `java${EXE_EXT}`), javac };
      }
    }
  } catch {
    // no downloaded JDK yet
  }
  return null;
}

async function resolveJavaTools() {
  const downloaded = await findDownloadedJdk();
  if (downloaded) return downloaded;

  // Ask java-caller to locate a system JDK or download one
  const caller = new JavaCaller({
    minimumJavaVersion: 17,
    maximumJavaVersion: 21,
    javaType: 'jdk',
  });
  await caller.run(['-version']).catch(() => {});
  const javaExe = (caller.javaExecutableFromNodeJavaCaller || caller.javaExecutable || '').replace(/"/g, '');

  if (javaExe && javaExe !== 'java') {
    const javacExe = javaExe.replace(/java(w)?(\.exe)?$/i, (_m, _w, ext) => `javac${ext || ''}`);
    if (existsSync(javacExe)) {
      return { java: javaExe, javac: javacExe };
    }
  }

  // java-caller may have downloaded a JDK during run() — check again
  const postDownload = await findDownloadedJdk();
  if (postDownload) return postDownload;

  throw new Error('Java compiler (javac) not available. The JDK download may still be in progress — try again in a minute.');
}

async function ensureJavaTools() {
  if (!javaToolsPromise) {
    javaToolsPromise = resolveJavaTools().catch((err) => {
      // Don't cache failures — allow retry on the next run
      javaToolsPromise = null;
      throw err;
    });
  }
  return javaToolsPromise;
}

function deepEqual(a, b, compareMode) {
  if (compareMode === 'anagramGroups') return compareAnagramGroups(a, b);
  if (compareMode === 'subsets') return compareSubsets(a, b);
  if (compareMode === 'matrix') return JSON.stringify(a) === JSON.stringify(b);
  return JSON.stringify(a) === JSON.stringify(b);
}

function compareAnagramGroups(a, b) {
  const norm = (groups) =>
    groups.map((g) => [...g].sort().join('')).sort().join('|');
  return norm(a) === norm(b);
}

function compareSubsets(a, b) {
  const norm = (subs) =>
    subs.map((s) => [...s].sort((x, y) => x - y).join(',')).sort().join('|');
  return norm(a) === norm(b);
}

function formatInput(input, paramOrder) {
  return paramOrder.map((p) => `${p} = ${JSON.stringify(input[p])}`).join(', ');
}

function buildResultsPayload(results, testCases) {
  const visible = results.filter((r) => !r.hidden);
  const passedCount = results.filter((r) => r.passed).length;
  return {
    passed: passedCount,
    total: results.length,
    visiblePassed: visible.filter((r) => r.passed).length,
    visibleTotal: visible.length,
    allPassed: results.length > 0 && results.every((r) => r.passed),
    results: results.map(({ hidden, ...r }) => (hidden ? { ...r, hidden: true, input: 'Hidden test case' } : r)),
  };
}

function toJavaLiteral(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  if (!Array.isArray(value)) return 'null';

  if (value.length === 0) return 'new int[]{}';

  const first = value[0];
  if (typeof first === 'number') {
    return `new int[]{${value.join(',')}}`;
  }
  if (Array.isArray(first)) {
    if (first.length === 0) return 'new int[][]{}';
    if (typeof first[0] === 'number') {
      const rows = value.map((row) => `new int[]{${row.join(',')}}`).join(',');
      return `new int[][]{${rows}}`;
    }
    if (typeof first[0] === 'string') {
      const rows = value.map((row) =>
        `new char[]{${row.map((c) => `'${String(c).replace(/'/g, "\\'")}'`).join(',')}}`
      ).join(',');
      return `new char[][]{${rows}}`;
    }
  }
  if (typeof first === 'string') {
    if (value.every((s) => typeof s === 'string' && s.length === 1)) {
      const rows = value.map((row) =>
        `new char[]{${row.split('').map((c) => `'${c}'`).join(',')}}`
      ).join(',');
      return `new char[][]{${rows}}`;
    }
    return `new String[]{${value.map((s) => toJavaLiteral(s)).join(',')}}`;
  }
  return 'null';
}

const JAVA_JSON_HELPER = `
  static String toJson(Object o) {
    if (o == null) return "null";
    if (o instanceof Boolean) return ((Boolean) o).toString();
    if (o instanceof Integer || o instanceof Long || o instanceof Double || o instanceof Float) return String.valueOf(o);
    if (o instanceof String) {
      String s = (String) o;
      return "\\"" + s.replace("\\\\", "\\\\\\\\").replace("\\"", "\\\\\\"") + "\\"";
    }
    if (o instanceof int[]) {
      int[] a = (int[]) o;
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < a.length; i++) {
        if (i > 0) sb.append(',');
        sb.append(a[i]);
      }
      return sb.append(']').toString();
    }
    if (o instanceof int[][]) {
      int[][] m = (int[][]) o;
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < m.length; i++) {
        if (i > 0) sb.append(',');
        sb.append('[');
        for (int j = 0; j < m[i].length; j++) {
          if (j > 0) sb.append(',');
          sb.append(m[i][j]);
        }
        sb.append(']');
      }
      return sb.append(']').toString();
    }
    if (o instanceof char[][]) {
      char[][] m = (char[][]) o;
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < m.length; i++) {
        if (i > 0) sb.append(',');
        sb.append('[');
        for (int j = 0; j < m[i].length; j++) {
          if (j > 0) sb.append(',');
          sb.append('"').append(m[i][j]).append('"');
        }
        sb.append(']');
      }
      return sb.append(']').toString();
    }
    if (o instanceof String[]) {
      String[] a = (String[]) o;
      StringBuilder sb = new StringBuilder("[");
      for (int i = 0; i < a.length; i++) {
        if (i > 0) sb.append(',');
        sb.append(toJson(a[i]));
      }
      return sb.append(']').toString();
    }
    return String.valueOf(o);
  }
`;

function buildJavaSource(userCode, functionName, argsLiteral) {
  return `import java.util.*;

${userCode}

class Main {
${JAVA_JSON_HELPER}

  public static void main(String[] args) throws Exception {
    Solution sol = new Solution();
    Object result = sol.${functionName}(${argsLiteral});
    System.out.println(toJson(result));
  }
}
`;
}

function execProcess(command, args, cwd, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, timeout: timeoutMs, shell: false });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code !== 0) {
        const msg = (stderr || stdout).trim();
        reject(new Error(msg.split('\n').slice(-3).join(' ') || `${command} failed`));
        return;
      }
      resolve(stdout.trim());
    });
    proc.on('error', (err) => {
      reject(new Error(err.code === 'ENOENT'
        ? `${command} not found. Install JDK for Java or Python 3 for Python.`
        : err.message));
    });
  });
}

function resolveJavaCommands() {
  if (process.env.JAVA_HOME) {
    const bin = join(process.env.JAVA_HOME, 'bin');
    const ext = process.platform === 'win32' ? '.exe' : '';
    return { javac: join(bin, `javac${ext}`), java: join(bin, `java${ext}`) };
  }
  return null;
}

async function runSingleJavaTest(code, functionName, paramOrder, tc) {
  const argsLiteral = paramOrder.map((p) => toJavaLiteral(tc.input[p])).join(', ');
  const source = buildJavaSource(code, functionName, argsLiteral);
  const dir = join(tmpdir(), `iq-java-${randomUUID()}`);

  try {
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'Main.java'), source);

    const local = resolveJavaCommands();
    let javac = local?.javac || 'javac';
    let java = local?.java || 'java';

    try {
      await execProcess(javac, ['Main.java'], dir);
    } catch (localErr) {
      const isMissing = /not found|ENOENT/i.test(localErr.message);
      if (!isMissing) throw localErr;
      const tools = await ensureJavaTools();
      javac = tools.javac;
      java = tools.java;
      await execProcess(javac, ['Main.java'], dir);
    }

    const stdout = await execProcess(java, ['-cp', dir, 'Main'], dir);
    return JSON.parse(stdout);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function runJava(code, functionName, paramOrder, testCases) {
  const results = [];
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      const actual = await runSingleJavaTest(code, functionName, paramOrder, tc);
      const passed = deepEqual(actual, tc.expected, tc.compare);
      results.push({
        index: i + 1,
        passed,
        input: formatInput(tc.input, paramOrder),
        expected: JSON.stringify(tc.expected),
        actual: JSON.stringify(actual),
        hidden: !!tc.hidden,
        runtime: '< 12s',
      });
    } catch (err) {
      results.push({
        index: i + 1,
        passed: false,
        input: formatInput(tc.input, paramOrder),
        expected: JSON.stringify(tc.expected),
        actual: null,
        error: err.message,
        hidden: !!tc.hidden,
      });
    }
  }
  return buildResultsPayload(results, testCases);
}

export function runCode(language, code, problem) {
  const { functionName, paramOrder, testCases } = problem;

  if (language === 'javascript') {
    return runJavaScript(code, functionName, paramOrder, testCases);
  }
  if (language === 'python') {
    return {
      passed: 0,
      total: testCases.length,
      allPassed: false,
      results: [],
      error: 'Python runs asynchronously — use runCodeAsync.',
    };
  }
  if (language === 'java') {
    return {
      passed: 0,
      total: testCases.length,
      allPassed: false,
      results: [],
      error: 'Java runs asynchronously — use runCodeAsync.',
    };
  }
  return {
    passed: 0,
    total: testCases.length,
    allPassed: false,
    results: [],
    error: `Execution for ${language} is not supported yet. Use Java, JavaScript, or Python.`,
  };
}

function runJavaScript(code, functionName, paramOrder, testCases) {
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      const args = paramOrder.map((p) => tc.input[p]);
      const argsStr = args.map((a) => JSON.stringify(a)).join(', ');
      const sandbox = {
        result: undefined,
        JSON,
        Math,
        Array,
        Object,
        Map,
        Set,
        String,
        Number,
        Boolean,
        parseInt,
        parseFloat,
        Infinity,
        NaN,
        Error,
      };

      const script = new vm.Script(`
        "use strict";
        ${code}
        if (typeof ${functionName} !== 'function') {
          throw new Error('Function ${functionName} is not defined. Use the provided template.');
        }
        result = ${functionName}(${argsStr});
      `);

      script.runInNewContext(sandbox, { timeout: 3000 });
      const actual = sandbox.result;
      const passed = deepEqual(actual, tc.expected, tc.compare);

      results.push({
        index: i + 1,
        passed,
        input: formatInput(tc.input, paramOrder),
        expected: JSON.stringify(tc.expected),
        actual: JSON.stringify(actual),
        hidden: !!tc.hidden,
        runtime: '< 3s',
      });
    } catch (err) {
      results.push({
        index: i + 1,
        passed: false,
        input: formatInput(tc.input, paramOrder),
        expected: JSON.stringify(tc.expected),
        actual: null,
        error: err.message,
        hidden: !!tc.hidden,
      });
    }
  }

  return buildResultsPayload(results, testCases);
}

function pythonCommand() {
  return process.platform === 'win32' ? 'python' : 'python3';
}

function runPython(code, functionName, paramOrder, testCases) {
  return runPythonSync(code, functionName, paramOrder, testCases).catch((err) => ({
    passed: 0,
    total: testCases.length,
    allPassed: false,
    results: [],
    error: err.message || 'Python execution failed. Ensure Python 3 is installed.',
  }));
}

async function runPythonSync(code, functionName, paramOrder, testCases) {
  const results = [];
  const classMatch = code.match(/class Solution/);
  const pyHeader = 'from typing import List, Optional\nimport json, sys\n';
  const wrappedBase = classMatch
    ? `${pyHeader}${code}\nsol = Solution()`
    : `${pyHeader}${code}`;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const args = paramOrder.map((p) => JSON.stringify(tc.input[p])).join(', ');
    const call = classMatch
      ? `result = sol.${functionName}(${args})`
      : `result = ${functionName}(${args})`;

    const pyCode = `${wrappedBase}\n${call}\nprint(json.dumps(result))`;
    const filePath = join(tmpdir(), `iq-${randomUUID()}.py`);

    try {
      await writeFile(filePath, pyCode);
      const actual = await execPython(filePath);
      const passed = deepEqual(actual, tc.expected, tc.compare);
      results.push({
        index: i + 1,
        passed,
        input: formatInput(tc.input, paramOrder),
        expected: JSON.stringify(tc.expected),
        actual: JSON.stringify(actual),
        hidden: !!tc.hidden,
      });
    } catch (err) {
      results.push({
        index: i + 1,
        passed: false,
        input: formatInput(tc.input, paramOrder),
        expected: JSON.stringify(tc.expected),
        actual: null,
        error: err.message,
        hidden: !!tc.hidden,
      });
    } finally {
      await unlink(filePath).catch(() => {});
    }
  }

  return buildResultsPayload(results, testCases);
}

function execPython(filePath) {
  const cmd = pythonCommand();
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, [filePath], { timeout: 8000 });
    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d) => { stdout += d.toString(); });
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || 'Python runtime error'));
        return;
      }
      try {
        resolve(JSON.parse(stdout.trim()));
      } catch {
        reject(new Error(`Invalid output: ${stdout.trim()}`));
      }
    });
    proc.on('error', () => reject(new Error('Python not found. Install Python 3 or use Java/JavaScript.')));
  });
}

export async function runCodeAsync(language, code, problem) {
  const { functionName, paramOrder, testCases } = problem;
  if (language === 'python') {
    return runPython(code, functionName, paramOrder, testCases);
  }
  if (language === 'java') {
    return runJava(code, functionName, paramOrder, testCases);
  }
  return runCode(language, code, problem);
}

function buildLocalFeedback(runResults) {
  const score = runResults.total > 0
    ? Math.round((runResults.passed / runResults.total) * 100)
    : 0;
  return {
    correctness: runResults.allPassed ? 100 : score,
    efficiency: runResults.allPassed ? 'Good' : 'Needs improvement',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    suggestions: runResults.allPassed ? [] : ['Review failing test cases and edge cases'],
    score: runResults.allPassed ? 90 : Math.min(70, score),
  };
}

export async function warmJavaRuntime() {
  try {
    await ensureJavaTools();
    console.log('Java runtime ready for coding submissions');
  } catch (err) {
    console.warn('Java warmup skipped:', err.message);
  }
}

export { buildLocalFeedback };
