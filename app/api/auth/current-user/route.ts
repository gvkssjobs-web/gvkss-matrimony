import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get user email from query params or headers
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, profile_id, email, name, role, photo, phone_number, gender FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = result.rows[0];

      return NextResponse.json(
        {
          user: {
            id: user.id,
            profileId: user.profile_id ?? user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'user',
            photo: user.photo || null,
            phoneNumber: user.phone_number || null,
            gender: user.gender || null,
          },
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
