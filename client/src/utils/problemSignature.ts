type Param = { name: string; type: string };

const JAVA_TYPES: Record<string, string> = {
  'int[]': 'int[]',
  'int[][]': 'int[][]',
  'char[][]': 'char[][]',
  string: 'String',
  bool: 'boolean',
  int: 'int',
};

const JS_TYPES: Record<string, string> = {
  'int[]': 'number[]',
  'int[][]': 'number[][]',
  'char[][]': 'string[][]',
  string: 'string',
  bool: 'boolean',
  int: 'number',
};

const PY_TYPES: Record<string, string> = {
  'int[]': 'List[int]',
  'int[][]': 'List[List[int]]',
  'char[][]': 'List[List[str]]',
  string: 'str',
  bool: 'bool',
  int: 'int',
};

const CPP_TYPES: Record<string, string> = {
  'int[]': 'vector<int>&',
  'int[][]': 'vector<vector<int>>&',
  'char[][]': 'vector<vector<char>>&',
  string: 'string&',
  bool: 'bool',
  int: 'int',
};

function mapType(lang: string, t: string): string {
  const table = lang === 'java' ? JAVA_TYPES
    : lang === 'javascript' ? JS_TYPES
    : lang === 'python' ? PY_TYPES
    : lang === 'cpp' || lang === 'c' ? CPP_TYPES
    : JAVA_TYPES;
  return table[t] || t;
}

export function formatFunctionSignature(
  functionName: string,
  parameters: Param[] | undefined,
  returnType: string | undefined,
  language: string,
): string | null {
  if (!functionName || !parameters?.length) return null;
  const ret = mapType(language, returnType || 'int');
  const params = parameters.map((p) => `${mapType(language, p.type)} ${p.name}`).join(', ');

  if (language === 'python') {
    return `def ${functionName}(self, ${params}) -> ${ret}`;
  }
  if (language === 'javascript') {
    return `function ${functionName}(${parameters.map((p) => p.name).join(', ')}): ${mapType('javascript', returnType || 'int')}`;
  }
  if (language === 'java') {
    return `public ${ret} ${functionName}(${params})`;
  }
  if (language === 'cpp') {
    return `${ret} ${functionName}(${params})`;
  }
  return `${ret} ${functionName}(${params})`;
}
