import FadeInUp from '../components/animations/FadeInUp';
import ProfileStreakBoard from '../components/profile/ProfileStreakBoard';
import StreakLeaderboardRankings from '../components/profile/StreakLeaderboardRankings';

export default function StreakLeaderboardPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <FadeInUp>
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
          Streak <span className="neon-text">Leaderboard</span>
        </h1>
        <p className="text-muted mt-1">Your monthly activity and top streak rankings</p>
      </FadeInUp>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">
        <FadeInUp delay={0.05} className="xl:col-span-3">
          <ProfileStreakBoard />
        </FadeInUp>
        <FadeInUp delay={0.1} className="xl:col-span-2">
          <StreakLeaderboardRankings />
        </FadeInUp>
      </div>
    </div>
  );
}
