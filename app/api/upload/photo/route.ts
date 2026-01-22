import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('photo') as File;

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

    // Check if BLOB_READ_WRITE_TOKEN is set
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return NextResponse.json(
        { 
          error: 'Blob storage not configured. Please set BLOB_READ_WRITE_TOKEN environment variable.',
          details: 'Visit Vercel dashboard > Storage > Create Blob store to get your token'
        },
        { status: 500 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `photos/${timestamp}-${randomString}.${fileExtension}`;

    // Upload to Vercel Blob Storage
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type,
      token: token,
    });

    // Ensure the URL is properly formatted (remove any double slashes or malformed URLs)
    let photoUrl = blob.url;
    if (photoUrl && !photoUrl.startsWith('http://') && !photoUrl.startsWith('https://')) {
      // If somehow the URL is malformed, try to fix it
      if (photoUrl.startsWith('http:/') || photoUrl.startsWith('https:/')) {
        photoUrl = photoUrl.replace('http:/', 'http://').replace('https:/', 'https://');
      }
    }

    return NextResponse.json(
      { 
        success: true,
        path: photoUrl,
        filename: filename
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
    if (error.message?.includes('token')) {
      errorMessage = 'Blob storage token is invalid or missing';
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
