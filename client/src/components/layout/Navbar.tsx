import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-400" />
          <span className="text-xl font-bold font-[family-name:var(--font-display)] neon-text">InterviewIQ AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm text-white/70 hover:text-white transition-colors">Login</Link>
          <Link to="/signup" className="gradient-btn text-sm !px-5 !py-2">Get Started</Link>
        </div>
      </div>
    </nav>
  );
}
