import { useState } from 'react';
import { Map, CheckCircle, Circle } from 'lucide-react';
import { roadmapApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import ProgressBar from '../components/ui/ProgressBar';
import FadeInUp from '../components/animations/FadeInUp';
import type { LearningRoadmap } from '../types';
import toast from 'react-hot-toast';

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState('');
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!targetRole) {
      toast.error('Enter a target role');
      return;
    }
    setLoading(true);
    try {
      const { data } = await roadmapApi.generate({ targetRole });
      setRoadmap(data.data);
      toast.success('Roadmap generated!');
    } catch {
      toast.error('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = async (phaseIndex: number, topicIndex: number) => {
    if (!roadmap) return;
    const updated = { ...roadmap, phases: [...roadmap.phases] };
    updated.phases[phaseIndex] = { ...updated.phases[phaseIndex], topics: [...updated.phases[phaseIndex].topics] };
    updated.phases[phaseIndex].topics[topicIndex] = {
      ...updated.phases[phaseIndex].topics[topicIndex],
      completed: !updated.phases[phaseIndex].topics[topicIndex].completed,
    };

    const totalTopics = updated.phases.reduce((acc, p) => acc + p.topics.length, 0);
    const completed = updated.phases.reduce((acc, p) => acc + p.topics.filter((t) => t.completed).length, 0);
    updated.progress = totalTopics ? Math.round((completed / totalTopics) * 100) : 0;

    setRoadmap(updated);
    try {
      await roadmapApi.updateProgress(roadmap._id, {
        phases: updated.phases,
        progress: updated.progress,
        topicComplete: { phaseIndex, topicIndex },
      });
    } catch { /* silent */ }
  };

  return (
    <div className="space-y-8">
      <FadeInUp>
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
          Learning <span className="neon-text">Roadmap</span>
        </h1>
        <p className="text-white/50 mt-1">Personalized learning paths for your career goals</p>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input label="Target Role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Full Stack Developer" className="flex-1" />
            <div className="flex items-end">
              <Button onClick={handleGenerate} loading={loading}>
                <Map className="h-4 w-4" /> Generate Roadmap
              </Button>
            </div>
          </div>
        </Card>
      </FadeInUp>

      {roadmap && (
        <>
          <FadeInUp delay={0.2}>
            <Card glow>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">{roadmap.title}</h2>
                  <p className="text-white/50 text-sm">{roadmap.duration} · {roadmap.targetRole}</p>
                </div>
                <span className="text-2xl font-bold neon-text">{roadmap.progress}%</span>
              </div>
              <ProgressBar value={roadmap.progress} />
            </Card>
          </FadeInUp>

          <div className="space-y-6">
            {roadmap.phases.map((phase, pi) => (
              <FadeInUp key={phase.phase} delay={0.1 * pi}>
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 font-bold text-sm border border-purple-500/30">
                      P{phase.phase}
                    </div>
                    <div>
                      <h3 className="font-semibold">{phase.title}</h3>
                      <p className="text-xs text-white/40">{phase.weeks} weeks</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {phase.topics.map((topic, ti) => (
                      <button
                        key={topic.name}
                        onClick={() => toggleTopic(pi, ti)}
                        className={`flex items-center gap-3 w-full rounded-xl p-3 text-left transition-all ${
                          topic.completed ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {topic.completed ? (
                          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-white/30 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${topic.completed ? 'line-through text-white/40' : ''}`}>{topic.name}</p>
                          {topic.resources?.length > 0 && (
                            <p className="text-xs text-white/30 mt-0.5">{topic.resources.join(' · ')}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {phase.milestones?.length > 0 && (
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-xs text-white/40 mb-2">Milestones</p>
                      <div className="flex flex-wrap gap-2">
                        {phase.milestones.map((m) => (
                          <span key={m} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">🎯 {m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </FadeInUp>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
