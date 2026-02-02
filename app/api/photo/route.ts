import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getFromS3 } from '@/lib/aws-s3';

const PHOTO_COLUMNS = [
  { blob: 'photo_blob', s3: 'photo_s3_url', url: 'photo' },
  { blob: 'photo_2_blob', s3: 'photo_2_s3_url', url: 'photo_2' },
  { blob: 'photo_3_blob', s3: 'photo_3_s3_url', url: 'photo_3' },
  { blob: 'photo_4_blob', s3: 'photo_4_s3_url', url: 'photo_4' },
] as const;

/**
 * GET /api/photo?userId=123&index=0
 * Serves photo blob from PostgreSQL. index=0..3 for up to 4 photos per user.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const indexParam = searchParams.get('index');
    const index = indexParam != null ? Math.max(0, Math.min(3, parseInt(indexParam, 10) || 0)) : 0;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const cols = PHOTO_COLUMNS[index];
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT ${cols.blob}, ${cols.s3}, ${cols.url} FROM users WHERE id = $1`,
        [parseInt(userId)]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const row = result.rows[0];
      const photoBlob = row[cols.blob];
      const photoS3Url = row[cols.s3];
      const photo = row[cols.url];

      if (photoBlob) {
        const buffer = Buffer.from(photoBlob);
        let contentType = 'image/jpeg';
        const s3Url = photoS3Url || photo;
        if (s3Url && typeof s3Url === 'string') {
          const ext = s3Url.split('.').pop()?.toLowerCase();
          if (ext === 'png') contentType = 'image/png';
          else if (ext === 'gif') contentType = 'image/gif';
          else if (ext === 'webp') contentType = 'image/webp';
        }
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      const s3Url = photoS3Url || photo;
      if (s3Url && typeof s3Url === 'string' && (s3Url.includes('s3.amazonaws.com') || s3Url.includes('.s3.') || s3Url.includes('amazonaws.com'))) {
        try {
          let s3Key = '';
          try {
            const urlObj = new URL(s3Url);
            s3Key = urlObj.pathname.substring(1).split('?')[0];
          } catch {
            if (s3Url.includes('.s3.')) {
              const parts = s3Url.split('.s3.');
              if (parts.length === 2) s3Key = parts[1].split('/').slice(1).join('/').split('?')[0];
            }
          }
          if (s3Key) {
            const imageBuffer = await getFromS3(s3Key);
            let contentType = 'image/jpeg';
            const ext = s3Key.split('.').pop()?.toLowerCase();
            if (ext === 'png') contentType = 'image/png';
            else if (ext === 'gif') contentType = 'image/gif';
            else if (ext === 'webp') contentType = 'image/webp';
            return new NextResponse(new Uint8Array(imageBuffer), {
              status: 200,
              headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
              },
            });
          }
        } catch (fetchError) {
          console.error('Photo API - S3 fetch error:', fetchError);
        }
      }

      return NextResponse.json(
        { error: 'No photo found for this user at index ' + index },
        { status: 404 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error retrieving photo:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve photo', details: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500 }
    );
  }
}
