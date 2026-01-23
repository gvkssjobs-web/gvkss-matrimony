import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch brides and grooms for homepage display
export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();
    try {
      // Fetch brides (gender = 'female' or 'Female' or 'F')
      const bridesResult = await client.query(
        `SELECT id, name, role, photo, photo_s3_url, phone_number, profession, age, gender, created_at 
         FROM users 
         WHERE role != 'admin' 
         AND (LOWER(gender) = 'female' OR LOWER(gender) = 'f' OR LOWER(gender) = 'bride')
         ORDER BY created_at DESC
         LIMIT 20`
      );

      // Fetch grooms (gender = 'male' or 'Male' or 'M')
      const groomsResult = await client.query(
        `SELECT id, name, role, photo, photo_s3_url, phone_number, profession, age, gender, created_at 
         FROM users 
         WHERE role != 'admin' 
         AND (LOWER(gender) = 'male' OR LOWER(gender) = 'm' OR LOWER(gender) = 'groom')
         ORDER BY created_at DESC
         LIMIT 20`
      );

      return NextResponse.json(
        { 
          brides: bridesResult.rows,
          grooms: groomsResult.rows
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching brides and grooms:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
