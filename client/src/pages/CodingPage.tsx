import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Send, Flame, Trophy, RotateCcw, Zap, ChevronDown, Loader2,
} from 'lucide-react';
import { codingApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FadeInUp from '../components/animations/FadeInUp';
import TestResultsPanel from '../components/coding/TestResultsPanel';
import ProblemBank from '../components/coding/ProblemBank';
import DailyStreakPanel from '../components/coding/DailyStreakPanel';
import CertificateModal from '../components/coding/CertificateModal';
import ProblemDetailPanel from '../components/coding/ProblemDetailPanel';
import { MONACO_LANG_MAP, CODING_LANGUAGES, DEFAULT_CODING_LANGUAGE, type CodingLanguageId } from '../constants/languages';
import { useTheme, getCodingFontSize } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import type { CodingSession, CodingStreakData, Certificate } from '../types';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';


interface Props {
  streakOnly?: boolean;
}

export default function CodingPage({ streakOnly = false }: Props) {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const isDailyMode = streakOnly;
  const openingRef = useRef(false);
  const openedFromUrlRef = useRef(false);
  const OPEN_TOAST_ID = 'coding-open';
  const { textSize } = useTheme();
  const editorFontSize = getCodingFontSize(textSize);

  const [session, setSession] = useState<CodingSession | null>(null);
  const [streak, setStreak] = useState<CodingStreakData | null>(null);
  const [language, setLanguage] = useState<CodingLanguageId>(DEFAULT_CODING_LANGUAGE);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [streakLoading, setStreakLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<'description' | 'submissions' | 'results'>('description');
  const [activeTestTab, setActiveTestTab] = useState(0);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [langOpen, setLangOpen] = useState(false);
  const [streakError, setStreakError] = useState<string | null>(null);
  const [problemBankKey, setProblemBankKey] = useState(0);

  const refreshStreak = useCallback(() => {
    setStreakLoading(true);
    codingApi.getStreak()
      .then(({ data }) => setStreak(data.data))
      .catch(() => {})
      .finally(() => setStreakLoading(false));
  }, []);

  useEffect(() => {
    refreshStreak();
    if (!isDailyMode) return undefined;
    setLanguage(DEFAULT_CODING_LANGUAGE);
    const id = setInterval(refreshStreak, 60000);
    return () => clearInterval(id);
  }, [refreshStreak, isDailyMode]);

  const startStreak = useCallback(async (catchUp?: { date: string }) => {
    if (openingRef.current) return;
    if (!catchUp && streak?.todaySolved) {
      toast.error('Streak already done today', { id: OPEN_TOAST_ID });
      return;
    }
    setStreakError(null);
    setLoading(true);
    openingRef.current = true;
    const dailyLang = DEFAULT_CODING_LANGUAGE;
    try {
      const payload = catchUp
        ? { language: dailyLang, catchUp: true, catchUpDate: catchUp.date }
        : { language: dailyLang };
      const { data } = await codingApi.startStreak(payload);
      setSession(data.data.session);
      setCode(data.data.session.code);
      setActivePanel('description');
      toast.success('Problem opened', { id: OPEN_TOAST_ID });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      const message = e.response?.data?.error || 'Failed to open problem';
      setStreakError(message);
    } finally {
      setLoading(false);
      openingRef.current = false;
    }
  }, [streak?.todaySolved]);

  useEffect(() => {
    if (!isDailyMode) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('start') === '1' && streak && !streak.todaySolved && !streak.dailyProblemPending && !streak.dailyProblemExpired && !session && !loading) {
      startStreak();
    }
  }, [isDailyMode, streak, session, loading, startStreak]);

  const diffColor = (d: string) => {
    if (d === 'easy') return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
    if (d === 'medium') return 'text-amber-400 bg-amber-500/20 border-amber-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const startProblem = useCallback(async (slug: string) => {
    if (openingRef.current) return;
    setLoading(true);
    openingRef.current = true;
    try {
      const { data } = await codingApi.start({ language, slug });
      setSession(data.data);
      setCode(data.data.code);
      setActivePanel('description');
      setActiveTestTab(0);
      toast.success('Problem opened', { id: OPEN_TOAST_ID });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Open failed', { id: OPEN_TOAST_ID });
    } finally {
      setLoading(false);
      openingRef.current = false;
    }
  }, [language]);

  useEffect(() => {
    if (isDailyMode || session || loading || openedFromUrlRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('problem');
    if (!slug) return;
    openedFromUrlRef.current = true;
    startProblem(slug);
    params.delete('problem');
    const next = params.toString();
    navigate(next ? `/coding?${next}` : '/coding', { replace: true });
  }, [isDailyMode, session, loading, startProblem, navigate]);

  const changeLanguage = async (lang: string) => {
    if (!session || lang === session.language) {
      setLanguage(lang as CodingLanguageId);
      setLangOpen(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await codingApi.changeSessionLanguage(session._id, lang);
      setSession(data.data);
      setCode(data.data.code);
      setLanguage(lang as CodingLanguageId);
      setLangOpen(false);
      toast.success(`Switched to ${lang}`);
    } catch {
      toast.error('Failed to switch language');
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    if (!session) return;
    setRunning(true);
    setActivePanel('results');
    try {
      const { data } = await codingApi.run(session._id, { code });
      setSession((prev) => prev ? { ...prev, runResults: data.data, code } : prev);
      if (data.data.allPassed) toast.success('✓ All test cases passed!');
      else toast.error(`${data.data.passed}/${data.data.total} passed`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  const submitCode = async () => {
    if (!session) return;
    setLoading(true);
    setActivePanel('results');
    try {
      const { data } = await codingApi.submit(session._id, { code });
      setSession(data.data.session);
      if (data.data.runResults?.allPassed) {
        toast.success('Accepted! 🎉');
        if (data.data.xpEarned) {
          toast.success(`+${data.data.xpEarned} XP`, { icon: '⚡' });
        } else if (data.data.reward?.points) {
          toast.success(`+${data.data.reward.points} XP`, { icon: '⚡' });
        }
        if (data.data.certificate) {
          setCertificate(data.data.certificate);
        }
        refreshStreak();
        refreshUser();
        setProblemBankKey((k) => k + 1);
      } else {
        toast.error('Wrong Answer');
      }
    } catch {
      toast.error('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const resetSession = () => {
    setSession(null);
    setCode('');
    refreshStreak();
    if (isDailyMode) {
      navigate('/coding/daily');
    }
  };

  // ─── Daily streak hub (not practice bank) ────────────────────
  if (isDailyMode && !session) {
    if (streakLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <Loader2 className="h-10 w-10 text-orange-400 animate-spin" />
          <p className="text-white/50">Loading daily streak...</p>
        </div>
      );
    }

    if (!streak) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <p className="text-white/50">Could not load daily streak</p>
          <Button onClick={refreshStreak}>Retry</Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <FadeInUp>
          <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
            Daily <span className="neon-text">Streak</span>
          </h1>
          <p className="text-muted mt-1">
            Admin-scheduled problems also appear here for 24 hours (users only). Daily streak is separate on the Daily tab.
          </p>
        </FadeInUp>
        <FadeInUp delay={0.08}>
          <DailyStreakPanel
            streak={streak}
            onStartDaily={() => startStreak()}
            onStartCatchUp={(date) => startStreak({ date })}
            loading={loading}
          />
        </FadeInUp>
        {streakError && (
          <p className="text-sm text-red-400 text-center">{streakError}</p>
        )}
        <CertificateModal certificate={certificate} onClose={() => setCertificate(null)} />
      </div>
    );
  }

  // ─── Practice problems only (no daily challenge here) ───────
  if (!session && !isDailyMode) {
    return (
      <div className="space-y-6">
        <FadeInUp>
          <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
            Practice <span className="neon-text">Problems</span>
          </h1>
          <p className="text-muted mt-1">Search, filter by data structure, run real test cases. Admin picks show at the top for 24 hours.</p>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          <ProblemBank
            language={language}
            onLanguageChange={(lang) => setLanguage(lang as CodingLanguageId)}
            onSelectProblem={startProblem}
            solvedSlugs={streak?.solvedSlugs || []}
            refreshKey={problemBankKey}
            loading={loading}
          />
        </FadeInUp>

        <CertificateModal certificate={certificate} onClose={() => setCertificate(null)} />
      </div>
    );
  }

  // ─── Active problem workspace ────────────────────────────────
  if (!session) return null;

  const p = session.problem;
  const runResults = session.runResults;
  const visibleTests = p.testCases || [];
  const currentLang = CODING_LANGUAGES.find((l) => l.id === session.language);

  return (
    <div className={cn('space-y-3 coding-workspace', `coding-text-${textSize}`)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {session.mode === 'streak' && (
            <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/30 px-2 py-1 rounded-full">
              <Flame className="h-3 w-3" /> Daily Streak
            </span>
          )}
          {session.mode === 'catchup' && (
            <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-full">
              <Flame className="h-3 w-3" /> Catch-Up
            </span>
          )}
          <span className="text-white/40 text-sm font-mono">#{p.leetcodeId}</span>
          <h2 className="font-bold">{p.title}</h2>
          <span className={cn('text-xs px-2 py-0.5 rounded-full border capitalize', diffColor(p.difficulty))}>{p.difficulty}</span>
          {p.tags?.map((t) => (
            <span key={t} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-white/40">{t}</span>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={resetSession}>
          <RotateCcw className="h-4 w-4" /> {isDailyMode ? 'Dashboard' : 'Exit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
        <Card className="!p-0 overflow-hidden flex flex-col">
          <div className="flex border-b border-white/10 text-sm">
            {(['description', 'results'] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                className={cn(
                  'flex-1 px-4 py-3 font-medium capitalize transition-all',
                  activePanel === panel ? 'bg-purple-500/10 text-purple-300 border-b-2 border-purple-500' : 'text-white/40 hover:text-white'
                )}
              >
                {panel === 'results' ? `Test Result${runResults ? ` (${runResults.passed}/${runResults.total})` : ''}` : 'Description'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {activePanel === 'description' ? (
                <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ProblemDetailPanel
                    description={p.description}
                    examples={p.examples}
                    constraints={p.constraints}
                    functionName={p.functionName}
                    returnType={p.returnType}
                    parameters={p.parameters}
                    language={session.language}
                  />
                </motion.div>
              ) : (
                <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TestResultsPanel
                    results={runResults?.results || []}
                    passed={runResults?.passed || 0}
                    total={runResults?.total || 0}
                    allPassed={runResults?.allPassed}
                    loading={running}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        <Card className="!p-0 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/40 transition-colors"
              >
                <span className="text-white/70">{currentLang?.label || session.language}</span>
                <ChevronDown className={cn('h-3 w-3 text-white/40 transition-transform', langOpen && 'rotate-180')} />
              </button>
              {langOpen && (
                <div className="absolute top-full left-0 mt-1 z-20 min-w-[140px] rounded-xl bg-[#1a1a27] border border-white/10 shadow-xl py-1">
                  {CODING_LANGUAGES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => changeLanguage(l.id)}
                      className={cn(
                        'w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors',
                        session.language === l.id ? 'text-purple-300' : 'text-white/70'
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {p.functionName && (
              <span className="text-[10px] text-white/30 font-mono hidden sm:block truncate max-w-[200px]">
                {p.functionName}()
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <Button variant="success" size="sm" onClick={runCode} loading={running}>
                <Play className="h-3 w-3" /> Run
              </Button>
              <Button size="sm" onClick={submitCode} loading={loading}>
                <Send className="h-3 w-3" /> Submit
              </Button>
            </div>
          </div>

          <Editor
            key={`${session.language}-${editorFontSize}`}
            height="340px"
            language={MONACO_LANG_MAP[session.language] || session.language}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || '')}
            options={{
              minimap: { enabled: false },
              fontSize: editorFontSize,
              fontFamily: "'JetBrains Mono', Consolas, monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              automaticLayout: true,
              tabSize: 2,
            }}
          />

          <div className="border-t border-white/10">
            <div className="flex border-b border-white/10 overflow-x-auto">
              {visibleTests.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestTab(i)}
                  className={cn(
                    'px-4 py-2 text-xs font-medium whitespace-nowrap transition-all',
                    activeTestTab === i ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-500/5' : 'text-white/40 hover:text-white'
                  )}
                >
                  Case {i + 1}
                </button>
              ))}
            </div>
            {visibleTests[activeTestTab] && (
              <div className="p-4 coding-mono space-y-2 bg-[#0a0a12]">
                <div>
                  <p className="text-white/40 mb-1">Input:</p>
                  <pre className="text-cyan-300/80 whitespace-pre-wrap">{visibleTests[activeTestTab].input}</pre>
                </div>
                <div>
                  <p className="text-white/40 mb-1">Expected:</p>
                  <pre className="text-emerald-400/80">{visibleTests[activeTestTab].expected}</pre>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-white/10">
            <TestResultsPanel
              results={runResults?.results?.filter((r) => !r.hidden) || []}
              passed={runResults?.passed || 0}
              total={runResults?.total || 0}
              allPassed={runResults?.allPassed}
              loading={running}
            />
          </div>
        </Card>
      </div>

      {session.status === 'submitted' && session.feedback?.score !== undefined && (
        <FadeInUp>
          <Card glow className="!p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className={cn('h-8 w-8', runResults?.allPassed ? 'text-emerald-400' : 'text-amber-400')} />
              <div>
                <h3 className="font-bold text-lg">{runResults?.allPassed ? 'Accepted' : 'Try Again'}</h3>
                <p className="text-sm text-white/50">AI Score: {session.feedback.score}/100 · {session.feedback.timeComplexity} time · {session.feedback.spaceComplexity} space</p>
              </div>
            </div>
            <ul className="space-y-1 mb-4">
              {session.feedback.suggestions?.map((s, i) => (
                <li key={i} className="text-sm text-white/60 flex gap-2"><Zap className="h-3 w-3 text-purple-400 shrink-0 mt-1" />{s}</li>
              ))}
            </ul>
            <Button variant="secondary" onClick={resetSession}>
              {isDailyMode ? 'Back to Dashboard' : 'Back to Problem List'}
            </Button>
          </Card>
        </FadeInUp>
      )}

      <CertificateModal certificate={certificate} onClose={() => setCertificate(null)} />
    </div>
  );
}
