import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { applyThemeToDocument, type ThemeMode } from '../utils/theme';

export type { ThemeMode };
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
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
      return {
        theme: parsed.theme === 'light' ? 'light' : 'dark',
        textSize: parsed.textSize || defaults.textSize,
        showParticles: parsed.showParticles ?? defaults.showParticles,
        reduceMotion: parsed.reduceMotion ?? defaults.reduceMotion,
      };
    }
  } catch { /* ignore */ }
  return defaults;
}

function applyToDocument(s: DisplaySettings) {
  applyThemeToDocument(s.theme);
  const root = document.documentElement;
  root.classList.remove('reduce-motion');
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
    if (!user?.settings) return;
    persist({
      theme: 'dark',
      textSize: (user.settings.textSize as TextSize) || defaults.textSize,
      showParticles: user.settings.showParticles ?? defaults.showParticles,
      reduceMotion: user.settings.reduceMotion ?? defaults.reduceMotion,
    });
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user) {
      persist({ ...loadStored(), theme: 'dark' });
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

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
