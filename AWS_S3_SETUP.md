# AWS S3 Storage Setup Guide

## Overview
This application uses AWS S3 for file storage and PostgreSQL for storing photo blobs. Photos are uploaded to S3 and the binary data is also stored in PostgreSQL for redundancy and faster access.

## Prerequisites
- AWS Account
- AWS S3 Bucket created
- AWS IAM user with S3 access permissions

## Step 1: Create an S3 Bucket

1. Log in to AWS Console: https://console.aws.amazon.com/
2. Navigate to **S3** service
3. Click **Create bucket**
4. Configure your bucket:
   - **Bucket name**: Choose a unique name (e.g., `your-app-photos`)
   - **Region**: Select a region closest to your users
   - **Block Public Access**: Uncheck "Block all public access" (or configure bucket policy for public read)
   - Click **Create bucket**

## Step 2: Configure Bucket Permissions

### Option A: Public Read Access (Recommended for photos)

**IMPORTANT**: New S3 buckets have ACLs disabled by default. You must use bucket policies for public access.

1. Go to your bucket → **Permissions** tab
2. Under **Block public access (bucket settings)**, click **Edit** and uncheck **Block all public access**. Click **Save changes** and confirm.
3. Under **Bucket policy**, click **Edit** and add:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

Replace `YOUR_BUCKET_NAME` with your actual bucket name (e.g., `s3-photo-user`).

4. Click **Save changes**

5. **Configure CORS** (Required for browser access):
   - Still in the **Permissions** tab, scroll to **Cross-origin resource sharing (CORS)**
   - Click **Edit** and add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

   - Click **Save changes**

**Note**: For production, replace `"AllowedOrigins": ["*"]` with your specific domain(s), e.g., `["https://yourdomain.com", "https://www.yourdomain.com"]`

### Option B: Private Bucket with Signed URLs

If you prefer private access, you'll need to modify the code to generate signed URLs instead of public URLs.

## Step 3: Create IAM User for S3 Access

1. Navigate to **IAM** service in AWS Console
2. Click **Users** → **Create user**
3. Enter a username (e.g., `s3-upload-user`)
4. Click **Next**
5. Under **Set permissions**, select **Attach policies directly**
6. Search and attach: `AmazonS3FullAccess` (or create a custom policy with only PutObject and GetObject permissions)
7. Click **Next** → **Create user**

## Step 4: Get Access Keys

1. Click on the user you just created
2. Go to **Security credentials** tab
3. Click **Create access key**
4. Select **Application running outside AWS**
5. Click **Next** → **Create access key**
6. **IMPORTANT**: Copy both:
   - **Access key ID**
   - **Secret access key** (only shown once!)

## Step 5: Set Environment Variables

Add the following environment variables to your `.env.local` file (or your deployment platform):

```env
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name-here
```

### For Vercel Deployment:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (e.g., `us-east-1`)
   - `AWS_S3_BUCKET_NAME`

## Step 6: Install Dependencies

The AWS SDK is already included in `package.json`. If you need to install:

```bash
npm install @aws-sdk/client-s3
```

## How It Works

1. **Photo Upload** (`/api/upload/photo`):
   - Validates the file (type, size)
   - Uploads to AWS S3
   - Stores the binary data in PostgreSQL `photo_blob` column
   - Stores the S3 URL in `photo_s3_url` column
   - Returns the S3 URL

2. **Photo Retrieval** (`/api/photo?userId=123`):
   - First tries to serve from PostgreSQL `photo_blob` (faster, no external dependency)
   - Falls back to S3 URL if blob not available
   - Returns the image with proper content-type headers

## Database Schema

The `users` table includes:
- `photo`: VARCHAR(500) - Legacy column, stores S3 URL
- `photo_blob`: BYTEA - Stores binary image data
- `photo_s3_url`: VARCHAR(500) - Stores S3 URL reference

## Security Best Practices

1. **Never commit** `.env.local` or environment variables to git
2. Use **IAM roles** instead of access keys when possible (for EC2/ECS deployments)
3. Limit IAM user permissions to only what's needed (S3 PutObject, GetObject)
4. Enable **S3 bucket versioning** for important data
5. Set up **S3 lifecycle policies** to manage old files
6. Consider using **CloudFront CDN** for better performance

## Troubleshooting

### Error: "AWS S3 storage not configured"
- Check that all environment variables are set correctly
- Verify the variable names match exactly (case-sensitive)

### Error: "Access Denied" or "403 Forbidden"
- Check IAM user permissions
- Verify bucket policy allows public read (if using public access)
- Ensure bucket name is correct

### Error: "The bucket does not allow ACLs"
- This means your bucket has ACLs disabled (default for new buckets)
- Remove the `ACL` parameter from upload code (already done in the codebase)
- Use bucket policy instead for public access (see Step 2 above)
- Ensure "Block all public access" is disabled in bucket settings

### Error: "Bucket not found"
- Verify the bucket name in `AWS_S3_BUCKET_NAME` matches exactly
- Check that the bucket exists in the specified region

### Photos not displaying
- Check that `photo_blob` column exists in database (run `/api/init-db` if needed)
- Verify the upload was successful (check S3 bucket)
- Check browser console for errors
- **Most common issue**: CORS not configured - make sure you've added the CORS configuration in Step 2
- Verify bucket policy allows public read access
- Check that "Block all public access" is disabled
- Try accessing the S3 URL directly in your browser to see the exact error

## Migration from Vercel Blob

If you're migrating from Vercel Blob:
1. Existing photos stored as URLs will continue to work
2. New uploads will use AWS S3 and store blobs in PostgreSQL
3. You can optionally migrate existing photos by re-uploading them
