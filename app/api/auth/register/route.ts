import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
      const { 
      email, password, name, role, photo, phoneNumber, gender, dob,
      marriageStatus, birthTime, birthPlace, height, complexion, siblingsInfo,
      star, raasi, gothram, padam, uncleGothram,
      educationCategory, educationDetails, employedIn, occupation, occupationInDetails, annualIncome, address
    } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Password validation: min 8 chars, 1 upper, 1 lower, 1 number, 1 special
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter' },
        { status: 400 }
      );
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one lowercase letter' },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one number' },
        { status: 400 }
      );
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return NextResponse.json(
        { error: 'Password must contain at least one special character' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const existingEmail = await client.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      );

      if (existingEmail.rows.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 409 }
        );
      }

      const phone = phoneNumber ?? null;
      if (phone) {
        const existingPhone = await client.query(
          'SELECT id FROM users WHERE phone_number = $1',
          [phone]
        );
        if (existingPhone.rows.length > 0) {
          return NextResponse.json(
            { error: 'User with this phone number already exists' },
            { status: 409 }
          );
        }
      }

      // Set default role to 'user' for all registrations (admin can only be created manually)
      // Always set to 'user' regardless of what's passed in
      if (role === 'admin') {
        return NextResponse.json(
          { error: 'Admin role cannot be registered. Please contact administrator.' },
          { status: 403 }
        );
      }
      
      // Force role to 'user' for all new registrations
      const userRole = 'user';

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Random id for new registrations (100000–999999); changed to 5000+ when admin accepts
      let newId: number;
      for (let attempt = 0; attempt < 20; attempt++) {
        newId = 100000 + Math.floor(Math.random() * 900000);
        const exists = await client.query('SELECT 1 FROM users WHERE id = $1', [newId]);
        if (exists.rows.length === 0) break;
      }
      const finalId = newId!;

      // Insert new user with explicit id (status NULL until admin accepts)
      const result = await client.query(
        `INSERT INTO users (
          id, email, password, name, role, photo, phone_number, gender, dob,
          marriage_status, birth_time, birth_place, height, complexion, siblings_info,
          star, raasi, gothram, padam, uncle_gothram,
          education_category, education_details, employed_in, occupation, occupation_in_details, annual_income, address, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NULL
        ) RETURNING id, email, name, role, photo, phone_number, gender, dob,
          marriage_status, birth_time, birth_place, height, complexion, siblings_info,
          star, raasi, gothram, padam, uncle_gothram,
          education_category, education_details, employed_in, occupation, occupation_in_details, annual_income, address, status`,
        [
          finalId,
          email,
          hashedPassword,
          name || null,
          userRole,
          photo || null,
          phoneNumber || null,
          gender || null,
          dob || null,
          marriageStatus || null,
          birthTime || null,
          birthPlace || null,
          height || null,
          complexion || null,
          siblingsInfo ? JSON.stringify(siblingsInfo) : null,
          star || null,
          raasi || null,
          gothram || null,
          padam || null,
          uncleGothram || null,
          educationCategory || null,
          educationDetails || null,
          employedIn || null,
          occupation || null,
          occupationInDetails || null,
          annualIncome || null,
          address || null
        ]
      );

      const newUserId = result.rows[0].id;
      await client.query(
        'INSERT INTO notifications (user_id) VALUES ($1)',
        [newUserId]
      ).catch(() => {});

      const row = result.rows[0];
      return NextResponse.json(
        {
          message: 'User registered successfully',
          user: {
            id: row.id,
            email: row.email,
            name: row.name,
            role: row.role,
            photo: row.photo,
            phoneNumber: row.phone_number,
            gender: row.gender,
            dob: row.dob,
            marriageStatus: row.marriage_status,
            birthTime: row.birth_time,
            birthPlace: row.birth_place,
            height: row.height,
            complexion: row.complexion,
            siblingsInfo: row.siblings_info,
            star: row.star,
            raasi: row.raasi,
            gothram: row.gothram,
            padam: row.padam,
            uncleGothram: row.uncle_gothram,
            educationCategory: row.education_category,
            educationDetails: row.education_details,
            employedIn: row.employed_in,
            occupation: row.occupation,
            occupationInDetails: row.occupation_in_details,
            annualIncome: row.annual_income,
            address: row.address,
            status: row.status,
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
