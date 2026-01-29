import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// PATCH - Update user profile (admin only, full inline edit)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const userId = parseInt(resolvedParams.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const allowedFields: Record<string, string> = {
      email: 'email',
      name: 'name',
      phoneNumber: 'phone_number',
      gender: 'gender',
      dob: 'dob',
      marriageStatus: 'marriage_status',
      birthTime: 'birth_time',
      birthPlace: 'birth_place',
      height: 'height',
      complexion: 'complexion',
      star: 'star',
      raasi: 'raasi',
      gothram: 'gothram',
      padam: 'padam',
      uncleGothram: 'uncle_gothram',
      educationCategory: 'education_category',
      educationDetails: 'education_details',
      employedIn: 'employed_in',
      occupation: 'occupation',
      occupationInDetails: 'occupation_in_details',
      annualIncome: 'annual_income',
      address: 'address',
      status: 'status',
    };

    const siblingsInfo = body.siblingsInfo;
    const setParts: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [camelKey, dbCol] of Object.entries(allowedFields)) {
      if (!(camelKey in body)) continue;
      const val = body[camelKey];
      setParts.push(`${dbCol} = $${idx}`);
      values.push(val === '' ? null : val);
      idx++;
    }

    if (siblingsInfo !== undefined) {
      setParts.push(`siblings_info = $${idx}`);
      values.push(siblingsInfo == null ? null : JSON.stringify(siblingsInfo));
      idx++;
    }

    if (setParts.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    values.push(userId);
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE users SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, email, name, role, phone_number, gender, dob, marriage_status, birth_time, birth_place, height, complexion, star, raasi, gothram, padam, uncle_gothram, education_category, education_details, employed_in, occupation, occupation_in_details, annual_income, address, siblings_info, status`,
        values
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const u = result.rows[0];
      return NextResponse.json({
        message: 'User updated successfully',
        user: {
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          phoneNumber: u.phone_number || null,
          gender: u.gender || null,
          dob: u.dob || null,
          marriageStatus: u.marriage_status || null,
          birthTime: u.birth_time || null,
          birthPlace: u.birth_place || null,
          height: u.height || null,
          complexion: u.complexion || null,
          star: u.star || null,
          raasi: u.raasi || null,
          gothram: u.gothram || null,
          padam: u.padam || null,
          uncleGothram: u.uncle_gothram || null,
          educationCategory: u.education_category || null,
          educationDetails: u.education_details || null,
          employedIn: u.employed_in || null,
          occupation: u.occupation || null,
          occupationInDetails: u.occupation_in_details || null,
          annualIncome: u.annual_income || null,
          address: u.address || null,
          siblingsInfo: u.siblings_info,
          status: u.status || null,
        },
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const userId = parseInt(resolvedParams.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, email, name',
        [userId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: 'User deleted successfully',
          user: result.rows[0],
        },
        { status: 200 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
