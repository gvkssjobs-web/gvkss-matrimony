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

    // Validate AWS S3 configuration
    if (!validateS3Config()) {
      return NextResponse.json(
        { 
          error: 'AWS S3 storage not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET_NAME environment variables.',
        },
        { status: 500 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `photos/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to AWS S3
    const s3Url = await uploadToS3(file, filename);

    // Convert file to buffer for PostgreSQL storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Store blob in PostgreSQL if userId is provided
    if (userId) {
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE users SET photo_blob = $1, photo_s3_url = $2, photo = $3 WHERE id = $4',
          [buffer, s3Url, s3Url, parseInt(userId)]
        );
      } finally {
        client.release();
      }
    }

    return NextResponse.json(
      { 
        success: true,
        path: s3Url,
        filename: filename,
        s3Url: s3Url
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
