import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');
    if (!token?.trim()) {
      return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email FROM users WHERE email_verification_token = $1',
        [token.trim()]
      );

      if (result.rows.length === 0) {
        return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
      }

      await client.query(
        'UPDATE users SET email_verified_at = CURRENT_TIMESTAMP, email_verification_token = NULL WHERE id = $1',
        [result.rows[0].id]
      );

      return NextResponse.redirect(new URL('/login?verified=1', request.url));
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.redirect(new URL('/login?error=verify_failed', request.url));
  }
}
