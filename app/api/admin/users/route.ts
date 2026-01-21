import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd verify the user's session and role here
    // For now, we'll check via a header or implement proper session management
    const authHeader = request.headers.get('authorization');
    
    // This is a simplified check - in production, use proper JWT/session validation
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
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

// PATCH - Update user role (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    const validRoles = ['admin', 'gold', 'silver', 'platinum'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, name, role',
        [role, userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: 'User role updated successfully',
          user: result.rows[0],
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
