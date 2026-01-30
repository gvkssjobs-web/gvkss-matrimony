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

      // Insert new user with all fields (status is NULL initially)
      const result = await client.query(
        `INSERT INTO users (
          email, password, name, role, photo, phone_number, gender, dob,
          marriage_status, birth_time, birth_place, height, complexion, siblings_info,
          star, raasi, gothram, padam, uncle_gothram,
          education_category, education_details, employed_in, occupation, occupation_in_details, annual_income, address, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, NULL
        ) RETURNING id, email, name, role, photo, phone_number, gender, dob,
          marriage_status, birth_time, birth_place, height, complexion, siblings_info,
          star, raasi, gothram, padam, uncle_gothram,
          education_category, education_details, employed_in, occupation, occupation_in_details, annual_income, address, status`,
        [
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
            gender: result.rows[0].gender,
            dob: result.rows[0].dob,
            marriageStatus: result.rows[0].marriage_status,
            birthTime: result.rows[0].birth_time,
            birthPlace: result.rows[0].birth_place,
            height: result.rows[0].height,
            complexion: result.rows[0].complexion,
            siblingsInfo: result.rows[0].siblings_info,
            star: result.rows[0].star,
            raasi: result.rows[0].raasi,
            gothram: result.rows[0].gothram,
            padam: result.rows[0].padam,
            uncleGothram: result.rows[0].uncle_gothram,
            educationCategory: result.rows[0].education_category,
            educationDetails: result.rows[0].education_details,
            employedIn: result.rows[0].employed_in,
            occupation: result.rows[0].occupation,
            occupationInDetails: result.rows[0].occupation_in_details,
            annualIncome: result.rows[0].annual_income,
            address: result.rows[0].address,
            status: result.rows[0].status,
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
