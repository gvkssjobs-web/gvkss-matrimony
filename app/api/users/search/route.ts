import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender'); // 'bride' or 'groom'
    const minAge = searchParams.get('minAge');
    const maxAge = searchParams.get('maxAge');
    const minHeight = searchParams.get('minHeight');
    const maxHeight = searchParams.get('maxHeight');

    const client = await pool.connect();
    try {
      let query = `
        SELECT 
          id, email, name, role, photo, photo_s3_url, phone_number, gender, 
          dob, height, created_at
        FROM users 
        WHERE role != 'admin'
      `;
      const params: any[] = [];
      let paramIndex = 1;

      // Filter by gender
      if (gender) {
        if (gender === 'bride') {
          query += ` AND (LOWER(gender) = 'bride' OR LOWER(gender) = 'female' OR LOWER(gender) = 'f' OR gender = 'Bride')`;
        } else if (gender === 'groom') {
          query += ` AND (LOWER(gender) = 'groom' OR LOWER(gender) = 'male' OR LOWER(gender) = 'm' OR gender = 'Groom')`;
        }
      }

      // Filter by age range (using DOB)
      // Age calculation based on current date
      if (minAge || maxAge) {
        const currentDate = new Date();
        
        if (maxAge) {
          // For maxAge: person should be AT MOST maxAge years old
          // Calculate the earliest birth date (most recent) that makes someone maxAge years old
          // Example: If maxAge is 45 and today is 2026-01-27, person should be born on or after 1981-01-27
          const maxBirthDate = new Date(currentDate);
          maxBirthDate.setFullYear(currentDate.getFullYear() - parseInt(maxAge));
          query += ` AND dob >= $${paramIndex}`;
          params.push(maxBirthDate.toISOString().split('T')[0]);
          paramIndex++;
        }
        if (minAge) {
          // For minAge: person should be AT LEAST minAge years old
          // Calculate the latest birth date (oldest) that makes someone minAge years old
          // Example: If minAge is 18 and today is 2026-01-27, person should be born on or before 2008-01-27
          const minBirthDate = new Date(currentDate);
          minBirthDate.setFullYear(currentDate.getFullYear() - parseInt(minAge));
          query += ` AND dob <= $${paramIndex}`;
          params.push(minBirthDate.toISOString().split('T')[0]);
          paramIndex++;
        }
      }

      // Filter by height range
      // Note: Height filtering is done at application level since height is stored as string
      // For now, we'll fetch all users and filter by height in the application
      // In a production app, you'd want to normalize heights to a comparable format in the database

      query += ` AND dob IS NOT NULL ORDER BY created_at DESC`;

      console.log('Search query:', query);
      console.log('Search params:', params);
      
      const result = await client.query(query, params);
      
      console.log('Search results count:', result.rows.length);

      return NextResponse.json(
        { users: result.rows },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
