import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

/**
 * Upload a file to AWS S3
 * @param file - The file to upload
 * @param filename - The filename/key to use in S3
 * @returns The S3 URL of the uploaded file
 */
export async function uploadToS3(file: File, filename: string): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: file.type,
      // Note: ACLs are disabled by default on newer S3 buckets
      // Use bucket policy for public read access instead
    });

    await s3Client.send(command);

    // Return the S3 URL
    const region = process.env.AWS_REGION || 'us-east-1';
    const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${filename}`;
    
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get a file from AWS S3
 * @param key - The S3 key/filename
 * @returns The file buffer
 */
export async function getFromS3(key: string): Promise<Buffer> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);
    const arrayBuffer = await response.Body?.transformToByteArray();
    
    if (!arrayBuffer) {
      throw new Error('No data returned from S3');
    }

    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error getting from S3:', error);
    throw new Error(`Failed to get file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate AWS S3 configuration
 */
export function validateS3Config(): boolean {
  const required = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing AWS S3 configuration:', missing.join(', '));
    return false;
  }

  return true;
}
