import Certificate from '../models/Certificate.js';
import CodingStreak from '../models/CodingStreak.js';
import User from '../models/User.js';
import { STREAK_MILESTONES, MILESTONE_META } from '../constants/streakMilestones.js';

export async function issueCertificate(userId, streakData) {
  const existing = await Certificate.findOne({
    userId,
    type: 'daily_streak',
    streakDay: streakData.currentStreak,
  });
  if (existing) return existing;

  const user = await User.findById(userId);
  const certId = `IQ-${Date.now().toString(36).toUpperCase()}`;

  const certificate = await Certificate.create({
    userId,
    certId,
    type: 'daily_streak',
    title: 'Daily Coding Streak Certificate',
    recipientName: user?.name || 'Coder',
    streakDay: streakData.currentStreak,
    problemTitle: streakData.problemTitle || 'Daily Challenge',
    language: streakData.language || 'javascript',
    earnedAt: new Date(),
    metadata: {
      points: streakData.pointsEarned,
      date: streakData.date,
    },
  });

  return certificate;
}

export async function issueMilestoneCertificate(userId, milestoneDay, streakData = {}) {
  if (!STREAK_MILESTONES.includes(milestoneDay)) return null;

  const existing = await Certificate.findOne({
    userId,
    type: 'milestone',
    streakDay: milestoneDay,
  });
  if (existing) return existing;

  const user = await User.findById(userId);
  const meta = MILESTONE_META[milestoneDay];
  const certId = `IQ-M${milestoneDay}-${Date.now().toString(36).toUpperCase()}`;

  return Certificate.create({
    userId,
    certId,
    type: 'milestone',
    title: meta.title,
    recipientName: user?.name || 'Coder',
    streakDay: milestoneDay,
    problemTitle: streakData.problemTitle || 'Daily Streak Milestone',
    language: streakData.language || 'javascript',
    earnedAt: new Date(),
    metadata: {
      milestone: milestoneDay,
      date: streakData.date,
    },
  });
}

export async function syncMilestoneCertificates(userId, streakData = {}, streakDoc = null) {
  const streak = streakDoc || await CodingStreak.findOne({ userId });
  if (!streak) return [];

  const best = Math.max(streak.currentStreak || 0, streak.longestStreak || 0);
  const issued = [];

  for (const day of STREAK_MILESTONES) {
    if (best >= day) {
      const cert = await issueMilestoneCertificate(userId, day, {
        ...streakData,
        currentStreak: best,
      });
      if (cert) issued.push(cert);
    }
  }

  return issued;
}

export function buildCertificateHtml(cert, user) {
  const date = new Date(cert.earnedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const isMilestone = cert.type === 'milestone';
  const subtitle = isMilestone
    ? `${cert.streakDay}-Day Streak Milestone`
    : 'Daily Coding Streak Challenge';
  const badgeLabel = isMilestone
    ? `${MILESTONE_META[cert.streakDay]?.icon || '🏆'} ${cert.streakDay}-Day Streak Legend`
    : `🏆 ${cert.streakDay}-Day Streak Coder`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Certificate</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Georgia,serif;background:#0a0a0f;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:40px}
  .cert{width:800px;background:linear-gradient(135deg,#12121a,#1a1a27);border:3px solid transparent;border-image:linear-gradient(135deg,#00f5ff,#a855f7,#ec4899) 1;padding:60px;text-align:center;color:#fff;position:relative}
  .cert::before{content:'';position:absolute;inset:8px;border:1px solid rgba(255,255,255,.15);pointer-events:none}
  .logo{font-size:14px;letter-spacing:4px;color:#a855f7;margin-bottom:24px}
  h1{font-size:36px;background:linear-gradient(90deg,#00f5ff,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
  .subtitle{font-size:18px;color:rgba(255,255,255,.6);margin-bottom:40px}
  .name{font-size:42px;color:#fff;margin:24px 0;font-weight:bold}
  .detail{font-size:16px;color:rgba(255,255,255,.7);line-height:1.8;margin:8px 0}
  .badge{display:inline-block;margin-top:32px;padding:12px 32px;background:linear-gradient(90deg,#00f5ff33,#a855f733);border:1px solid #a855f7;border-radius:50px;font-size:14px;color:#c4b5fd}
  .id{margin-top:40px;font-size:12px;color:rgba(255,255,255,.3);font-family:monospace}
</style></head><body>
<div class="cert">
  <div class="logo">INTERVIEWIQ AI</div>
  <h1>Certificate of Achievement</h1>
  <p class="subtitle">${subtitle}</p>
  <p class="detail">This certifies that</p>
  <p class="name">${cert.recipientName || user?.name || 'Coder'}</p>
  <p class="detail">${isMilestone ? `has achieved an incredible ${cert.streakDay}-day coding streak` : 'has successfully completed the Daily Coding Challenge'}</p>
  <p class="detail"><strong>${cert.problemTitle || 'Problem of the Day'}</strong></p>
  <p class="detail">Language: ${(cert.language || 'javascript').toUpperCase()} · Streak Day ${cert.streakDay}</p>
  <p class="detail">Awarded on ${date}</p>
  <div class="badge">${badgeLabel}</div>
  <p class="id">Certificate ID: ${cert.certId}</p>
</div></body></html>`;
}
