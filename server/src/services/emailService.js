import nodemailer from 'nodemailer';
import emailjs from '@emailjs/nodejs';
import { config } from '../config/index.js';

let smtpTransporter = null;
let devTransporterPromise = null;

function resolveFromAddress() {
  if (process.env.SMTP_FROM?.trim()) return process.env.SMTP_FROM.trim();
  const verified = process.env.SMTP_VERIFIED_EMAIL?.trim();
  if (verified) return `InterviewIQ AI <${verified}>`;
  const user = config.email.user;
  if (user && user.includes('@')) return `InterviewIQ AI <${user}>`;
  return 'InterviewIQ AI <noreply@interviewiq.ai>';
}

function getSmtpTransporter() {
  if (!config.email.enabled) return null;
  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
  return smtpTransporter;
}

async function getDevTransporter() {
  if (!devTransporterPromise) {
    devTransporterPromise = (async () => {
      const testAccount = await nodemailer.createTestAccount();
      console.log('Email (dev fallback): Ethereal test inbox — add Gmail SMTP in .env for real emails to phone');
      return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    })();
  }
  return devTransporterPromise;
}

export function isEmailConfigured() {
  return config.email.enabled || (config.emailjs.enabled && config.emailjs.privateKey);
}

export function logEmailStatus() {
  const from = resolveFromAddress();
  if (config.email.enabled) {
    console.log(`Email: SMTP ready (${config.email.host}) — from: ${from}`);
  } else if (config.emailjs.enabled && config.emailjs.privateKey) {
    console.log('Email: EmailJS (Node SDK) ready — login emails enabled');
  } else if (config.emailjs.enabled) {
    console.warn('Email: EmailJS missing EMAILJS_PRIVATE_KEY — add it or use Gmail SMTP');
  } else if (config.nodeEnv === 'development') {
    console.log('Email: not configured — dev will use Ethereal preview links in logs');
  } else {
    console.warn('Email: not configured — set Gmail SMTP in environment (see server/.env.example)');
  }
}

async function sendViaSmtp({ to, subject, html, text }) {
  let transport = getSmtpTransporter();
  const isDevFallback = !transport && config.nodeEnv === 'development';

  if (isDevFallback) {
    transport = await getDevTransporter();
  }
  if (!transport) {
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const from = isDevFallback ? '"InterviewIQ AI" <dev@interviewiq.local>' : resolveFromAddress();

  const info = await transport.sendMail({ from, to, subject, html, text });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`Login email preview (dev): ${previewUrl}`);
    return { sent: true, provider: 'ethereal', previewUrl };
  }

  console.log(`Email sent via SMTP to ${to}`);
  return { sent: true, messageId: info.messageId, provider: 'smtp' };
}

async function sendViaEmailJS({ to, subject, templateParams }) {
  if (!config.emailjs.enabled || !config.emailjs.privateKey) {
    return { sent: false, reason: 'emailjs_not_configured' };
  }

  try {
    await emailjs.send(
      config.emailjs.serviceId,
      config.emailjs.templateId,
      {
        to_email: to,
        user_email: to,
        email: to,
        subject,
        ...templateParams,
      },
      {
        publicKey: config.emailjs.publicKey,
        privateKey: config.emailjs.privateKey,
      }
    );
    console.log(`Email sent via EmailJS to ${to}`);
    return { sent: true, provider: 'emailjs' };
  } catch (error) {
    const msg = error?.text || error?.message || String(error);
    console.error(`EmailJS failed to ${to}:`, msg);
    return { sent: false, reason: msg };
  }
}

export async function sendEmail({ to, subject, html, text, templateParams }) {
  // 1) SMTP first — Gmail works reliably from Node/server
  if (config.email.enabled) {
    try {
      const result = await sendViaSmtp({ to, subject, html, text });
      if (result.sent) return result;
      console.warn(`SMTP failed (${result.reason}), trying EmailJS...`);
    } catch (error) {
      console.error(`SMTP error to ${to}:`, error.message);
    }
  }

  // 2) EmailJS Node SDK (needs private key + server access enabled in EmailJS dashboard)
  if (config.emailjs.enabled && config.emailjs.privateKey) {
    const result = await sendViaEmailJS({ to, subject, templateParams });
    if (result.sent) return result;
  }

  // 3) Dev Ethereal preview when nothing else works
  if (config.nodeEnv === 'development') {
    try {
      return await sendViaSmtp({ to, subject, html, text });
    } catch (error) {
      return { sent: false, reason: error.message };
    }
  }

  return {
    sent: false,
    reason: 'Configure Gmail SMTP in .env (recommended) — see server/.env.example',
  };
}
