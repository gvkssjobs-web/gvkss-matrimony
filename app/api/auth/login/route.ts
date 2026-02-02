import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

      // Find user
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT id, email, password, name, role, photo, phone_number, gender, status, email_verified_at, email_verification_token FROM users WHERE email = $1',
          [email]
        );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const user = result.rows[0];

      if (user.role !== 'admin' && !user.email_verified_at && user.email_verification_token) {
        return NextResponse.json(
          { error: 'Please verify your email first. Check your inbox for the verification link.' },
          { status: 403 }
        );
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Return user data (excluding password)
      return NextResponse.json(
        {
          message: 'Login successful',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            photo: user.photo || null,
            phoneNumber: user.phone_number || null,
            gender: user.gender || null,
            status: user.status || null,
          },
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
