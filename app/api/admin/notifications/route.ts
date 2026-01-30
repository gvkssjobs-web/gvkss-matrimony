import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - List notifications (new registrations) for admin
export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT n.id AS notification_id, n.user_id, n.created_at,
                u.name, u.email, u.status
         FROM notifications n
         JOIN users u ON u.id = n.user_id
         ORDER BY n.created_at DESC`
      );
      return NextResponse.json({ notifications: result.rows || [] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    if (error?.code === '42P01') return NextResponse.json({ notifications: [] });
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
