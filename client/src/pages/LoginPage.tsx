import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import ParticleBackground from '../components/animations/ParticleBackground';
import MouseGlow from '../components/animations/MouseGlow';
import FadeInUp from '../components/animations/FadeInUp';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      toast.success(loggedInUser.role === 'admin' ? 'Welcome, Administrator' : 'Welcome back!');
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string }; status?: number }; code?: string; message?: string };
      if (!error.response) {
        toast.error('Cannot reach server. Start the backend: cd server && npm run dev');
      } else if (error.response?.status === 429) {
        toast.error('Too many requests. Wait a moment and try again.');
      } else {
        toast.error(error.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <ParticleBackground />
      <MouseGlow />

      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10" />
        <FadeInUp className="relative z-10 p-12 max-w-lg">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span className="text-3xl font-bold font-[family-name:var(--font-display)] neon-text">InterviewIQ AI</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Welcome back</h2>
          <p className="text-white/50 text-lg">Continue your interview preparation journey with AI-powered tools.</p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {['AI Interviews', 'Resume Analysis', 'Coding Practice', 'Career Insights'].map((f) => (
              <div key={f} className="glass rounded-xl p-4 text-sm text-white/60">{f}</div>
            ))}
          </div>
        </FadeInUp>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <FadeInUp delay={0.2} className="w-full max-w-md">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2 lg:hidden neon-text">InterviewIQ AI</h2>
            <h3 className="text-xl font-semibold mb-6">Sign in to your account</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              <Button type="submit" loading={loading} className="w-full">Sign In</Button>
            </form>
            <p className="mt-6 text-center text-sm text-white/50">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-400 hover:text-purple-300">Sign up</Link>
            </p>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
