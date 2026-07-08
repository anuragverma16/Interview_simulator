export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'interviewiq-display-settings';

export function applyThemeToDocument(theme: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light');
  root.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
}

export function forceDarkTheme() {
  applyThemeToDocument('dark');
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...parsed, theme: 'dark' }));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: 'dark' }));
  }
}
