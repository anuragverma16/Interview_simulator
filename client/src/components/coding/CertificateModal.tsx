import { motion, AnimatePresence } from 'framer-motion';
import { Award, Download, X } from 'lucide-react';
import Button from '../ui/Button';
import type { Certificate } from '../../types';

interface Props {
  certificate: Certificate | null;
  onClose: () => void;
}

export default function CertificateModal({ certificate, onClose }: Props) {
  if (!certificate) return null;

  const openPrintable = () => {
    const url = `/api/v1/coding/certificates/${certificate._id}/html`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-purple-500/30 bg-gradient-to-br from-[#12121a] to-[#1a1a27] p-8 text-center shadow-2xl shadow-purple-500/20"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-purple-500/40">
            <Award className="h-10 w-10 text-amber-400" />
          </div>

          <p className="text-xs tracking-[0.3em] text-purple-400 mb-2">INTERVIEWIQ AI</p>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {certificate.type === 'milestone' ? `${certificate.streakDay}-Day Milestone!` : 'Certificate Earned!'}
          </h2>
          <p className="text-white/60 text-sm mb-6">
            {certificate.type === 'milestone'
              ? `Incredible dedication — ${certificate.title}`
              : "You completed today's daily coding challenge"}
          </p>

          <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-left space-y-2 mb-6">
            {certificate.title && (
              <p className="text-sm font-semibold text-purple-300">{certificate.title}</p>
            )}
            <p className="text-sm"><span className="text-white/40">Problem:</span> {certificate.problemTitle}</p>
            <p className="text-sm"><span className="text-white/40">Language:</span> {(certificate.language || 'javascript').toUpperCase()}</p>
            <p className="text-sm"><span className="text-white/40">Streak Day:</span> {certificate.streakDay}</p>
            <p className="text-xs text-white/30 font-mono mt-2">ID: {certificate.certId}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={openPrintable}>
              <Download className="h-4 w-4" /> View &amp; Download
            </Button>
            <Button variant="secondary" onClick={onClose}>Continue</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
