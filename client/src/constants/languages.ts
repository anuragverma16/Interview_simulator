export const CODING_LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', abbr: 'JS', monaco: 'javascript', color: 'from-yellow-500 to-amber-600' },
  { id: 'python', label: 'Python', abbr: 'PY', monaco: 'python', color: 'from-blue-500 to-cyan-600' },
  { id: 'java', label: 'Java', abbr: 'JV', monaco: 'java', color: 'from-red-500 to-orange-600' },
  { id: 'cpp', label: 'C++', abbr: 'C++', monaco: 'cpp', color: 'from-indigo-500 to-purple-600' },
  { id: 'c', label: 'C', abbr: 'C', monaco: 'c', color: 'from-slate-500 to-gray-600' },
] as const;

export type CodingLanguageId = (typeof CODING_LANGUAGES)[number]['id'];

/** Default language for practice problems and new coding sessions */
export const DEFAULT_CODING_LANGUAGE: CodingLanguageId = 'java';

export const MONACO_LANG_MAP: Record<string, string> = Object.fromEntries(
  CODING_LANGUAGES.map((l) => [l.id, l.monaco])
);
