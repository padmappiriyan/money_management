import nodemailer from 'nodemailer';
import { buildWelcomeUserEmail } from '../templates/welcomeUserEmail.js';

let transporter = null;
let transporterKey = null;

function getEmailConfig() {
  return {
    SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    SMTP_PORT: process.env.SMTP_PORT || '587',
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,
    APP_NAME: process.env.APP_NAME || 'Bontech',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  };
}

function isEmailConfigured() {
  const { SMTP_USER, SMTP_PASS } = getEmailConfig();
  return Boolean(SMTP_USER && SMTP_PASS);
}

function getTransporter() {
  if (!isEmailConfigured()) {
    return null;
  }

  const config = getEmailConfig();
  const key = `${config.SMTP_HOST}:${config.SMTP_PORT}:${config.SMTP_USER}`;

  if (!transporter || transporterKey !== key) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: Number(config.SMTP_PORT),
      secure: config.SMTP_SECURE,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
    transporterKey = key;
  }

  return transporter;
}

/**
 * Verify SMTP connection (optional startup / health check).
 * @returns {Promise<{ ok: boolean, reason?: string }>}
 */
export async function verifyEmailConnection() {
  const config = getEmailConfig();
  const transport = getTransporter();

  if (!transport) {
    return { ok: false, reason: 'SMTP_USER and SMTP_PASS are not set' };
  }

  try {
    await transport.verify();
    console.log('[Email] SMTP connection verified successfully.', {
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      user: config.SMTP_USER,
    });
    return { ok: true };
  } catch (err) {
    console.error('[Email] SMTP verification failed:', err.message);
    return { ok: false, reason: err.message };
  }
}

/**
 * Send welcome email with login credentials after admin creates a user.
 * @param {{ name: string, email: string, password: string, role: string }} params
 * @returns {Promise<{ sent: boolean, error?: string, messageId?: string }>}
 */
export async function sendWelcomeCredentialsEmail({ name, email, password, role }) {
  const config = getEmailConfig();

  if (!isEmailConfigured()) {
    console.warn('[Email] Skipped welcome email: SMTP not configured.', {
      hasUser: Boolean(config.SMTP_USER),
      hasPass: Boolean(config.SMTP_PASS),
    });
    return { sent: false, error: 'Email service is not configured' };
  }

  const transport = getTransporter();
  const from = config.EMAIL_FROM || `"${config.APP_NAME}" <${config.SMTP_USER}>`;
  const { subject, text, html } = buildWelcomeUserEmail({
    appName: config.APP_NAME,
    loginUrl: `${config.FRONTEND_URL.replace(/\/$/, '')}/login`,
    name,
    email,
    password,
    role,
  });

  console.log('[Email] Sending welcome credentials email...', {
    to: email,
    name,
    role,
    from,
    subject,
  });

  try {
    const info = await transport.sendMail({
      from,
      to: email,
      subject,
      text,
      html,
    });

    console.log('[Email] Welcome email sent successfully.', {
      to: email,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email] Failed to send welcome email:', {
      to: email,
      error: err.message,
      code: err.code,
    });
    return { sent: false, error: err.message };
  }
}

export { isEmailConfigured };
