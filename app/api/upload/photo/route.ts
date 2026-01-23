import { NextRequest, NextResponse } from 'next/server';
import { uploadToS3, validateS3Config } from '@/lib/aws-s3';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer for PostgreSQL storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let s3Url: string | null = null;
    let filename: string | null = null;

    // Upload to AWS S3 if configured (optional)
    if (validateS3Config()) {
      try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop() || 'jpg';
        filename = `photos/${timestamp}-${randomString}.${fileExtension}`;

        // Upload to AWS S3
        s3Url = await uploadToS3(file, filename);
      } catch (s3Error) {
        console.warn('S3 upload failed, storing only in PostgreSQL:', s3Error);
        // Continue without S3 - store only in PostgreSQL
      }
    } else {
      console.log('AWS S3 not configured, storing photo only in PostgreSQL');
    }

    // Store blob in PostgreSQL (always store in database)
    if (userId) {
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE users SET photo_blob = $1, photo_s3_url = $2, photo = $3 WHERE id = $4',
          [buffer, s3Url, s3Url || `local-${userId}`, parseInt(userId)]
        );
      } finally {
        client.release();
      }
    }

    // Return response - use S3 URL if available, otherwise indicate stored in DB
    return NextResponse.json(
      { 
        success: true,
        path: s3Url || 'stored-in-database',
        filename: filename || 'local-storage',
        s3Url: s3Url,
        storedInDatabase: true
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Photo upload error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to upload photo';
    if (error.message?.includes('AWS') || error.message?.includes('S3')) {
      errorMessage = 'AWS S3 configuration error: ' + error.message;
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Network error while uploading photo';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
