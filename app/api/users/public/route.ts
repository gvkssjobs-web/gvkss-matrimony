import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch all users for public display (excluding sensitive data)
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, role, photo, phone_number, gender, created_at FROM users WHERE role != $1 ORDER BY created_at DESC',
        ['admin']
      );

      return NextResponse.json(
        { users: result.rows },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
