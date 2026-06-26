import { Link, useNavigate } from 'react-router-dom';
import { Code2, ArrowRight, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import DailyStreakPanel from '../coding/DailyStreakPanel';
import { useLayoutOptional } from '../../contexts/LayoutContext';

function PracticeProblemsCard() {
  return (
    <Card className="!p-5 border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold">Practice Problems</h3>
            <p className="text-sm text-muted mt-0.5">
              3,000+ problems · search by #, topic, or difficulty · admin picks for 24h
            </p>
          </div>
        </div>
        <Link to="/coding" className="shrink-0">
          <Button variant="secondary">
            Open problem bank <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function DashboardCodingSection() {
  const layout = useLayoutOptional();
  const navigate = useNavigate();
  const streak = layout?.streakData ?? null;

  const startDaily = () => navigate('/coding/daily?start=1');
  const startCatchUp = (date: string) => navigate(`/coding/daily?start=1&catchUp=${date}`);

  return (
    <section className="space-y-5" aria-label="Coding">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-display)]">
            Coding <span className="neon-text">Hub</span>
          </h2>
          <p className="text-sm text-muted mt-0.5">Daily streak, admin challenges, and practice problems</p>
        </div>
        <div className="flex gap-2">
          <Link to="/coding/daily">
            <Button size="sm" variant="ghost">Daily streak</Button>
          </Link>
          <Link to="/coding">
            <Button size="sm">Practice</Button>
          </Link>
        </div>
      </div>

      {!streak ? (
        <Card className="!p-8 flex flex-col items-center justify-center text-muted gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-sm">Loading coding streak…</p>
        </Card>
      ) : (
        <DailyStreakPanel
          streak={streak}
          onStartDaily={startDaily}
          onStartCatchUp={startCatchUp}
        />
      )}

      <PracticeProblemsCard />
    </section>
  );
}
