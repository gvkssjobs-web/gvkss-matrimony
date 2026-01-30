import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// DELETE - Dismiss a single notification (X button)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid notification ID' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM notifications WHERE id = $1 RETURNING id',
        [id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Notification dismissed' });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
