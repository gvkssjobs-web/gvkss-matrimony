import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// PATCH - Update own profile (user can only update their own profile)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = params instanceof Promise ? await params : params;
    const idParam = resolvedParams.id;
    const idNum = parseInt(idParam);

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { currentUserEmail } = body;

    if (!currentUserEmail) {
      return NextResponse.json(
        { error: 'Authentication required. Please provide currentUserEmail.' },
        { status: 401 }
      );
    }

    const client = await pool.connect();
    try {
      const targetUserResult = await client.query(
        'SELECT id FROM users WHERE id = $1 LIMIT 1',
        [idNum]
      );
      if (targetUserResult.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const userId = targetUserResult.rows[0].id;

      const currentUserResult = await client.query(
        'SELECT id, role FROM users WHERE email = $1',
        [currentUserEmail]
      );

      if (currentUserResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const currentUser = currentUserResult.rows[0];
      const isAdmin = currentUser.role === 'admin';

      if (!isAdmin && currentUser.id !== userId) {
        return NextResponse.json(
          { error: 'You can only update your own profile' },
          { status: 403 }
        );
      }

      // Fields that users can update (exclude status - admin only)
      const allowedFields: Record<string, string> = {
        email: 'email',
        name: 'name',
        surname: 'surname',
        phoneNumber: 'phone_number',
        phoneNumber2: 'phone_number_2',
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
      };

      // Admins can also update status
      if (isAdmin && 'status' in body) {
        allowedFields.status = 'status';
      }

      const siblingsInfo = body.siblingsInfo;
      const clearPhotoIndex = body.clearPhotoIndex;
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

      if (clearPhotoIndex !== undefined && Number.isInteger(clearPhotoIndex) && clearPhotoIndex >= 0 && clearPhotoIndex <= 3) {
        const cols = [['photo', 'photo_blob', 'photo_s3_url'], ['photo_2', 'photo_2_blob', 'photo_2_s3_url'], ['photo_3', 'photo_3_blob', 'photo_3_s3_url'], ['photo_4', 'photo_4_blob', 'photo_4_s3_url']][clearPhotoIndex];
        cols.forEach((c) => {
          setParts.push(`${c} = $${idx}`);
          values.push(null);
          idx++;
        });
      }

      if (setParts.length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update' },
          { status: 400 }
        );
      }

      values.push(userId);
      const result = await client.query(
        `UPDATE users SET ${setParts.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING id, email, name, surname, role, phone_number, phone_number_2, gender, dob, marriage_status, birth_time, birth_place, height, complexion, star, raasi, gothram, padam, uncle_gothram, education_category, education_details, employed_in, occupation, occupation_in_details, annual_income, address, siblings_info, status`,
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
        message: 'Profile updated successfully',
        user: {
          id: u.id,
          email: u.email,
          name: u.name,
          surname: u.surname || null,
          role: u.role,
          phoneNumber: u.phone_number || null,
          phoneNumber2: u.phone_number_2 || null,
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
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

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

    const idNum = parseInt(idParam);

    if (isNaN(idNum)) {
      return NextResponse.json(
        { error: 'Invalid user ID. Must be a number.' },
        { status: 400 }
      );
    }

    // Get viewer email from query params to determine if they can see surname
    const { searchParams } = new URL(request.url);
    const viewerEmail = searchParams.get('viewerEmail');

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT 
          id, email, name, surname, role, photo, photo_2, photo_3, photo_4,
          photo_blob, photo_2_blob, photo_3_blob, photo_4_blob,
          phone_number, phone_number_2, gender, marriage_status,
          dob, birth_time, birth_place, height, complexion,
          father_name, father_occupation, father_contact, mother_name, mother_occupation, mother_contact,
          star, raasi, gothram, padam, uncle_gothram,
          education_category, education_details, employed_in,
          occupation, occupation_in_details, annual_income,
          address, created_at, siblings_info, status
        FROM users 
        WHERE id = $1
        LIMIT 1`,
        [idNum]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = result.rows[0];
      const hasPhoto = (i: number) => {
        const blob = user[['photo_blob', 'photo_2_blob', 'photo_3_blob', 'photo_4_blob'][i]];
        const url = user[['photo', 'photo_2', 'photo_3', 'photo_4'][i]];
        return blob != null || (url != null && url !== '');
      };
      const photoIndices = [0, 1, 2, 3].filter(i => hasPhoto(i));
      const photoCount = photoIndices.length || 1;

      // Check if viewer is admin or viewing their own profile
      let canSeeSurname = false;
      let canSeePrivate = false;
      if (viewerEmail) {
        const viewerResult = await client.query(
          'SELECT id, role FROM users WHERE email = $1',
          [viewerEmail]
        );
        if (viewerResult.rows.length > 0) {
          const viewer = viewerResult.rows[0];
          canSeeSurname = viewer.role === 'admin' || viewer.id === user.id;
          canSeePrivate = viewer.role === 'admin' || viewer.id === user.id;
        }
      }

      return NextResponse.json(
        {
          user: {
            id: user.id,
            email: canSeePrivate ? (user.email || null) : null,
            name: user.name,
            surname: canSeeSurname ? (user.surname || null) : null,
            role: user.role || 'silver',
            photo: user.photo || null,
            photoCount,
            photoIndices,
            phoneNumber: canSeePrivate ? (user.phone_number || null) : null,
            phoneNumber2: canSeePrivate ? (user.phone_number_2 || null) : null,
            gender: user.gender || null,
            marriageStatus: user.marriage_status || null,
            fatherName: canSeePrivate ? (user.father_name || null) : null,
            fatherOccupation: canSeePrivate ? (user.father_occupation || null) : null,
            fatherContact: canSeePrivate ? (user.father_contact || null) : null,
            motherName: canSeePrivate ? (user.mother_name || null) : null,
            motherOccupation: canSeePrivate ? (user.mother_occupation || null) : null,
            motherContact: canSeePrivate ? (user.mother_contact || null) : null,
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
            occupation: user.occupation || null,
            occupationInDetails: user.occupation_in_details || null,
            annualIncome: user.annual_income || null,
            address: canSeePrivate ? (user.address || null) : null,
            createdAt: user.created_at,
            siblingsInfo: user.siblings_info || null,
            status: user.status || null,
          },
          status: user.status || null,
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
