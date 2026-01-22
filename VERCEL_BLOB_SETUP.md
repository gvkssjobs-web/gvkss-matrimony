# Vercel Blob Storage Setup Guide

## Issue
Photo uploads are failing with a 500 error because Vercel Blob Storage is not configured.

## Solution

### Step 1: Create a Blob Store in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your project (`gvkss-matrimony`)
3. Go to the **Storage** tab
4. Click **Create Database**
5. Select **Blob** from the options
6. Give it a name (e.g., "matrimony-photos")
7. Select a region closest to your users
8. Click **Create**

### Step 2: Get Your Token

After creating the Blob store, Vercel will automatically:
- Create a `BLOB_READ_WRITE_TOKEN` environment variable
- Add it to your project settings

**OR** you can manually add it:

1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your blob store token (found in the Blob store settings)
   - **Environment**: Production, Preview, Development (select all)

### Step 3: Redeploy

After setting up the Blob store and environment variable:
1. Go to **Deployments**
2. Click the three dots on your latest deployment
3. Select **Redeploy**

Or push a new commit to trigger a new deployment.

## Verify Setup

After redeploying, the photo upload should work. The error message will now be more descriptive if something is still wrong.

## Alternative: Base64 Storage (Not Recommended)

If you can't set up Blob storage, you can modify the code to store images as base64 in the database, but this is not recommended for production as it:
- Increases database size significantly
- Slows down queries
- Has size limitations

If you need this alternative, let me know and I can provide the code.
