import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// DELETE - Remove all users except admin users
// WARNING: This is a destructive operation!
export async function DELETE(request: NextRequest) {
  try {
    // In production, add proper admin authentication here
    // const user = getCurrentUser();
    // if (!user || user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const client = await pool.connect();
    try {
      // Delete all users where role is NOT 'admin'
      const result = await client.query(
        'DELETE FROM users WHERE role != $1 OR role IS NULL RETURNING id, email, name, role',
        ['admin']
      );

      return NextResponse.json(
        {
          message: `Successfully deleted ${result.rows.length} non-admin user(s)`,
          deletedUsers: result.rows,
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error deleting non-admin users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
