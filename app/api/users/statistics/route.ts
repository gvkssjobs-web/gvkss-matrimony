import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      // Get total count of all users (excluding admin)
      const totalResult = await client.query(
        `SELECT COUNT(*) as count FROM users WHERE role != 'admin' OR role IS NULL`
      );
      const totalUsers = parseInt(totalResult.rows[0].count);

      // Get counts by role
      const roleCounts: { [key: string]: number } = {
        gold: 0,
        silver: 0,
        platinum: 0,
      };

      for (const role of ['gold', 'silver', 'platinum']) {
        const roleResult = await client.query(
          `SELECT COUNT(*) as count FROM users WHERE role = $1`,
          [role]
        );
        roleCounts[role] = parseInt(roleResult.rows[0].count);
      }

      // Get active users count (users with role gold, silver, or platinum)
      const activeResult = await client.query(
        `SELECT COUNT(*) as count FROM users WHERE role IN ('gold', 'silver', 'platinum')`
      );
      const activeUsers = parseInt(activeResult.rows[0].count);

      return NextResponse.json(
        {
          total: totalUsers,
          active: activeUsers,
          byRole: roleCounts,
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching user statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
