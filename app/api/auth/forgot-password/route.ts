import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email FROM users WHERE LOWER(email) = LOWER($1)',
        [email.trim()]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: 'If an account exists with this email, you will receive a password reset link.' },
          { status: 200 }
        );
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await client.query(
        'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
        [token, expires, result.rows[0].id]
      );

      const { sent, link } = await sendPasswordResetEmail(result.rows[0].email, token);

      return NextResponse.json({
        message: sent
          ? 'If an account exists with this email, you will receive a password reset link shortly. Please check your inbox.'
          : 'If an account exists with this email, you will receive a password reset link. (SMTP is not configured—see EMAIL_SETUP.md to send real emails. Use the link below for testing.)',
        emailSent: sent,
        ...(link && !sent && { devLink: link }),
      }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
