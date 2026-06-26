import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  Mic, MicOff, Send, MessageSquare, Volume2, FileText,
  Users, Code2, Brain, Building2, Rocket, Sparkles, Briefcase, Check,
} from 'lucide-react';
import { interviewApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SelectOption, { SelectGroup } from '../components/ui/SelectOption';
import { Textarea } from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import FadeInUp from '../components/animations/FadeInUp';
import VoiceOrb from '../components/animations/VoiceOrb';
import InterviewProgressBar from '../components/interview/InterviewProgressBar';
import InterviewResults from '../components/interview/InterviewResults';
import { useVoiceInterview, type VoiceState } from '../hooks/useVoiceInterview';
import { INTERVIEW_ROLES, INTERVIEW_QUESTION_COUNT, getRoleById } from '../constants/interviewRoles';
import type { Interview } from '../types';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const INTERVIEW_TYPES = [
  { id: 'hr', label: 'HR Interview', description: 'Screening & culture fit', icon: Users, color: 'from-cyan-500 to-blue-600' },
  { id: 'technical', label: 'Technical', description: 'Coding & system design', icon: Code2, color: 'from-purple-500 to-violet-600' },
  { id: 'behavioral', label: 'Behavioral', description: 'STAR method questions', icon: Brain, color: 'from-pink-500 to-rose-600' },
  { id: 'faang', label: 'FAANG', description: 'Rigorous top-tier prep', icon: Building2, color: 'from-amber-500 to-orange-600' },
  { id: 'startup', label: 'Startup Founder', description: 'Culture & grit focus', icon: Rocket, color: 'from-emerald-500 to-teal-600' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', description: 'Warm-up level' },
  { id: 'medium', label: 'Medium', description: 'Standard prep' },
  { id: 'hard', label: 'Hard', description: 'Challenge mode' },
  { id: 'adaptive', label: 'Adaptive', description: 'AI adjusts depth' },
];

export default function InterviewPage() {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [type, setType] = useState('technical');
  const [difficulty, setDifficulty] = useState('medium');
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [roleId, setRoleId] = useState('fullstack-developer');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<{ speaker: string; text: string; time: string }[]>([]);
  const [voiceAnalysis, setVoiceAnalysis] = useState<{
    communicationScore?: number;
    confidenceScore?: number;
    fillerWords?: { word: string; count: number }[];
  } | null>(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const startTimeRef = useRef<number>(0);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef('');
  const questionCardRef = useRef<HTMLDivElement>(null);

  const roleMeta = getRoleById(roleId);
  const totalQ = interview?.totalQuestions || INTERVIEW_QUESTION_COUNT;
  const answeredCount = interview?.questions.filter((q) => q.answer).length || 0;
  const currentQuestion = interview?.questions.find((q) => !q.answer);
  const currentNum = Math.min(answeredCount + 1, totalQ);
  const isComplete = interview?.status === 'completed';

  /** Voice uses live transcript; text mode builds log from answered questions */
  const sessionLog = useMemo(() => {
    if (transcript.length > 0) return transcript;
    if (!interview) return [];

    const entries: { speaker: string; text: string; time: string }[] = [];
    const stamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    for (let i = 0; i < interview.questions.length; i++) {
      const q = interview.questions[i];
      if (i > 0 && !interview.questions[i - 1].answer) break;

      const skill = q.skillArea ? ` · ${q.skillArea}` : '';
      entries.push({
        speaker: 'Alex (AI)',
        text: `Q${i + 1}${skill}: ${q.question}`,
        time: stamp(),
      });

      if (q.answer) {
        entries.push({ speaker: 'You', text: q.answer, time: stamp() });
        const marks = q.score === 1 ? '+1 mark' : '0 marks';
        entries.push({
          speaker: 'Alex (AI)',
          text: `${marks}${q.feedback ? ` — ${q.feedback}` : ''}`,
          time: stamp(),
        });
      } else {
        break;
      }
    }

    return entries;
  }, [transcript, interview]);

  useEffect(() => {
    setSelectedSkills(roleMeta.skills.slice(0, 4));
  }, [roleId]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill].slice(0, 6)
    );
  };

  const addTranscript = useCallback((speaker: string, text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTranscript((prev) => [...prev, { speaker, text, time }]);
  }, []);

  const { isSupported, speak, startListening, stopListening, setState } = useVoiceInterview({
    onStateChange: setVoiceState,
    onTranscript: (text) => {
      answerRef.current = text;
      setAnswer(text);
    },
  });

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionLog]);

  useEffect(() => {
    if (mode === 'voice' && transcript.length > 0 && interview) {
      const full = transcript.map((t) => `${t.speaker}: ${t.text}`).join('\n');
      interviewApi.analyzeVoice({ transcript: full, interviewId: interview._id })
        .then(({ data }) => setVoiceAnalysis(data.data))
        .catch(() => {});
    }
  }, [transcript, mode, interview]);

  useEffect(() => {
    if (!questionCardRef.current || !currentQuestion) return;
    gsap.fromTo(
      questionCardRef.current,
      { opacity: 0, x: 40, rotateY: -4 },
      { opacity: 1, x: 0, rotateY: 0, duration: 0.55, ease: 'power3.out' }
    );
  }, [currentQuestion?.question]);

  const finishInterview = async (interviewId: string) => {
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
    setGenerating(true);
    try {
      const { data } = await interviewApi.complete(interviewId, { duration });
      setInterview(data.data);
      if (mode === 'voice') {
        const summary = data.data.analysis?.summary || `Your overall score is ${data.data.analysis.overallScore} out of 100.`;
        addTranscript('Alex (AI)', summary);
        await speak(`Interview complete! ${summary}`);
      }
      toast.success('Your full interview report is ready!');
    } catch {
      toast.error('Failed to generate results');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const beginVoiceConversation = async (interviewId: string, firstQ: string) => {
    try {
      const { data } = await interviewApi.getWelcome(interviewId);
      addTranscript('Alex (AI)', data.data.welcomeSpeech);
      await speak(data.data.welcomeSpeech);
      setConversationStarted(true);
    } catch {
      const fallback = `Hello! I'm Alex. We'll complete ${INTERVIEW_QUESTION_COUNT} questions for your ${roleMeta.label} interview. Question 1: ${firstQ}`;
      addTranscript('Alex (AI)', fallback);
      await speak(fallback);
      setConversationStarted(true);
    }
  };

  const startInterview = async () => {
    if (selectedSkills.length === 0) {
      toast.error('Select at least one skill');
      return;
    }
    setLoading(true);
    setTranscript([]);
    setConversationStarted(false);
    answerRef.current = '';
    setAnswer('');
    try {
      const { data } = await interviewApi.start({
        type,
        difficulty,
        mode,
        targetRoleId: roleId,
        targetRole: roleMeta.label,
        skills: selectedSkills,
      });
      setInterview(data.data);
      startTimeRef.current = Date.now();
      toast.success(`${INTERVIEW_QUESTION_COUNT} questions prepared for ${roleMeta.label}`);

      if (mode === 'voice') {
        await beginVoiceConversation(data.data._id, data.data.questions[0]?.question);
      } else if (data.data.questions[0]?.question) {
        addTranscript('Alex (AI)', `Q1${data.data.questions[0].skillArea ? ` · ${data.data.questions[0].skillArea}` : ''}: ${data.data.questions[0].question}`);
      }
    } catch {
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const handleAfterAnswer = async (
    data: {
      interview: Interview;
      evaluation: { score: number; marks?: number; feedback: string };
      allComplete?: boolean;
      spokenReply?: string;
    }
  ) => {
    setInterview(data.interview);
    setAnswer('');
    answerRef.current = '';
    const marks = data.evaluation.marks ?? data.evaluation.score ?? 0;
    toast.success(marks === 1 ? '✓ +1 mark' : '✗ 0 marks — see feedback below');

    if (data.allComplete) {
      toast.loading('Generating your report...', { id: 'interview-report' });
      await finishInterview(data.interview._id);
      toast.dismiss('interview-report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (mode === 'voice' && data.spokenReply) {
      addTranscript('Alex (AI)', data.spokenReply);
      await speak(data.spokenReply);
    }
  };

  const handleVoiceSubmit = async () => {
    if (!interview || !answerRef.current.trim()) {
      toast.error('Please say something before submitting');
      return;
    }
    if (isListening) {
      stopListening();
      setIsListening(false);
    }
    const userAnswer = answerRef.current.trim();
    addTranscript('You', userAnswer);
    setLoading(true);
    setState('thinking');
    try {
      const { data } = await interviewApi.voiceTurn(interview._id, { answer: userAnswer });
      await handleAfterAnswer(data.data);
    } catch {
      toast.error('Failed to process your answer');
      setState('idle');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!interview || !answer.trim()) return;
    const userText = answer.trim();
    setLoading(true);
    try {
      const { data } = await interviewApi.answer(interview._id, { answer: userText });
      addTranscript('You', userText);
      const marks = data.data.evaluation.marks ?? data.data.evaluation.score ?? 0;
      addTranscript(
        'Alex (AI)',
        `${marks === 1 ? '+1 mark' : '0 marks'} — ${data.data.evaluation.feedback || ''}`
      );
      const nextIdx = data.data.interview.questions.findIndex((q: { answer?: string }) => !q.answer);
      if (nextIdx !== -1 && data.data.interview.questions[nextIdx]) {
        const nq = data.data.interview.questions[nextIdx];
        addTranscript(
          'Alex (AI)',
          `Q${nextIdx + 1}${nq.skillArea ? ` · ${nq.skillArea}` : ''}: ${nq.question}`
        );
      }
      await handleAfterAnswer(data.data);
    } catch {
      toast.error('Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!isSupported) {
      toast.error('Voice not supported — use Chrome or Edge');
      return;
    }
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      answerRef.current = '';
      setAnswer('');
      const started = startListening();
      if (started) {
        setIsListening(true);
        toast('Speak now — tap mic again when done', { icon: '🎤' });
      }
    }
  };

  const resetInterview = () => {
    setInterview(null);
    setConversationStarted(false);
    setTranscript([]);
    setVoiceAnalysis(null);
    setAnswer('');
    answerRef.current = '';
  };

  return (
    <div className="space-y-6">
      <FadeInUp>
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
          AI Interview <span className="neon-text">Studio</span>
        </h1>
        <p className="text-white/50 mt-1">
          {INTERVIEW_QUESTION_COUNT} structured questions · role-tailored · full report with mistakes & fixes
        </p>
      </FadeInUp>

      {!interview && (
        <FadeInUp delay={0.08}>
          <Card className="!p-6 md:!p-8 space-y-8">
            <div>
              <SelectGroup label="Target Role" columns={4}>
                {INTERVIEW_ROLES.map((r, i) => (
                  <SelectOption
                    key={r.id}
                    id={r.id}
                    label={r.label}
                    description={`${r.skills.length} skills`}
                    icon={Briefcase}
                    color="from-indigo-500 to-purple-600"
                    selected={roleId === r.id}
                    onClick={() => setRoleId(r.id)}
                    index={i}
                  />
                ))}
              </SelectGroup>
            </div>

            <div>
              <p className="text-sm font-semibold text-white/70 mb-3">Focus skills (pick up to 6)</p>
              <div className="flex flex-wrap gap-2">
                {roleMeta.skills.map((skill) => {
                  const on = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all',
                        on
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
                          : 'bg-white/5 border-white/15 text-white/45 hover:border-white/30'
                      )}
                    >
                      {on && <Check className="h-3 w-3" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <SelectGroup label="Interview Type" columns={5}>
              {INTERVIEW_TYPES.map((t, i) => (
                <SelectOption
                  key={t.id}
                  id={t.id}
                  label={t.label}
                  description={t.description}
                  icon={t.icon}
                  color={t.color}
                  selected={type === t.id}
                  onClick={() => setType(t.id)}
                  index={i}
                />
              ))}
            </SelectGroup>

            <SelectGroup label="Difficulty" columns={4}>
              {DIFFICULTIES.map((d, i) => (
                <SelectOption
                  key={d.id}
                  id={d.id}
                  label={d.label}
                  description={d.description}
                  selected={difficulty === d.id}
                  onClick={() => setDifficulty(d.id)}
                  index={i}
                />
              ))}
            </SelectGroup>

            <SelectGroup label="Mode" columns={2}>
              <SelectOption
                id="text"
                label="Text Interview"
                description="Type answers — recommended for prep"
                icon={MessageSquare}
                color="from-purple-500 to-pink-500"
                selected={mode === 'text'}
                onClick={() => setMode('text')}
                index={0}
              />
              <SelectOption
                id="voice"
                label="Voice Interview"
                description="Speak with Alex — live conversation"
                icon={Mic}
                color="from-emerald-500 to-cyan-500"
                selected={mode === 'voice'}
                onClick={() => setMode('voice')}
                index={1}
              />
            </SelectGroup>

            <Button onClick={startInterview} loading={loading} size="lg" className="w-full sm:w-auto">
              <Sparkles className="h-5 w-5" />
              Start {INTERVIEW_QUESTION_COUNT}-Question Interview
            </Button>
          </Card>
        </FadeInUp>
      )}

      {interview && !isComplete && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            <InterviewProgressBar current={currentNum} total={totalQ} />

            {mode === 'voice' ? (
              <Card glow className="!p-6 md:!p-8">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  <VoiceOrb state={voiceState} name="Alex" role={`${interview.targetRole} Interviewer`} />
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center justify-between text-xs text-white/40 capitalize">
                      <span>{interview.type} · {interview.difficulty}</span>
                      <span className="text-purple-400">{interview.targetRole}</span>
                    </div>
                    <AnimatePresence mode="wait">
                      <div key={currentQuestion?.question} ref={questionCardRef} className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-5">
                        {currentQuestion?.skillArea && (
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-200 border border-purple-500/30 mb-2">
                            Skill: {currentQuestion.skillArea}
                          </span>
                        )}
                        <p className="text-xs text-purple-300 mb-2 font-medium">Alex asks:</p>
                        <p className="text-lg font-medium leading-relaxed">{currentQuestion?.question}</p>
                      </div>
                    </AnimatePresence>
                    {(answer || isListening) && (
                      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                        <p className="text-xs text-emerald-300 mb-1">{isListening ? '🎤 Listening...' : 'Your answer:'}</p>
                        <p className="text-sm text-white/80">{answer || 'Start speaking...'}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <Button variant={isListening ? 'danger' : 'voice'} onClick={toggleMic} disabled={!conversationStarted || loading || voiceState === 'speaking'}>
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        {isListening ? 'Stop' : 'Talk'}
                      </Button>
                      <Button onClick={handleVoiceSubmit} loading={loading || generating} disabled={!answer.trim() || voiceState === 'speaking'}>
                        <Send className="h-4 w-4" /> Submit
                      </Button>
                      <Button variant="secondary" onClick={async () => currentQuestion && speak(currentQuestion.question)} disabled={voiceState === 'speaking'}>
                        <Volume2 className="h-4 w-4" /> Repeat
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card glow className="!p-6">
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-white/50 capitalize">{interview.type} · {interview.difficulty}</span>
                  <span className="text-purple-400 text-xs">{interview.targetRole}</span>
                </div>
                <div ref={questionCardRef} className="rounded-2xl bg-purple-500/10 border border-purple-500/20 p-5 mb-4">
                  {currentQuestion?.skillArea && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-200 border border-purple-500/30 mb-2">
                      Skill area: {currentQuestion.skillArea}
                    </span>
                  )}
                  <p className="text-lg font-medium leading-relaxed">{currentQuestion?.question}</p>
                </div>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer in detail..."
                  className="mb-4 min-h-[140px]"
                />
                <Button onClick={submitAnswer} loading={loading || generating} fullWidth disabled={!answer.trim()}>
                  <Send className="h-4 w-4" />
                  {currentNum === totalQ ? 'Submit & get report' : `Submit (${currentNum}/${totalQ}) · 1 mark each`}
                </Button>
              </Card>
            )}

            {interview.questions.filter((q) => q.feedback).map((q, i) => {
              const earned = q.score === 1;
              return (
              <Card key={i} className={cn('!p-4', earned ? 'border-emerald-500/20' : 'border-red-500/15')}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-white/40">Q{i + 1}</p>
                  {q.skillArea && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300">{q.skillArea}</span>
                  )}
                  <span className={cn('text-xs font-bold ml-auto', earned ? 'text-emerald-400' : 'text-red-400')}>
                    {earned ? '+1 mark' : '0 marks'}
                  </span>
                </div>
                <p className="text-xs text-white/50 mb-1 line-clamp-1">{q.question}</p>
                <div className={cn(
                  'rounded-xl p-3 mt-2 border',
                  earned ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/5 border-red-500/15'
                )}>
                  <p className="text-sm text-white/70">{q.feedback}</p>
                </div>
              </Card>
            );})}
          </div>

          <Card className="!p-5 sticky top-4 max-h-[calc(100vh-120px)] flex flex-col">
            <h3 className="font-semibold mb-1">Session</h3>
            <p className="text-xs text-white/40 mb-4">{answeredCount}/{totalQ} answered</p>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[120px] max-h-[420px] pr-1">
              {sessionLog.length === 0 ? (
                <p className="text-sm text-white/30 text-center py-6">Your Q&amp;A will appear here as you answer</p>
              ) : sessionLog.map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-xl p-2.5 text-xs',
                    t.speaker.includes('Alex') ? 'bg-purple-500/15 mr-4' : 'bg-emerald-500/10 ml-4'
                  )}
                >
                  <span className="font-semibold text-white/50">{t.speaker}</span>
                  <p className="text-white/80 mt-0.5">{t.text}</p>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
            {voiceAnalysis && mode === 'voice' && (
              <div className="space-y-2 border-t border-white/10 pt-4 mt-4">
                <ProgressBar value={voiceAnalysis.communicationScore || 0} label="Communication" />
                <ProgressBar value={voiceAnalysis.confidenceScore || 0} label="Confidence" />
              </div>
            )}
          </Card>
        </div>
      )}

      {generating && (
        <Card className="!p-10 text-center border-purple-500/25">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 mb-4 animate-pulse">
            <FileText className="h-7 w-7 text-purple-300" />
          </div>
          <p className="text-lg font-semibold neon-text">Generating your interview report...</p>
          <p className="text-sm text-white/40 mt-2">Calculating marks out of 10 · mistakes · recommendations</p>
        </Card>
      )}

      {isComplete && interview && !generating && (
        <InterviewResults interview={interview} onRestart={resetInterview} />
      )}
    </div>
  );
}
