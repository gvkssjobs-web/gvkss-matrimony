import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch brides and grooms for homepage display
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      // Fetch brides (gender = 'female' or 'Female' or 'F' or 'Bride')
      const bridesResult = await client.query(
        `SELECT id, name, role, photo, photo_s3_url, phone_number, gender, created_at 
         FROM users 
         WHERE role != 'admin' 
         AND (LOWER(gender) = 'female' OR LOWER(gender) = 'f' OR LOWER(gender) = 'bride' OR gender = 'Bride')
         ORDER BY created_at DESC
         LIMIT 20`
      );

      // Fetch grooms (gender = 'male' or 'Male' or 'M' or 'Groom')
      const groomsResult = await client.query(
        `SELECT id, name, role, photo, photo_s3_url, phone_number, gender, created_at 
         FROM users 
         WHERE role != 'admin' 
         AND (LOWER(gender) = 'male' OR LOWER(gender) = 'm' OR LOWER(gender) = 'groom' OR gender = 'Groom')
         ORDER BY created_at DESC
         LIMIT 20`
      );

      return NextResponse.json(
        { 
          brides: bridesResult.rows || [],
          grooms: groomsResult.rows || []
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
