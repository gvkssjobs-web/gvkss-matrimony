import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both Promise and direct params (for different Next.js versions)
    const resolvedParams = params instanceof Promise ? await params : params;
    const idParam = resolvedParams.id;

    if (!idParam) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userId = parseInt(idParam);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID. Must be a number.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          id, email, name, role, photo, phone_number, gender, 
          dob, birth_time, birth_place, height, complexion,
          star, raasi, gothram, padam, uncle_gothram,
          education_category, education_details, employed_in,
          address, created_at, siblings_info
        FROM users 
        WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = result.rows[0];

      return NextResponse.json(
        {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || 'silver',
            photo: user.photo || null,
            phoneNumber: user.phone_number || null,
            gender: user.gender || null,
            dob: user.dob || null,
            birthTime: user.birth_time || null,
            birthPlace: user.birth_place || null,
            height: user.height || null,
            complexion: user.complexion || null,
            star: user.star || null,
            raasi: user.raasi || null,
            gothram: user.gothram || null,
            padam: user.padam || null,
            uncleGothram: user.uncle_gothram || null,
            educationCategory: user.education_category || null,
            educationDetails: user.education_details || null,
            employedIn: user.employed_in || null,
            address: user.address || null,
            createdAt: user.created_at,
            siblingsInfo: user.siblings_info || null,
          },
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
