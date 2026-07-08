import { useEffect, useState } from 'react';
import { Trophy, Lock, Award, ExternalLink } from 'lucide-react';
import { achievementApi } from '../services/api';
import Card from '../components/ui/Card';
import FadeInUp from '../components/animations/FadeInUp';
import type { Achievement, MilestoneBadge } from '../types';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { cn } from '../utils/cn';
import { openCertificateHtml } from '../utils/certificate';

const MILESTONE_STYLES: Record<number, string> = {
  50: 'from-amber-700/30 to-amber-900/20 border-amber-600/40',
  100: 'from-slate-400/25 to-slate-600/15 border-slate-400/40',
  200: 'from-yellow-500/25 to-amber-600/15 border-yellow-500/45',
  250: 'from-purple-500/25 to-pink-500/15 border-purple-400/45',
};

export default function AchievementsPage() {
  const [all, setAll] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<{ achievementId: Achievement; unlockedAt: string }[]>([]);
  const [milestoneBadges, setMilestoneBadges] = useState<MilestoneBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    achievementApi.getUser()
      .then(({ data }) => {
        setAll(data.data.all);
        setUnlocked(data.data.unlocked);
        setMilestoneBadges(data.data.milestoneBadges || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const unlockedIds = new Set(unlocked.map((u) => u.achievementId?._id || u.achievementId));
  const earnedMilestones = milestoneBadges.filter((b) => b.earned).length;
  const totalUnlocks = unlocked.length + earnedMilestones;
  const totalItems = all.length + milestoneBadges.length;

  if (loading) return <DashboardSkeleton />;

  const categories = [...new Set(all.map((a) => a.category))];

  return (
    <div className="space-y-8">
      <FadeInUp>
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
          <span className="neon-text">Achievements</span>
        </h1>
        <p className="text-white/50 mt-1">
          {totalUnlocks} of {totalItems} unlocked
        </p>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <div className="glass rounded-2xl p-6">
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-700"
              style={{ width: `${totalItems ? (totalUnlocks / totalItems) * 100 : 0}%` }}
            />
          </div>
        </div>
      </FadeInUp>

      {/* Streak certificate badges */}
      <div>
        <FadeInUp delay={0.12}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-400" /> Streak Certificate Badges
          </h2>
        </FadeInUp>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {milestoneBadges.map((badge, i) => (
            <FadeInUp key={badge.day} delay={0.05 * i}>
              <Card
                className={cn(
                  '!p-5 h-full border-2 transition-all',
                  badge.earned
                    ? `bg-gradient-to-br ${MILESTONE_STYLES[badge.day]}`
                    : 'opacity-50 border-white/10'
                )}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={cn('text-4xl', !badge.earned && 'grayscale')}>
                    {badge.earned ? badge.icon : <Lock className="h-9 w-9 text-white/30 mx-auto" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-300">{badge.day} Days</p>
                    <h3 className="font-semibold text-sm mt-1">{badge.title}</h3>
                    <p className="text-xs text-white/50 mt-1">{badge.description}</p>
                  </div>
                  {badge.earned && badge.certificate ? (
                    <button
                      type="button"
                      onClick={() => openCertificateHtml(badge.certificate!._id)}
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 mt-1"
                    >
                      View certificate <ExternalLink className="h-3 w-3" />
                    </button>
                  ) : badge.earned ? (
                    <span className="text-[10px] uppercase tracking-wide text-emerald-400 font-semibold">Earned</span>
                  ) : (
                    <span className="text-[10px] uppercase tracking-wide text-white/30">Locked</span>
                  )}
                </div>
              </Card>
            </FadeInUp>
          ))}
        </div>
      </div>

      {categories.map((cat, ci) => (
        <div key={cat}>
          <FadeInUp delay={0.1 * ci}>
            <h2 className="text-lg font-semibold capitalize mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" /> {cat}
            </h2>
          </FadeInUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {all.filter((a) => a.category === cat).map((a, i) => {
              const isUnlocked = unlockedIds.has(a._id);
              return (
                <FadeInUp key={a._id} delay={0.05 * i}>
                  <Card className={`!p-5 ${!isUnlocked ? 'opacity-50' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`text-3xl ${!isUnlocked ? 'grayscale' : ''}`}>
                        {isUnlocked ? a.icon : <Lock className="h-8 w-8 text-white/30" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{a.title}</h3>
                        <p className="text-xs text-white/50 mt-1">{a.description}</p>
                        <p className="text-xs text-purple-400 mt-2">+{a.xpReward} XP</p>
                      </div>
                    </div>
                  </Card>
                </FadeInUp>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
