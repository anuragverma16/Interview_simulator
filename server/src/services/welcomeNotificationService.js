import UserNotification from '../models/UserNotification.js';

const TEAM_NAME = 'InterviewIQ AI Team';
const WELCOME_TTL_DAYS = 30;
const LOGIN_GREETING_TTL_HOURS = 24;

function firstName(name) {
  const trimmed = (name || 'there').trim();
  return trimmed.split(/\s+/)[0] || 'there';
}

function buildSignupWelcome(name, email) {
  const greeting = firstName(name);
  const accountEmail = (email || '').trim();
  return {
    title: `Welcome to InterviewIQ AI, ${greeting}!`,
    message:
      `Thank you for joining InterviewIQ AI. From the ${TEAM_NAME}, we're glad to have you on board.\n\n`
      + `Your account (${accountEmail}) is now active. Start with your dashboard to explore resume analysis, AI mock interviews, coding practice, skill-gap insights, and career roadmaps—all designed to help you interview with confidence.\n\n`
      + `Tip: Complete your profile and try one practice session today. We're here to support your growth every step of the way.`,
    actionUrl: '/dashboard',
    actionLabel: 'Explore Dashboard',
    kind: 'welcome',
    expiresAt: new Date(Date.now() + WELCOME_TTL_DAYS * 24 * 60 * 60 * 1000),
  };
}

function buildLoginGreeting(name, email) {
  const greeting = firstName(name);
  const accountEmail = (email || '').trim();
  return {
    title: `Welcome back, ${greeting}`,
    message:
      `Good to see you again, ${greeting}. You're signed in as ${accountEmail}.\n\n`
      + `The ${TEAM_NAME} hopes your preparation is going well. Pick up where you left off—practice a coding problem, run a mock interview, or review your progress on the dashboard.\n\n`
      + `Wishing you a focused and productive session today.`,
    actionUrl: '/dashboard',
    actionLabel: 'Continue Learning',
    kind: 'login_greeting',
    expiresAt: new Date(Date.now() + LOGIN_GREETING_TTL_HOURS * 60 * 60 * 1000),
  };
}

export async function sendSignupWelcome(user) {
  if (!user?._id || user.role === 'admin') return null;

  try {
    const alreadyWelcomed = await UserNotification.exists({
      userId: user._id,
      kind: 'welcome',
    });
    if (alreadyWelcomed) return null;

    return await UserNotification.create({
      userId: user._id,
      ...buildSignupWelcome(user.name, user.email),
    });
  } catch (error) {
    console.warn('Signup welcome notification skipped:', error.message);
    return null;
  }
}

export async function sendLoginGreeting(user) {
  if (!user?._id || user.role === 'admin') return null;

  try {
    return await UserNotification.create({
      userId: user._id,
      ...buildLoginGreeting(user.name, user.email),
    });
  } catch (error) {
    console.warn('Login greeting notification skipped:', error.message);
    return null;
  }
}
