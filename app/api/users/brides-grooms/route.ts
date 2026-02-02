import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch brides and grooms for homepage display
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      const photoCountFromRow = (row: any) => {
        const hasPhoto = (i: number) => {
          const blob = row[['photo_blob', 'photo_2_blob', 'photo_3_blob', 'photo_4_blob'][i]];
          const url = row[['photo', 'photo_2', 'photo_3', 'photo_4'][i]];
          const s3 = row[['photo_s3_url', 'photo_2_s3_url', 'photo_3_s3_url', 'photo_4_s3_url'][i]];
          return !!(blob || (url != null && url !== '' && !String(url).startsWith('local-')) || (s3 != null && s3 !== '' && !String(s3).startsWith('local-')));
        };
        return Math.max(1, [0, 1, 2, 3].filter(i => hasPhoto(i)).length);
      };

      // Fetch brides (gender = 'female' or 'Female' or 'F' or 'Bride')
      const bridesResult = await client.query(
        `SELECT id, name, role, photo, photo_s3_url, photo_2, photo_2_s3_url, photo_3, photo_3_s3_url, photo_4, photo_4_s3_url, photo_blob, photo_2_blob, photo_3_blob, photo_4_blob, phone_number, gender, created_at 
         FROM users 
         WHERE role != 'admin' 
         AND (LOWER(gender) = 'female' OR LOWER(gender) = 'f' OR LOWER(gender) = 'bride' OR gender = 'Bride')
         ORDER BY created_at DESC
         LIMIT 20`
      );

      // Fetch grooms (gender = 'male' or 'Male' or 'M' or 'Groom')
      const groomsResult = await client.query(
        `SELECT id, name, role, photo, photo_s3_url, photo_2, photo_2_s3_url, photo_3, photo_3_s3_url, photo_4, photo_4_s3_url, photo_blob, photo_2_blob, photo_3_blob, photo_4_blob, phone_number, gender, created_at 
         FROM users 
         WHERE role != 'admin' 
         AND (LOWER(gender) = 'male' OR LOWER(gender) = 'm' OR LOWER(gender) = 'groom' OR gender = 'Groom')
         ORDER BY created_at DESC
         LIMIT 20`
      );

      const mapProfile = (row: any) => ({
        id: row.id,
        name: row.name || 'N/A',
        photo: row.photo || null,
        photo_s3_url: row.photo_s3_url || null,
        phone_number: row.phone_number,
        gender: row.gender,
        created_at: row.created_at,
        photoCount: photoCountFromRow(row)
      });

      return NextResponse.json(
        { 
          brides: (bridesResult.rows || []).map(mapProfile),
          grooms: (groomsResult.rows || []).map(mapProfile)
        },
        { status: 200 }
      );
    } catch (queryError: any) {
      console.error('Database query error:', queryError);
      // Return empty arrays instead of error to prevent page crash
      return NextResponse.json(
        { 
          brides: [],
          grooms: []
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching brides and grooms:', error);
    // Return empty arrays instead of error to prevent page crash
    return NextResponse.json(
      { 
        brides: [],
        grooms: []
      },
      { status: 200 }
    );
  }
}
