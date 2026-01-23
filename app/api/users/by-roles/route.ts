import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET - Fetch users by roles (for role-specific pages)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roles = searchParams.get('roles'); // Comma-separated roles like "silver" or "silver,gold"

    if (!roles) {
      return NextResponse.json(
        { error: 'Roles parameter is required' },
        { status: 400 }
      );
    }

    const roleArray = roles.split(',').map(r => r.trim());
    
    const client = await pool.connect();
    try {
      // Build query with proper IN clause
      const placeholders = roleArray.map((_, i) => `$${i + 1}`).join(', ');
      
      const result = await client.query(
        `SELECT id, email, name, role, photo, phone_number, profession, age, gender, created_at 
         FROM users 
         WHERE role IN (${placeholders})
         ORDER BY created_at DESC`,
        roleArray
      );

      return NextResponse.json(
        { users: result.rows },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching users by roles:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
