# Setup Instructions - Bosphorus International Certificate System

Follow these step-by-step instructions to get your certificate system up and running.

## Step 1: Install Node.js

If you don't have Node.js installed:

1. Go to [nodejs.org](https://nodejs.org)
2. Download the LTS version (20.x or higher)
3. Install following the installer prompts
4. Verify installation by opening terminal/command prompt:
   ```bash
   node --version
   npm --version
   ```

## Step 2: Set Up Supabase Project

### Create a Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create a new organization (or use existing)

### Create a New Project

1. Click "New Project"
2. Choose your organization
3. Fill in:
   - **Name**: Bosphorus International
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click "Create new project"
5. Wait 2-3 minutes for project setup

### Run SQL Scripts

1. Once project is ready, click on "SQL Editor" in the left sidebar
2. Click "New query"

**First, run the schema:**
3. Open the file `supabase/schema.sql` from this project
4. Copy ALL contents
5. Paste into the SQL Editor
6. Click "Run" (or press Ctrl/Cmd + Enter)
7. You should see "Success. No rows returned"

**Then, run the seed data:**
8. Click "New query" again
9. Open the file `supabase/seed.sql`
10. Copy ALL contents
11. Paste into the SQL Editor
12. Click "Run"
13. You should see "Success. 16 rows returned" (the courses)

### Verify Database Setup

1. Click on "Table Editor" in the left sidebar
2. You should see three tables:
   - `courses` (16 rows)
   - `students` (0 rows)
   - `student_courses` (0 rows)

### Verify Storage Setup

1. Click on "Storage" in the left sidebar
2. You should see a bucket named `student-photos`
3. Click on it and verify:
   - Public bucket: **ON**
   - File size limit: 50 MB (default)

### Get Your API Keys

1. Click on "Settings" (gear icon) in the left sidebar
2. Click "API" under Project Settings
3. You'll need two values:
   - **Project URL**: Something like `https://xxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`
4. Keep this page open or copy these values somewhere safe

## Step 3: Install Project Dependencies

1. Open terminal/command prompt
2. Navigate to the project folder:
   ```bash
   cd path/to/Bosphorus.International
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Wait for installation to complete (may take 2-3 minutes)

## Step 4: Configure Environment Variables

1. In the project folder, create a new file named `.env.local`
2. Open it with any text editor
3. Add these two lines (replace with YOUR values from Step 2):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Save the file
5. **Important**: Make sure there are no spaces around the `=` sign

## Step 5: Run the Application

1. In terminal, from the project folder:
   ```bash
   npm run dev
   ```
2. Wait for it to compile (15-30 seconds)
3. You should see:
   ```
   ▲ Next.js 14.1.0
   - Local:        http://localhost:3000
   ```
4. Open your web browser
5. Go to: `http://localhost:3000`

## Step 6: Test the System

### Test 1: View Home Page
- You should see the Bosphorus International home page
- Two buttons: "Admin Dashboard" and "View Students"

### Test 2: Add a Student
1. Click "Admin Dashboard"
2. Fill in the form:
   - Name: Test Student
   - Student ID: TEST001
   - Entry Session: Fall 2024
   - Graduation Date: (choose a date)
   - Profile Photo: Upload any photo
   - Select a few courses (click checkboxes)
3. Click "Save Student"
4. Wait for success message
5. You should see the student appear in the right column

### Test 3: View Certificate
1. Go back to home page (click browser back)
2. Click "View Students"
3. You should see your test student
4. Click "View Certificate"
5. You should see:
   - Confetti animation! 🎉
   - Beautiful golden background
   - Student photo
   - Student information
   - List of courses

### Test 4: QR Code
1. Go back to Admin Dashboard
2. Find your test student in the right column
3. Click "QR Code" button
4. A QR code image should download
5. Scan it with your phone's camera
6. It should open the certificate page

## Troubleshooting

### Error: "Missing environment variables"
- Check that `.env.local` file exists
- Verify the Supabase URL and key are correct
- Restart the dev server (Ctrl+C, then `npm run dev`)

### Error: "Failed to fetch courses"
- Check Supabase project is active (not paused)
- Verify SQL scripts ran successfully
- Check browser console for specific errors

### Error: "Upload failed"
- Verify storage bucket exists
- Check bucket is set to public
- Verify file size is under 50MB

### Photo not showing
- Wait a few seconds, it may still be uploading
- Check the photo URL in Supabase Storage
- Verify the photo file format (jpg, png, etc.)

### No confetti animation
- Check browser console for errors
- Try refreshing the certificate page
- Some ad-blockers may interfere

### Port 3000 already in use
- Kill any process using port 3000
- Or run on different port: `npm run dev -- -p 3001`

## Next Steps

### For Production Use

1. **Set up admin authentication**
   - Currently anyone can access `/admin`
   - Consider adding password protection
   - Or set up Supabase Auth

2. **Deploy to production**
   - See README.md for deployment instructions
   - Recommended: Vercel (easiest)

3. **Print QR codes**
   - Download QR codes from admin panel
   - Print on student certificates/cards
   - Consider adding to student ID cards

4. **Customize branding**
   - Update school name in `app/certificate/[id]/page.tsx`
   - Modify colors in `tailwind.config.ts`
   - Add school logo to certificate

### Getting Help

If you encounter issues:
1. Check this guide again carefully
2. Verify each step was completed
3. Check Supabase dashboard for errors
4. Check browser console (F12) for errors
5. Review the README.md file

## Important Files Reference

- **`.env.local`** - Your secret configuration (never commit to git!)
- **`supabase/schema.sql`** - Database structure
- **`supabase/seed.sql`** - Initial course data
- **`app/admin/page.tsx`** - Admin dashboard code
- **`app/certificate/[id]/page.tsx`** - Certificate viewer code

## Success Checklist

- [ ] Node.js installed and verified
- [ ] Supabase project created
- [ ] SQL scripts executed successfully
- [ ] Storage bucket created and public
- [ ] API keys copied
- [ ] Dependencies installed
- [ ] `.env.local` file created with correct values
- [ ] Dev server running without errors
- [ ] Test student created successfully
- [ ] Certificate displays with confetti
- [ ] QR code downloads successfully

If all items are checked, your system is ready! 🎉

---

**Note**: Keep your `.env.local` file and Supabase credentials secure. Never share them publicly or commit them to version control.

