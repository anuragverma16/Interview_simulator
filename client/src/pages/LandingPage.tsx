import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FileText, Mic, Code2, TrendingUp, Target, Map, Zap, Shield, Users, Star,
  ArrowRight, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { publicApi } from '../services/api';
import Navbar from '../components/layout/Navbar';
import ParticleBackground from '../components/animations/ParticleBackground';
import MouseGlow from '../components/animations/MouseGlow';
import ScrollReveal from '../components/animations/ScrollReveal';
import FadeInUp from '../components/animations/FadeInUp';

gsap.registerPlugin(ScrollTrigger);

const features = [
  { icon: FileText, title: 'Resume Analyzer', desc: 'ATS scoring, keyword analysis, and AI-powered improvement suggestions.', color: 'from-cyan-500 to-blue-500' },
  { icon: Mic, title: 'AI Interview Room', desc: 'HR, Technical, Behavioral, FAANG & Startup interviews with voice support.', color: 'from-purple-500 to-pink-500' },
  { icon: Code2, title: 'Coding Practice', desc: 'Monaco editor with AI feedback, complexity analysis in 4 languages.', color: 'from-emerald-500 to-cyan-500' },
  { icon: Target, title: 'Skill Gap Analyzer', desc: 'Compare your skills against any job role with personalized roadmaps.', color: 'from-orange-500 to-red-500' },
  { icon: TrendingUp, title: 'Career Prediction', desc: 'AI-powered placement readiness and career match predictions.', color: 'from-pink-500 to-purple-500' },
  { icon: Map, title: 'Learning Roadmap', desc: 'Structured learning paths tailored to your career goals.', color: 'from-blue-500 to-indigo-500' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Software Engineer @ Google', text: 'InterviewIQ helped me land my dream job at Google. The FAANG interview prep was incredibly realistic.', avatar: 'S' },
  { name: 'Marcus Johnson', role: 'Full Stack Developer', text: 'The resume analyzer boosted my ATS score from 45 to 89. Got 3x more interview callbacks.', avatar: 'M' },
  { name: 'Priya Sharma', role: 'Data Scientist @ Meta', text: 'Voice interview feature with filler word detection transformed my communication skills.', avatar: 'P' },
];

const DEFAULT_STATS = [
  { value: 0, suffix: '+', label: 'Active Users', key: 'totalUsers' as const },
  { value: 0, suffix: '+', label: 'Problems Solved', key: 'problemsSolved' as const },
  { value: 0, suffix: '+', label: 'Interviews Completed', key: 'interviewsCompleted' as const },
  { value: 0, suffix: '+', label: 'Practice Problems', key: 'problemsInBank' as const },
];

export default function LandingPage() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [platformStats, setPlatformStats] = useState(DEFAULT_STATS);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    publicApi.getStats()
      .then(({ data }) => {
        const s = data.data;
        setUserCount(s.totalUsers ?? 0);
        setPlatformStats([
          { value: s.totalUsers ?? 0, suffix: '+', label: 'Active Users', key: 'totalUsers' },
          { value: s.problemsSolved ?? 0, suffix: '+', label: 'Problems Solved', key: 'problemsSolved' },
          { value: s.interviewsCompleted ?? 0, suffix: '+', label: 'Interviews Completed', key: 'interviewsCompleted' },
          { value: s.problemsInBank ?? 0, suffix: '+', label: 'Practice Problems', key: 'problemsInBank' },
        ]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.querySelectorAll('.hero-animate'),
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.3 }
      );
    }
  }, []);

  useEffect(() => {
    if (!statsRef.current) return;
    const elements = statsRef.current.querySelectorAll('.stat-value');
    elements.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-value') || '0');
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2,
        scrollTrigger: { trigger: el, start: 'top 85%' },
        onUpdate: () => {
          el.textContent = Math.floor(obj.val).toLocaleString() + suffix;
        },
      });
    });
    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (statsRef.current?.contains(t.trigger as Node)) t.kill();
      });
    };
  }, [platformStats]);

  return (
    <div className="min-h-screen overflow-hidden">
      <ParticleBackground />
      <MouseGlow />
      <Navbar />

      {/* Hero */}
      <section ref={heroRef} className="relative flex min-h-screen items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-purple-500/20 blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="hero-animate mb-6 inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-white/70">Powered by Gemini AI & LangChain</span>
          </div>
          <h1 className="hero-animate text-5xl md:text-7xl font-bold font-[family-name:var(--font-display)] leading-tight mb-6">
            Ace Your Next Interview with{' '}
            <span className="neon-text">AI Intelligence</span>
          </h1>
          <p className="hero-animate text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Practice interviews, analyze resumes, identify skill gaps, and predict your career path — all powered by cutting-edge AI.
          </p>
          <div className="hero-animate flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="gradient-btn flex items-center gap-2 text-lg">
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link to="/signup" className="gradient-btn flex items-center gap-2 text-lg">
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Link>
            )}
            <a href="#features" className="glass glass-hover px-8 py-3.5 rounded-xl font-medium">
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-center mb-4">
              Everything You Need to <span className="neon-text">Succeed</span>
            </h2>
            <p className="text-white/50 text-center mb-16 max-w-2xl mx-auto">
              A complete AI-powered interview preparation platform built for modern job seekers.
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={f.title}>
                <div className="glass glass-hover rounded-2xl p-6 group" style={{ transitionDelay: `${i * 50}ms` }}>
                  <div className={`inline-flex rounded-xl bg-gradient-to-br ${f.color} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-white/50 text-sm">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-center mb-16">
              How It <span className="neon-text">Works</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Upload Resume', desc: 'Upload your PDF resume for AI-powered analysis and ATS scoring.' },
              { step: '02', title: 'Practice & Improve', desc: 'Take AI mock interviews, solve coding problems, and track progress.' },
              { step: '03', title: 'Land Your Dream Job', desc: 'Get career predictions and personalized roadmaps to success.' },
            ].map((s, i) => (
              <ScrollReveal key={s.step}>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 text-2xl font-bold neon-text border border-purple-500/30">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-white/50 text-sm">{s.desc}</p>
                  {i < 2 && <div className="hidden md:block absolute" />}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="py-16 px-6">
        <div className="mx-auto max-w-5xl glass rounded-3xl p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {platformStats.map((s) => (
              <div key={s.key} className="text-center">
                <div
                  className="stat-value text-3xl md:text-4xl font-bold neon-text"
                  data-value={s.value}
                  data-suffix={s.suffix}
                >
                  0{s.suffix}
                </div>
                <p className="text-white/50 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-center mb-16">
              Loved by <span className="neon-text">Job Seekers</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <ScrollReveal key={t.name}>
                <div className="glass glass-hover rounded-2xl p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/70 text-sm mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-white/40 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <FadeInUp>
          <div className="mx-auto max-w-3xl text-center glass rounded-3xl p-12 neon-border">
            <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] mb-4">
              Ready to <span className="neon-text">Level Up</span>?
            </h2>
            <p className="text-white/50 mb-8">
              {userCount > 0
                ? `Join ${userCount.toLocaleString()}+ learners practicing on InterviewIQ AI.`
                : 'Join professionals who prepare smarter with InterviewIQ AI.'}
            </p>
            {user ? (
              <Link to="/dashboard" className="gradient-btn inline-flex items-center gap-2 text-lg">
                Open Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <Link to="/signup" className="gradient-btn inline-flex items-center gap-2 text-lg">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
            )}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/40">
              <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-emerald-400" /> No credit card</span>
              <span className="flex items-center gap-1"><Shield className="h-4 w-4 text-cyan-400" /> Secure & Private</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4 text-purple-400" /> {userCount > 0 ? `${userCount.toLocaleString()}+ users` : 'Growing community'}</span>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">© 2026 InterviewIQ AI. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
