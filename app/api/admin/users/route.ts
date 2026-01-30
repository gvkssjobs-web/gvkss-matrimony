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
        'SELECT id, email, name, role, status, created_at FROM users ORDER BY created_at DESC'
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

// PATCH - Update user role or status (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const { userId, role, status } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      let updateQuery = '';
      let updateValues: any[] = [];
      let updateIndex = 1;

      if (role) {
        const validRoles = ['admin', 'user'];
        if (!validRoles.includes(role)) {
          return NextResponse.json(
            { error: 'Invalid role' },
            { status: 400 }
          );
        }
        updateQuery = `UPDATE users SET role = $${updateIndex}, updated_at = CURRENT_TIMESTAMP WHERE id = $${updateIndex + 1}`;
        updateValues = [role, userId];
      } else if (status) {
        const validStatuses = ['pending', 'accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
          return NextResponse.json(
            { error: 'Invalid status. Must be pending, accepted, or rejected' },
            { status: 400 }
          );
        }
        updateQuery = `UPDATE users SET status = $${updateIndex}, updated_at = CURRENT_TIMESTAMP WHERE id = $${updateIndex + 1}`;
        updateValues = [status, userId];
      } else {
        return NextResponse.json(
          { error: 'Either role or status must be provided' },
          { status: 400 }
        );
      }

      const result = await client.query(
        `${updateQuery} RETURNING id, email, name, role, status`,
        updateValues
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]).catch(() => {});

      return NextResponse.json(
        {
          message: role ? 'User role updated successfully' : 'User status updated successfully',
          user: result.rows[0],
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
