/**
 * Email sending for verification and password reset.
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env to send real emails.
 * Set NEXT_PUBLIC_APP_URL or APP_URL for links (e.g. https://yoursite.com).
 * If SMTP not set, verification/reset links are logged to console (dev).
 */

export function getAppUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
}

export async function sendVerificationEmail(to: string, token: string): Promise<{ sent: boolean; link?: string }> {
  const baseUrl = getAppUrl();
  const verifyLink = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const html = `
    <p>Please verify your email by clicking the link below:</p>
    <p><a href="${verifyLink}" style="color: #E94B6A; font-weight: bold;">Verify my email</a></p>
    <p>Or copy this link: ${verifyLink}</p>
    <p>This link expires in 24 hours. If you did not create an account, you can ignore this email.</p>
  `;

  return sendEmail({
    to,
    subject: 'Verify your email - GVKSS Matrimony',
    html,
    text: `Verify your email: ${verifyLink}`,
  }).then((sent) => (sent ? { sent: true } : { sent: false, link: verifyLink }));
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<{ sent: boolean; link?: string }> {
  const baseUrl = getAppUrl();
  const resetLink = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;

  const html = `
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <p><a href="${resetLink}" style="color: #E94B6A; font-weight: bold;">Reset password</a></p>
    <p>Or copy this link: ${resetLink}</p>
    <p>This link expires in 1 hour. If you did not request a reset, you can ignore this email.</p>
  `;

  return sendEmail({
    to,
    subject: 'Reset your password - GVKSS Matrimony',
    html,
    text: `Reset password: ${resetLink}`,
  }).then((sent) => (sent ? { sent: true } : { sent: false, link: resetLink }));
}

async function sendEmail(opts: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        host,
        port: port ? parseInt(port, 10) : 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || user,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      return true;
    } catch (err) {
      console.error('Email send error:', err);
      return false;
    }
  }

  // No SMTP configured: log link for dev
  console.log('[Email] (SMTP not configured) Verification/Reset email would be sent to:', opts.to);
  console.log('[Email] Link:', opts.text.replace(/^(Reset password|Verify your email):\s*/, ''));
  return false;
}
