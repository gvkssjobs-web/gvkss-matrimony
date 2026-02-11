export function getAppUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;

  const explicit =
    process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;

  if (explicit) return explicit.replace(/\/$/, '');

  return 'http://localhost:3000';
}

async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    try {
      const nodemailer = await import('nodemailer');

      const transporter = nodemailer.default.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });

      await transporter.sendMail({
        from: `"Deepthi Matrimony" <${process.env.SMTP_FROM || user}>`,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });

      return true;
    } catch (err) {
      console.error('Email error:', err);
      return false;
    }
  }

  console.log('📧 SMTP not configured. Email link:');
  console.log(opts.text);
  return false;
}

export async function sendVerificationEmail(
  to: string,
  token: string
) {
  const link = `${getAppUrl()}/api/auth/verify-email?token=${token}`;

  return sendEmail({
    to,
    subject: 'Verify your email - Deepthi Matrimony',
    html: `<p>Verify your email:</p><a href="${link}">${link}</a>`,
    text: `Verify your email: ${link}`,
  });
}

export async function sendPasswordResetEmail(
  to: string,
  token: string
) {
  const link = `${getAppUrl()}/reset-password?token=${token}`;

  return sendEmail({
    to,
    subject: 'Reset Password - Deepthi Matrimony',
    html: `<p>Reset your password:</p><a href="${link}">${link}</a>`,
    text: `Reset password: ${link}`,
  });
}
