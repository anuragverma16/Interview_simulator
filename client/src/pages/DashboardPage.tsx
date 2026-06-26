import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Mic, Code2, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi } from '../services/api';
import Card from '../components/ui/Card';
import ProgressRing from '../components/ui/ProgressRing';
import ProgressBar from '../components/ui/ProgressBar';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import FadeInUp from '../components/animations/FadeInUp';
import DashboardCodingSection from '../components/dashboard/DashboardCodingSection';
import DashboardActivityHistory from '../components/dashboard/DashboardActivityHistory';
import type { DashboardData } from '../types';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [leaderboard, setLeaderboard] = useState<{
    rank: number;
    name: string;
    xp: number;
    level: number;
    isCurrentUser?: boolean;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, lb] = await Promise.all([
          dashboardApi.get(),
          dashboardApi.leaderboard(),
        ]);
        setData(dash.data.data);
        setLeaderboard(lb.data.data);
        await refreshUser();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshUser]);

  if (loading) return <DashboardSkeleton />;

  const stats = data?.stats || user?.stats;
  const myXp = stats?.xp ?? 0;
  const displayLeaderboard = leaderboard.length > 0
    ? leaderboard.slice(0, 6)
    : myXp > 0 && user
      ? [{ rank: 1, name: user.name, xp: myXp, level: stats?.level ?? 1, isCurrentUser: true }]
      : [];

  const statCards = [
    { label: 'Total Interviews', value: stats?.totalInterviews || 0, icon: Mic, color: 'from-cyan-500 to-blue-500' },
    { label: 'Average Score', value: `${stats?.avgScore || 0}%`, icon: Trophy, color: 'from-purple-500 to-pink-500' },
    { label: 'XP / Level', value: `${stats?.xp || 0} / Lv.${stats?.level || 1}`, icon: Code2, color: 'from-emerald-500 to-cyan-500' },
  ];

  const chartData = data?.chartData?.labels.map((label, i) => ({
    name: label,
    interviews: data.chartData.interviews[i],
    score: data.chartData.scores[i],
  })) || [];

  return (
    <div className="space-y-8">
      <FadeInUp>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
            Welcome back, <span className="neon-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted mt-1">Here&apos;s your interview preparation overview</p>
        </div>
      </FadeInUp>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <FadeInUp key={s.label} delay={i * 0.1}>
            <Card className="!p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`rounded-xl bg-gradient-to-br ${s.color} p-3`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </Card>
          </FadeInUp>
        ))}
      </div>

      <DashboardCodingSection />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FadeInUp delay={0.3} className="lg:col-span-2">
          <Card>
            <h3 className="font-semibold mb-4">Weekly Activity</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#ffffff30" fontSize={12} />
                <YAxis stroke="#ffffff30" fontSize={12} />
                <Tooltip contentStyle={{ background: '#1a1a27', border: '1px solid #ffffff20', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="score" stroke="#a855f7" fill="url(#colorScore)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </FadeInUp>

        <FadeInUp delay={0.4}>
          <Card>
            <h3 className="font-semibold mb-4">Performance</h3>
            <div className="flex justify-center">
              <ProgressRing score={stats?.avgScore || 0} label="Avg Score" />
            </div>
          </Card>
        </FadeInUp>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FadeInUp delay={0.5}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Skill Progress</h3>
              <Link to="/skill-gap" className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3">
              {(data?.skillProgress || []).slice(0, 5).map((s) => (
                <ProgressBar key={s.skill} value={Math.round(s.progress)} label={s.skill} />
              ))}
              {!data?.skillProgress?.length && (
                <p className="text-white/40 text-sm">Upload a resume to see skill progress</p>
              )}
            </div>
          </Card>
        </FadeInUp>

        <FadeInUp delay={0.6}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Leaderboard</h3>
              <span className="text-sm font-semibold text-purple-400">{myXp} XP</span>
            </div>
            <div className="space-y-3">
              {displayLeaderboard.length === 0 ? (
                <p className="text-sm text-muted text-center py-6">
                  Solve problems to earn XP and appear on the board
                </p>
              ) : (
                displayLeaderboard.map((u) => (
                  <div
                    key={`${u.rank}-${u.name}`}
                    className={`flex items-center gap-3 rounded-xl p-3 ${
                      u.isCurrentUser
                        ? 'bg-purple-500/15 border border-purple-500/35'
                        : 'bg-white/5'
                    }`}
                  >
                    <span className={`text-sm font-bold w-6 ${u.rank <= 3 ? 'neon-text' : 'text-white/40'}`}>
                      #{u.rank}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {u.name}
                        {u.isCurrentUser && <span className="text-purple-400 ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-white/40">Level {u.level}</p>
                    </div>
                    <span className="text-sm font-semibold text-purple-400">{u.xp} XP</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </FadeInUp>
      </div>

      <FadeInUp delay={0.7}>
        <DashboardActivityHistory />
      </FadeInUp>
    </div>
  );
}
