# Cloudinary Setup Guide

## Quick Start (5 minutes)

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Sign up with email (or use Google/GitHub)
3. Verify your email

### Step 2: Get Your Credentials

1. Once logged in, you'll see the **Dashboard**
2. Find the **Account Details** section (top of page)
3. Copy these three values:

```
Cloud Name: dxxxxxx
API Key: 123456789012345
API Secret: xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Update Backend Configuration

Open `c:\Elyse\elyse-backend\.env.development` and update:

```env
# Replace with YOUR actual credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### Step 4: Restart Backend

The backend will auto-restart with the new credentials.

### Step 5: Test Upload

1. Go to Admin Panel: http://localhost:3002
2. Login with `admin@elyse.com` / `admin123`
3. Go to Products → Edit any product
4. Drag & drop an image
5. ✅ Should upload successfully!

---

## Verification Checklist

- [ ] Cloudinary account created
- [ ] Credentials copied from dashboard
- [ ] `.env.development` updated
- [ ] Backend restarted (auto or manual)
- [ ] Image upload tested
- [ ] Image displays in admin panel

---

## Troubleshooting

**Upload still fails?**
- Check if credentials are correct (no extra spaces)
- Verify backend is running on port 3001
- Check browser console for errors
- Ensure you're logged in to admin panel

**Can't find credentials?**
- Go to Cloudinary Dashboard
- Click on "Dashboard" tab
- Look for "Account Details" widget
- If hidden, click "Programmable Media" → "Dashboard"
