import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim();
    const phone = searchParams.get('phone')?.trim();

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Provide email or phone to check' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const results: { emailTaken?: boolean; phoneTaken?: boolean } = {};

      if (email) {
        const emailResult = await client.query(
          'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
          [email]
        );
        results.emailTaken = emailResult.rows.length > 0;
      }

      if (phone) {
        const phoneResult = await client.query(
          'SELECT id FROM users WHERE phone_number = $1 OR phone_number_2 = $1',
          [phone]
        );
        results.phoneTaken = phoneResult.rows.length > 0;
      }

      return NextResponse.json(results, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error: unknown) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
