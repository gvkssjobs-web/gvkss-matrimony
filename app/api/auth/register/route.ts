import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role, photo, phoneNumber, profession, age, gender } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const client = await pool.connect();
    try {
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }

      // Validate role - only gold, silver, platinum can be registered
      // Admin role cannot be registered through the form
      const registrableRoles = ['gold', 'silver', 'platinum'];
      
      if (role === 'admin') {
        return NextResponse.json(
          { error: 'Admin role cannot be registered. Please contact administrator.' },
          { status: 403 }
        );
      }
      
      const userRole = role && registrableRoles.includes(role) ? role : 'silver';

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Validate age if provided
      const ageValue = age !== null && age !== undefined ? (typeof age === 'string' ? parseInt(age) : age) : null;
      if (ageValue !== null) {
        if (isNaN(ageValue) || ageValue < 1 || ageValue > 150) {
          return NextResponse.json(
            { error: 'Please enter a valid age (1-150)' },
            { status: 400 }
          );
        }
      }

      // Insert new user with all fields
      const result = await client.query(
        'INSERT INTO users (email, password, name, role, photo, phone_number, profession, age, gender) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id, email, name, role, photo, phone_number, profession, age, gender',
        [
          email, 
          hashedPassword, 
          name || null, 
          userRole, 
          photo || null,
          phoneNumber || null,
          profession || null,
          ageValue,
          gender || null
        ]
      );

      return NextResponse.json(
        {
          message: 'User registered successfully',
          user: {
            id: result.rows[0].id,
            email: result.rows[0].email,
            name: result.rows[0].name,
            role: result.rows[0].role,
            photo: result.rows[0].photo,
            phoneNumber: result.rows[0].phone_number,
            profession: result.rows[0].profession,
            age: result.rows[0].age,
            gender: result.rows[0].gender,
          },
        },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
