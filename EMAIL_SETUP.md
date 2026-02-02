# Email setup (verification & password reset)

To send real emails instead of showing the dev link, add SMTP settings to your `.env.local` file.

## 1. Add these variables to `.env.local`

```env
# SMTP (required for sending emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: "From" address (defaults to SMTP_USER)
SMTP_FROM="Deepthi Matrimony <your-email@gmail.com>"

# Base URL for links in emails (use your real domain in production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# In production: NEXT_PUBLIC_APP_URL=https://yoursite.com
```

## 2. Gmail

1. Use **App Password**, not your normal Gmail password:
   - Go to [Google Account → Security](https://myaccount.google.com/security)
   - Turn on **2-Step Verification** if it’s off
   - Under "Signing in to Google", choose **App passwords**
   - Create an app password for "Mail" and use that as `SMTP_PASS`

2. In `.env.local`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx
   ```

## 3. Outlook / Microsoft 365

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

## 4. Other providers (Yahoo, custom SMTP)

- **Yahoo:** `SMTP_HOST=smtp.mail.yahoo.com`, `SMTP_PORT=587`, use an app password
- **Custom:** Use your provider’s SMTP host, port (often 587 or 465), and credentials  
- For port **465** (SSL), add: `SMTP_SECURE=true`

## 5. Restart the dev server

After changing `.env.local`, restart:

```bash
npm run dev
```

Then use "Forgot password" again; the reset email will be sent to the user’s inbox and the dev link will no longer be shown.
