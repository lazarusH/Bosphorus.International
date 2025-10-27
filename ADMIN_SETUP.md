# Admin Setup Guide

Follow these steps to set up admin authentication for your certificate system.

---

## Step 1: Apply Database Schema

First, make sure you've applied the SQL scripts:

1. Go to: https://supabase.com/dashboard/project/npjftlviicnodszgfnth/sql/new

2. **Run schema.sql** (copy ALL contents from `supabase/schema.sql`):
   - Paste in SQL Editor
   - Click **RUN**
   - Wait for "Success" message

3. **Run seed.sql** (copy ALL contents from `supabase/seed.sql`):
   - New Query
   - Paste in SQL Editor
   - Click **RUN**
   - You should see "16 rows" returned

---

## Step 2: Enable Email Authentication

1. Go to: https://supabase.com/dashboard/project/npjftlviicnodszgfnth/auth/providers

2. Make sure **Email** provider is enabled (it should be by default)

3. Configure email settings:
   - Go to: Authentication → Email Templates
   - Customize if needed (optional)

---

## Step 3: Create Admin User

### Option A: Using Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/npjftlviicnodszgfnth/auth/users

2. Click **"Add user"** → **"Create new user"**

3. Fill in:
   - **Email**: `admin@bosphorusinternational.com` (or your preferred email)
   - **Password**: Create a strong password (save this!)
   - **Auto Confirm User**: ✅ Check this box

4. Click **"Create user"**

5. **Save your credentials**:
   ```
   Email: admin@bosphorusinternational.com
   Password: [your password]
   ```

### Option B: Using SQL

Run this in SQL Editor:

```sql
-- Create admin user (replace email and password)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@bosphorusinternational.com',
  crypt('YOUR_PASSWORD_HERE', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

Replace:
- `admin@bosphorusinternational.com` with your email
- `YOUR_PASSWORD_HERE` with your password

---

## Step 4: Test Login

1. **Install dependencies** (if you haven't):
   ```bash
   npm install
   ```

2. **Start the dev server**:
   ```bash
   npm run dev
   ```

3. **Go to**: http://localhost:3000

4. **Click "Admin Login"**

5. **Enter your credentials**:
   - Email: (the one you created)
   - Password: (the one you set)

6. **Click "Login"**

7. You should be redirected to the Admin Dashboard!

---

## Step 5: Verify Permissions

After logging in:

1. ✅ Try adding a test student
2. ✅ Upload a photo
3. ✅ Select some courses
4. ✅ Click "Save Student"
5. ✅ Student should be created successfully!

---

## Creating Additional Admin Users

To create more admin users:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Enter email and password
4. Check "Auto Confirm User"
5. Click "Create user"

---

## Security Best Practices

### Strong Passwords
- At least 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- Don't use common words or patterns

### Email Security
- Use a dedicated admin email
- Enable 2FA on your email account
- Don't share admin credentials

### Supabase Security
- Keep your Supabase credentials secure
- Never commit `.env.local` to Git
- Regularly update passwords
- Monitor the auth logs

---

## Troubleshooting

### "Invalid login credentials"
- Check email is typed correctly
- Check password is correct
- Verify user was created in Supabase
- Check "email_confirmed_at" is set in auth.users table

### "Row-level security policy" error
- Make sure you're logged in
- Check auth session is active
- Re-login if needed

### Can't create user
- Check SQL scripts were run successfully
- Verify email provider is enabled
- Check Supabase project is active (not paused)

### Redirect loop
- Clear browser cache and cookies
- Try incognito/private mode
- Check `.env.local` has correct credentials

---

## Password Reset

If you forget your password:

### Option 1: Reset via Supabase Dashboard
1. Go to Authentication → Users
2. Find your user
3. Click the three dots → "Send password reset"
4. Check your email

### Option 2: Reset via SQL
```sql
UPDATE auth.users
SET encrypted_password = crypt('NEW_PASSWORD', gen_salt('bf'))
WHERE email = 'admin@bosphorusinternational.com';
```

---

## Admin Credentials Template

Save this in a secure location (NOT in the repository):

```
ADMIN CREDENTIALS
==================

Supabase Project: npjftlviicnodszgfnth
Project URL: https://npjftlviicnodszgfnth.supabase.co

Admin Login:
- Email: admin@bosphorusinternational.com
- Password: [your secure password]

Created: [date]
Last Updated: [date]
```

---

## Next Steps

After setting up admin:

1. ✅ Test adding students
2. ✅ Test downloading QR codes (PNG and PDF)
3. ✅ Test viewing certificates
4. ✅ Deploy to production (see DEPLOYMENT.md)
5. ✅ Set up password reset email templates
6. ✅ Consider enabling 2FA (Two-Factor Authentication)

---

## Production Recommendations

Before going live:

- [ ] Change default admin password
- [ ] Set up custom email templates
- [ ] Configure custom email domain
- [ ] Enable additional security features
- [ ] Set up monitoring and alerts
- [ ] Back up your database
- [ ] Document your admin procedures

---

## Quick Reference

**Login URL**: `/login`
**Admin Dashboard**: `/admin` (requires login)
**Logout**: Click "Logout" button in top-right

**Supabase Dashboard**: https://supabase.com/dashboard/project/npjftlviicnodszgfnth

**Auth Users**: https://supabase.com/dashboard/project/npjftlviicnodszgfnth/auth/users

---

**🔐 Keep your credentials secure!**
**❌ Never share your admin password!**
**✅ You're ready to manage students!**

