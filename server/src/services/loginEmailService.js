import User from '../models/User.js';
import { config } from '../config/index.js';
import { sendEmail } from './emailService.js';

const PLATFORM_NAME = 'InterviewIQ AI';
const TEAM_NAME = 'InterviewIQ AI Team';
const LOGIN_EMAIL_COOLDOWN_MS = process.env.NODE_ENV === 'production'
  ? 24 * 60 * 60 * 1000
  : 0;

function firstName(name) {
  return (name || 'there').trim().split(/\s+/)[0] || 'there';
}

function formatLoginTime(date = new Date()) {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

/** Matches the EmailJS login template (user_name, user_email, login_time, dashboard_url). */
function buildLoginEmailHtml({ userName, email, loginAt, dashboardUrl }) {
  return `<div style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:650px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
    <div style="background:#2563eb;padding:35px 20px;text-align:center;color:#ffffff;">
      <h1 style="margin:0;font-size:30px;">${PLATFORM_NAME}</h1>
      <p style="margin-top:10px;font-size:16px;">Your AI-Powered Interview Preparation Platform</p>
    </div>
    <div style="padding:35px;">
      <h2 style="color:#111827;">Hello ${userName} 👋</h2>
      <p style="font-size:16px;color:#4b5563;line-height:1.8;">
        We're happy to see you again! This email confirms that your
        <strong>${PLATFORM_NAME}</strong> account has been
        <span style="color:#16a34a;font-weight:bold;">successfully logged in.</span>
      </p>
      <table style="width:100%;background:#f8fafc;border-radius:8px;padding:15px;margin:25px 0;border-collapse:collapse;">
        <tr>
          <td style="padding:8px;"><strong>📧 Email</strong></td>
          <td>${email}</td>
        </tr>
        <tr>
          <td style="padding:8px;"><strong>🕒 Login Time</strong></td>
          <td>${loginAt}</td>
        </tr>
      </table>
      <div style="background:#eff6ff;border-left:5px solid #2563eb;padding:20px;border-radius:8px;margin:25px 0;">
        <h3 style="margin-top:0;color:#1d4ed8;">🚀 Your Coding Journey Continues</h3>
        <p style="line-height:1.8;color:#374151;">Every successful login is another step toward becoming a better software engineer.</p>
        <ul style="line-height:2;color:#374151;">
          <li>💻 Solve real coding challenges.</li>
          <li>🎯 Practice AI-powered mock interviews.</li>
          <li>📈 Track your learning progress.</li>
          <li>🏆 Improve your confidence and crack top tech interviews.</li>
        </ul>
        <p style="font-weight:bold;color:#1e40af;">Keep learning. Keep building. Keep growing.</p>
      </div>
      <div style="text-align:center;margin:35px 0;">
        <a href="${dashboardUrl}" style="background:#2563eb;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:bold;display:inline-block;">Go to Dashboard</a>
      </div>
      <p style="color:#4b5563;line-height:1.8;">If this login was made by you, no further action is required.</p>
      <p style="color:#dc2626;font-weight:bold;">If you don't recognize this login, please reset your password immediately and contact our support team.</p>
      <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">
      <p style="line-height:1.8;color:#374151;">
        Thank you for choosing <strong>${PLATFORM_NAME}</strong> as your interview preparation partner.
        We're excited to help you build your skills, prepare for technical interviews, and achieve your dream career.
      </p>
      <p style="margin-top:35px;">Best Regards,<br><strong>${TEAM_NAME}</strong></p>
    </div>
    <div style="background:#f9fafb;padding:20px;text-align:center;color:#6b7280;font-size:13px;">
      © ${new Date().getFullYear()} ${PLATFORM_NAME}. All Rights Reserved.<br><br>
      Learn • Practice • Build • Get Hired 🚀
    </div>
  </div>
</div>`;
}

function buildLoginEmailText({ userName, email, loginAt, dashboardUrl }) {
  return `Hello ${userName},

Your ${PLATFORM_NAME} account was successfully logged in.

Email: ${email}
Login time: ${loginAt}

Go to your dashboard: ${dashboardUrl}

If you don't recognize this login, reset your password immediately.

— ${TEAM_NAME}`;
}

function buildLoginTemplateParams(user) {
  const loginAt = formatLoginTime(new Date());
  const dashboardUrl = `${config.clientUrl}/dashboard`;
  const userName = firstName(user.name);
  const subject = `Login successful — ${PLATFORM_NAME}`;

  return {
    user_name: userName,
    user_email: user.email,
    to_email: user.email,
    login_time: loginAt,
    dashboard_url: dashboardUrl,
    platform_name: PLATFORM_NAME,
    team_name: TEAM_NAME,
    subject,
    reply_to: user.email,
    name: userName,
    email: user.email,
    message: buildLoginEmailText({
      userName,
      email: user.email,
      loginAt,
      dashboardUrl,
    }),
  };
}

export async function sendLoginSuccessEmail(user) {
  if (!user?._id || user.role === 'admin') {
    console.log('Login email skipped: admin account');
    return null;
  }
  if (user.settings?.emailNotifications === false) {
    console.log(`Login email skipped: notifications disabled for ${user.email}`);
    return null;
  }

  const now = Date.now();
  if (user.lastLoginEmailAt && now - new Date(user.lastLoginEmailAt).getTime() < LOGIN_EMAIL_COOLDOWN_MS) {
    console.log(`Login email skipped: already sent today to ${user.email}`);
    return null;
  }

  const templateParams = buildLoginTemplateParams(user);
  const html = buildLoginEmailHtml({
    userName: templateParams.user_name,
    email: templateParams.user_email,
    loginAt: templateParams.login_time,
    dashboardUrl: templateParams.dashboard_url,
  });

  console.log(`Sending login email to ${user.email}...`);
  const result = await sendEmail({
    to: user.email,
    subject: templateParams.subject,
    html,
    text: templateParams.message,
    templateParams,
  });

  if (result.sent) {
    await User.updateOne({ _id: user._id }, { lastLoginEmailAt: new Date() });
    console.log(`Login email delivered to ${user.email} via ${result.provider || 'email'}`);
  } else {
    console.warn(`Login email not sent to ${user.email}: ${result.reason}`);
  }

  return result;
}
