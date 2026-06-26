import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type ThemeMode = 'dark' | 'light';
export type TextSize = 'small' | 'medium' | 'large';

export interface DisplaySettings {
  theme: ThemeMode;
  textSize: TextSize;
  showParticles: boolean;
  reduceMotion: boolean;
}

const STORAGE_KEY = 'interviewiq-display-settings';

const defaults: DisplaySettings = {
  theme: 'dark',
  textSize: 'medium',
  showParticles: true,
  reduceMotion: false,
};

function loadStored(): DisplaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaults, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaults;
}

function applyToDocument(s: DisplaySettings) {
  const root = document.documentElement;
  root.classList.remove('theme-dark', 'theme-light', 'reduce-motion');
  root.classList.add(s.theme === 'light' ? 'theme-light' : 'theme-dark');
  if (s.reduceMotion) root.classList.add('reduce-motion');
}

export const CODING_FONT_SIZES: Record<TextSize, number> = {
  small: 13,
  medium: 14,
  large: 18,
};

export function getCodingFontSize(size: TextSize): number {
  return CODING_FONT_SIZES[size];
}

interface ThemeContextType extends DisplaySettings {
  setTheme: (theme: ThemeMode) => void;
  setTextSize: (size: TextSize) => void;
  setShowParticles: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  updateDisplay: (patch: Partial<DisplaySettings>) => void;
  syncFromUser: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<DisplaySettings>(loadStored);

  const persist = useCallback((next: DisplaySettings) => {
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    applyToDocument(next);
  }, []);

  useEffect(() => {
    applyToDocument(settings);
  }, [settings]);

  useEffect(() => {
    if (user?.settings) {
      const fromUser: DisplaySettings = {
        theme: (user.settings.theme as ThemeMode) || defaults.theme,
        textSize: (user.settings.textSize as TextSize) || defaults.textSize,
        showParticles: user.settings.showParticles ?? defaults.showParticles,
        reduceMotion: user.settings.reduceMotion ?? defaults.reduceMotion,
      };
      persist(fromUser);
    }
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateDisplay = (patch: Partial<DisplaySettings>) => {
    persist({ ...settings, ...patch });
  };

  const syncFromUser = () => {
    if (user?.settings) {
      persist({
        theme: (user.settings.theme as ThemeMode) || settings.theme,
        textSize: (user.settings.textSize as TextSize) || settings.textSize,
        showParticles: user.settings.showParticles ?? settings.showParticles,
        reduceMotion: user.settings.reduceMotion ?? settings.reduceMotion,
      });
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        ...settings,
        setTheme: (theme) => updateDisplay({ theme }),
        setTextSize: (textSize) => updateDisplay({ textSize }),
        setShowParticles: (showParticles) => updateDisplay({ showParticles }),
        setReduceMotion: (reduceMotion) => updateDisplay({ reduceMotion }),
        updateDisplay,
        syncFromUser,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
