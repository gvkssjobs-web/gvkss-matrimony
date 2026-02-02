import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
      const { 
      email, password, name, surname, role, photo, photo2, photo3, photo4, photos, phoneNumber, phoneNumber2, gender, dob,
      marriageStatus, birthTime, birthPlace, height, complexion, siblingsInfo,
      fatherName, fatherOccupation, fatherContact, motherName, motherOccupation, motherContact,
      star, raasi, gothram, padam, uncleGothram,
      educationCategory, educationDetails, employedIn, occupation, occupationInDetails, annualIncome, address
    } = await request.json();

    const photoList = Array.isArray(photos) && photos.length >= 2
      ? photos.slice(0, 4)
      : [photo, photo2, photo3, photo4].filter(Boolean);
    if (photoList.length < 2 || photoList.length > 4) {
      return NextResponse.json(
        { error: 'Between 2 and 4 photos are required' },
        { status: 400 }
      );
    }

    if (!fatherName?.trim()) {
      return NextResponse.json(
        { error: "Father's name is required" },
        { status: 400 }
      );
    }
    if (!fatherOccupation?.trim()) {
      return NextResponse.json(
        { error: "Father's occupation is required" },
        { status: 400 }
      );
    }
    if (!motherName?.trim()) {
      return NextResponse.json(
        { error: "Mother's name is required" },
        { status: 400 }
      );
    }
    if (!motherOccupation?.trim()) {
      return NextResponse.json(
        { error: "Mother's occupation is required" },
        { status: 400 }
      );
    }

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
      const phone2 = phoneNumber2 ?? null;
      if (phone2 && phone2 !== phone) {
        const existingPhone2 = await client.query(
          'SELECT id FROM users WHERE phone_number = $1 OR phone_number_2 = $1',
          [phone2]
        );
        if (existingPhone2.rows.length > 0) {
          return NextResponse.json(
            { error: 'Second phone number is already registered' },
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

      const photo1 = photoList[0] || null;
      const photo2Val = photoList[1] || null;
      const photo3Val = photoList[2] || null;
      const photo4Val = photoList[3] || null;

      // Insert new user with explicit id (status NULL until admin accepts)
      const result = await client.query(
        `INSERT INTO users (
          id, email, password, name, surname, role, photo, photo_2, photo_3, photo_4, phone_number, phone_number_2, gender, dob,
          marriage_status, birth_time, birth_place, height, complexion, siblings_info,
          father_name, father_occupation, father_contact, mother_name, mother_occupation, mother_contact,
          star, raasi, gothram, padam, uncle_gothram,
          education_category, education_details, employed_in, occupation, occupation_in_details, annual_income, address, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39
        ) RETURNING id, email, name, surname, role, photo, phone_number, phone_number_2, gender, dob,
          marriage_status, birth_time, birth_place, height, complexion, siblings_info,
          father_name, father_occupation, father_contact, mother_name, mother_occupation, mother_contact,
          star, raasi, gothram, padam, uncle_gothram,
          education_category, education_details, employed_in, occupation, occupation_in_details, annual_income, address, status`,
        [
          finalId,
          email,
          hashedPassword,
          name || null,
          surname || null,
          userRole,
          photo1,
          photo2Val,
          photo3Val,
          photo4Val,
          phoneNumber || null,
          phoneNumber2 || null,
          gender || null,
          dob || null,
          marriageStatus || null,
          birthTime || null,
          birthPlace || null,
          height || null,
          complexion || null,
          siblingsInfo ? JSON.stringify(siblingsInfo) : null,
          fatherName || null,
          fatherOccupation || null,
          fatherContact || null,
          motherName || null,
          motherOccupation || null,
          motherContact || null,
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
          address || null,
          null
        ]
      );

      const newUserId = result.rows[0].id;
      await client.query(
        'INSERT INTO notifications (user_id) VALUES ($1)',
        [newUserId]
      ).catch(() => {});

      const verificationToken = crypto.randomBytes(32).toString('hex');
      await client.query(
        'UPDATE users SET email_verification_token = $1 WHERE id = $2',
        [verificationToken, newUserId]
      );
      await sendVerificationEmail(email, verificationToken);

      const row = result.rows[0];
      return NextResponse.json(
        {
          message: 'User registered successfully. Please check your email to verify your account before signing in.',
          user: {
            id: row.id,
            email: row.email,
            name: row.name,
            surname: row.surname,
            role: row.role,
            photo: row.photo,
            phoneNumber: row.phone_number,
            phoneNumber2: row.phone_number_2 || null,
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
            fatherName: row.father_name || null,
            fatherOccupation: row.father_occupation || null,
            fatherContact: row.father_contact || null,
            motherName: row.mother_name || null,
            motherOccupation: row.mother_occupation || null,
            motherContact: row.mother_contact || null,
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
