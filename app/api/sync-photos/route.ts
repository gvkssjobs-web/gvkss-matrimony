import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/sync-photos
 * Syncs photo URLs from photo column to photo_s3_url column
 * This is a one-time migration script
 */
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      // Get all users with photo URLs but no photo_s3_url
      const result = await client.query(`
        SELECT id, photo 
        FROM users 
        WHERE photo IS NOT NULL 
        AND photo != '' 
        AND (photo_s3_url IS NULL OR photo_s3_url = '')
      `);

      let updated = 0;
      for (const user of result.rows) {
        if (user.photo && (user.photo.includes('s3') || user.photo.includes('amazonaws.com'))) {
          await client.query(
            'UPDATE users SET photo_s3_url = $1 WHERE id = $2',
            [user.photo, user.id]
          );
          updated++;
        }
      }

      return NextResponse.json(
        { 
          message: 'Photo sync completed',
          usersFound: result.rows.length,
          usersUpdated: updated
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error syncing photos:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync photos', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
