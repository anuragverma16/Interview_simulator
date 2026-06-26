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

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      if (!error.response) {
        toast.error('Cannot reach server. Start the backend: cd server && npm run dev');
      } else {
        toast.error(error.response?.data?.error || 'Registration failed');
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
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10" />
        <FadeInUp className="relative z-10 p-12 max-w-lg">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-8 w-8 text-purple-400" />
            <span className="text-3xl font-bold font-[family-name:var(--font-display)] neon-text">InterviewIQ AI</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Start your journey</h2>
          <p className="text-white/50 text-lg">Join 50,000+ professionals preparing for their dream careers with AI.</p>
        </FadeInUp>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6">
        <FadeInUp delay={0.2} className="w-full max-w-md">
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-2 lg:hidden neon-text">InterviewIQ AI</h2>
            <h3 className="text-xl font-semibold mb-6">Create your account</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
              <Button type="submit" loading={loading} className="w-full">Create Account</Button>
            </form>
            <p className="mt-6 text-center text-sm text-white/50">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300">Sign in</Link>
            </p>
          </div>
        </FadeInUp>
      </div>
    </div>
  );
}
