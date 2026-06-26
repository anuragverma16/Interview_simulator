import { useEffect, useState, useCallback } from 'react';
import { Upload, FileText, AlertTriangle, CheckCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { resumeApi } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressRing from '../components/ui/ProgressRing';
import FadeInUp from '../components/animations/FadeInUp';
import type { Resume } from '../types';
import toast from 'react-hot-toast';
import axios from 'axios';

function apiError(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.error;
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  return fallback;
}

function isPdfFile(file: File) {
  return file.type === 'application/pdf'
    || file.name.toLowerCase().endsWith('.pdf');
}

export default function ResumeAnalyzerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fetchResumes = useCallback(async () => {
    try {
      const { data } = await resumeApi.getAll();
      setResumes(data.data);
      if (data.data.length && !selected) setSelected(data.data[0]);
    } catch {
      toast.error('Failed to load resumes');
    }
  }, [selected]);

  useEffect(() => { fetchResumes(); }, [fetchResumes]);

  const handleUpload = async (file: File) => {
    if (!isPdfFile(file)) {
      toast.error('Only PDF files are allowed');
      return;
    }
    setUploading(true);
    try {
      const { data } = await resumeApi.upload(file);
      toast.success('Resume analyzed successfully!');
      setSelected(data.data);
      fetchResumes();
    } catch (err) {
      toast.error(apiError(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleReanalyze = async () => {
    if (!selected) return;
    try {
      const { data } = await resumeApi.reanalyze(selected._id);
      setSelected(data.data);
      toast.success('Resume re-analyzed');
    } catch (err) {
      toast.error(apiError(err, 'Re-analysis failed'));
    }
  };

  return (
    <div className="space-y-8">
      <FadeInUp>
        <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)]">
          Resume <span className="neon-text">Analyzer</span>
        </h1>
        <p className="text-white/50 mt-1">Upload your resume for AI-powered ATS scoring and insights</p>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`glass rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
            dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-white/20'
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <p className="text-lg font-medium mb-2">Drag & drop your PDF resume</p>
          <p className="text-white/40 text-sm mb-4">or click to browse (max 5MB)</p>
          <label className="inline-block cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <span className="inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all glass glass-hover text-white px-5 py-2.5">
              {uploading ? 'Uploading...' : 'Browse Files'}
            </span>
          </label>
        </div>
      </FadeInUp>

      {resumes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {resumes.map((r) => (
            <button
              key={r._id}
              onClick={() => setSelected(r)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm whitespace-nowrap transition-all ${
                selected?._id === r._id ? 'bg-purple-500/20 border border-purple-500/30' : 'glass hover:bg-white/10'
              }`}
            >
              <FileText className="h-4 w-4" />
              {r.fileName}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeInUp delay={0.2}>
              <Card glow>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">ATS Score</h3>
                  <Button variant="ghost" size="sm" onClick={handleReanalyze}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-center">
                  <ProgressRing score={selected.analysis.atsScore} label="ATS Compatibility" size={140} />
                </div>
              </Card>
            </FadeInUp>
            <FadeInUp delay={0.3}>
              <Card glow>
                <h3 className="font-semibold mb-4">Resume Score</h3>
                <div className="flex justify-center">
                  <ProgressRing score={selected.analysis.resumeScore} label="Overall Quality" size={140} />
                </div>
              </Card>
            </FadeInUp>
          </div>

          <FadeInUp delay={0.4}>
            <Card>
              <h3 className="font-semibold mb-4">Extracted Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selected.parsed.skills.map((s) => (
                  <span key={s} className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-3 py-1 text-sm text-cyan-300">
                    {s}
                  </span>
                ))}
              </div>
            </Card>
          </FadeInUp>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FadeInUp delay={0.5}>
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" /> Strengths
                </h3>
                <ul className="space-y-2">
                  {selected.analysis.strengths.map((s) => (
                    <li key={s} className="text-sm text-white/70 flex items-start gap-2">
                      <span className="text-emerald-400 mt-1">•</span> {s}
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeInUp>
            <FadeInUp delay={0.6}>
              <Card>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" /> Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selected.analysis.missingKeywords.map((k) => (
                    <span key={k} className="rounded-full bg-red-500/20 border border-red-500/30 px-3 py-1 text-sm text-red-300">
                      {k}
                    </span>
                  ))}
                </div>
              </Card>
            </FadeInUp>
          </div>

          <FadeInUp delay={0.7}>
            <Card>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" /> Improvement Suggestions
              </h3>
              <div className="space-y-3">
                {selected.analysis.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl bg-white/5 p-4">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-xs font-bold text-purple-300">
                      {i + 1}
                    </span>
                    <p className="text-sm text-white/70">{s}</p>
                  </div>
                ))}
              </div>
            </Card>
          </FadeInUp>

          {selected.parsed.projects.length > 0 && (
            <FadeInUp delay={0.8}>
              <Card>
                <h3 className="font-semibold mb-4">Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selected.parsed.projects.map((p) => (
                    <div key={p.name} className="rounded-xl bg-white/5 p-4">
                      <h4 className="font-medium mb-1">{p.name}</h4>
                      <p className="text-sm text-white/50 mb-2">{p.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.technologies?.map((t) => (
                          <span key={t} className="text-xs bg-purple-500/20 px-2 py-0.5 rounded text-purple-300">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </FadeInUp>
          )}
        </>
      )}
    </div>
  );
}
