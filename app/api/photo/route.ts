import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getFromS3 } from '@/lib/aws-s3';

/**
 * GET /api/photo?userId=123
 * Serves photo blob from PostgreSQL database
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT photo_blob, photo_s3_url, photo FROM users WHERE id = $1',
        [parseInt(userId)]
      );

      if (result.rows.length === 0) {
        console.error('Photo API - User not found:', userId);
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const user = result.rows[0];
      
      console.log('Photo API - User data:', {
        userId: parseInt(userId),
        hasPhotoBlob: !!user.photo_blob,
        photoS3Url: user.photo_s3_url,
        photo: user.photo,
        photoBlobLength: user.photo_blob ? user.photo_blob.length : 0
      });
      
      // If photo_blob exists, return it
      if (user.photo_blob) {
        const buffer = Buffer.from(user.photo_blob);
        
        // Try to determine content type from S3 URL or default to jpeg
        let contentType = 'image/jpeg';
        const s3Url = user.photo_s3_url || user.photo;
        if (s3Url) {
          const extension = s3Url.split('.').pop()?.toLowerCase();
          if (extension === 'png') contentType = 'image/png';
          else if (extension === 'gif') contentType = 'image/gif';
          else if (extension === 'webp') contentType = 'image/webp';
        }
        
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      // If no blob but S3 URL exists, fetch from S3 using AWS SDK
      const s3Url = user.photo_s3_url || user.photo;
      console.log('Photo API - Checking S3 URL:', s3Url);
      
      if (s3Url && typeof s3Url === 'string' && (s3Url.includes('s3.amazonaws.com') || s3Url.includes('.s3.') || s3Url.includes('amazonaws.com'))) {
        try {
          console.log('Photo API - Extracting S3 key from URL:', s3Url);
          // Extract S3 key from URL
          // URL format: https://bucket-name.s3.region.amazonaws.com/key
          let s3Key = '';
          
          try {
            const urlObj = new URL(s3Url);
            // Remove leading slash from pathname
            s3Key = urlObj.pathname.substring(1);
            // Remove query params if any
            s3Key = s3Key.split('?')[0];
          } catch (urlError) {
            // Fallback: try to extract manually
            if (s3Url.includes('.s3.')) {
              const parts = s3Url.split('.s3.');
              if (parts.length === 2) {
                // Remove region.amazonaws.com and get the path
                const pathPart = parts[1].split('/').slice(1).join('/');
                s3Key = pathPart.split('?')[0];
              }
            }
          }
          
          if (!s3Key) {
            throw new Error('Could not extract S3 key from URL');
          }
          
          console.log('Photo API - Fetching from S3 using AWS SDK, key:', s3Key);
          // Use AWS SDK to fetch from S3 (works even if bucket is private)
          const imageBuffer = await getFromS3(s3Key);
          
          // Determine content type from file extension
          let contentType = 'image/jpeg';
          const extension = s3Key.split('.').pop()?.toLowerCase();
          if (extension === 'png') contentType = 'image/png';
          else if (extension === 'gif') contentType = 'image/gif';
          else if (extension === 'webp') contentType = 'image/webp';
          
          console.log('Photo API - Successfully fetched from S3, content-type:', contentType);
          // Convert Buffer to Uint8Array for NextResponse (which accepts it as BodyInit)
          const uint8Array = new Uint8Array(imageBuffer);
          
          return new NextResponse(uint8Array, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'Access-Control-Allow-Origin': '*',
            },
          });
        } catch (fetchError) {
          console.error('Photo API - Error fetching from S3 using AWS SDK:', fetchError);
          // Fall through to return 404
        }
      } else {
        console.log('Photo API - No valid S3 URL found');
      }

      console.log('Photo API - Returning 404, no photo found');
      return NextResponse.json(
        { error: 'No photo found for this user', details: { hasPhotoBlob: !!user.photo_blob, photoS3Url: user.photo_s3_url, photo: user.photo } },
        { status: 404 }
      );
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error retrieving photo:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve photo', 
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
