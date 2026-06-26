import { useState, useEffect } from 'react';
import { Sun, Moon, Type, Eye, Sparkles, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, type ThemeMode, type TextSize } from '../contexts/ThemeContext';
import { userApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FadeInUp from '../components/animations/FadeInUp';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const display = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(user?.settings?.emailNotifications ?? true);
  const [language, setLanguage] = useState(user?.settings?.language || 'en');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.settings) {
      setEmailNotifications(user.settings.emailNotifications ?? true);
      setLanguage(user.settings.language || 'en');
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await userApi.updateSettings({
        settings: {
          emailNotifications,
          language,
          theme: display.theme,
          textSize: display.textSize,
          showParticles: display.showParticles,
          reduceMotion: display.reduceMotion,
        },
      });
      await refreshUser();
      toast.success('Settings saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setLoading(false);
    }
  };

  const themeOptions: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'light', label: 'Light', icon: Sun },
  ];

  const textSizes: { id: TextSize; label: string; sample: string }[] = [
    { id: 'small', label: 'Small', sample: 'Aa' },
    { id: 'medium', label: 'Medium', sample: 'Aa' },
    { id: 'large', label: 'Large', sample: 'Aa' },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <FadeInUp>
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
          <span className="neon-text">Settings</span>
        </h1>
        <p className="text-muted mt-1 text-sm">Appearance, accessibility, and notifications</p>
      </FadeInUp>

      <FadeInUp delay={0.05}>
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Sun className="h-5 w-5 text-amber-400" />
            <h3 className="font-semibold">Theme</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {themeOptions.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => display.setTheme(id)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border-2 px-4 py-4 transition-all',
                  display.theme === id
                    ? 'border-purple-500/60 bg-purple-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </Card>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <Card>
          <div className="flex items-center gap-2 mb-2">
            <Type className="h-5 w-5 text-cyan-400" />
            <h3 className="font-semibold">Coding Editor Text Size</h3>
          </div>
          <p className="text-sm text-muted mb-6">Only affects the coding page — editor, problem description, and test cases.</p>
          <div className="grid grid-cols-3 gap-3">
            {textSizes.map(({ id, label, sample }) => (
              <button
                key={id}
                type="button"
                onClick={() => display.setTextSize(id)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 transition-all',
                  display.textSize === id
                    ? 'border-cyan-500/60 bg-cyan-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                )}
              >
                <span className={cn(
                  'font-bold',
                  id === 'small' && 'text-sm',
                  id === 'medium' && 'text-lg',
                  id === 'large' && 'text-2xl',
                )}>{sample}</span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </Card>
      </FadeInUp>

      <FadeInUp delay={0.15}>
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Eye className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold">Platform Visibility</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between rounded-xl bg-white/5 p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <div>
                  <p className="font-medium text-sm">Background effects</p>
                  <p className="text-xs text-white/40">Particle animation and glow effects</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={display.showParticles}
                onChange={(e) => display.setShowParticles(e.target.checked)}
                className="h-5 w-5 rounded accent-purple-500"
              />
            </label>
            <label className="flex items-center justify-between rounded-xl bg-white/5 p-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <Eye className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="font-medium text-sm">Reduce motion</p>
                  <p className="text-xs text-white/40">Minimize animations for better accessibility</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={display.reduceMotion}
                onChange={(e) => display.setReduceMotion(e.target.checked)}
                className="h-5 w-5 rounded accent-purple-500"
              />
            </label>
          </div>
        </Card>
      </FadeInUp>

      <FadeInUp delay={0.2}>
        <Card>
          <div className="flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-pink-400" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <label className="flex items-center justify-between rounded-xl bg-white/5 p-4 cursor-pointer">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-xs text-white/40">Receive updates about your progress</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-5 w-5 rounded accent-purple-500"
            />
          </label>
        </Card>
      </FadeInUp>

      <FadeInUp delay={0.25}>
        <Card>
          <h3 className="font-semibold mb-4">Language</h3>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-xl glass px-4 py-3 outline-none bg-transparent"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
          </select>
        </Card>
      </FadeInUp>

      <Button onClick={handleSave} loading={loading} size="lg">Save Settings</Button>
    </div>
  );
}
