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
    const body = await request.json();
    const userId = body.userId != null ? Number(body.userId) : null;
    const { role, status } = body;

    if (userId == null || isNaN(userId)) {
      return NextResponse.json(
        { error: 'User ID is required and must be a number' },
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
        // Reject = delete user (auto-delete on reject)
        if (status === 'rejected') {
          await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]).catch(() => {});
          const delResult = await client.query(
            'DELETE FROM users WHERE id = $1 RETURNING id, email, name',
            [userId]
          );
          if (delResult.rows.length === 0) {
            return NextResponse.json(
              { error: 'User not found' },
              { status: 404 }
            );
          }
          return NextResponse.json(
            { message: 'User rejected and deleted successfully', user: delResult.rows[0], deleted: true },
            { status: 200 }
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

      // When accepting, assign next serial id from 5000 (5000, 5001, 5002, ...)
      // Must use smallest available id >= 5000, NOT MAX(id)+1 (random ids like 887458 would give 887460)
      let returnedUser = result.rows[0];
      if (status === 'accepted') {
        let nextId: number;
        try {
          const nextResult = await client.query(
            "SELECT nextval('accepted_user_id_seq') AS next_id"
          );
          nextId = Number(nextResult.rows[0]?.next_id ?? 5000);
        } catch {
          // Sequence not created: use first available id in 5000, 5001, 5002, ...
          const gapResult = await client.query(
            `SELECT i AS next_id FROM generate_series(5000, 99999) i 
             WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = i) 
             ORDER BY i LIMIT 1`
          );
          nextId = Number(gapResult.rows[0]?.next_id ?? 5000);
        }
        console.log('[Accept] Updating user id', userId, '->', nextId);
        try {
          const updateIdResult = await client.query(
            'UPDATE users SET id = $1 WHERE id = $2',
            [nextId, userId]
          );
          if (updateIdResult.rowCount !== 1) {
            console.error('[Accept] id update rowCount', updateIdResult.rowCount, { userId, nextId });
            return NextResponse.json(
              { error: 'Failed to assign new ID (update affected ' + updateIdResult.rowCount + ' rows).' },
              { status: 500 }
            );
          }
          console.log('[Accept] User id updated successfully:', userId, '->', nextId);
          returnedUser = { ...returnedUser, id: nextId };
        } catch (idUpdateErr: any) {
          console.error('[Accept] id update failed', { userId, nextId, code: idUpdateErr?.code, message: idUpdateErr?.message });
          const msg = idUpdateErr?.message || String(idUpdateErr);
          return NextResponse.json(
            { error: 'Failed to assign new ID. Database error: ' + msg },
            { status: 500 }
          );
        }
      }

      return NextResponse.json(
        {
          message: role ? 'User role updated successfully' : 'User status updated successfully',
          user: returnedUser,
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
