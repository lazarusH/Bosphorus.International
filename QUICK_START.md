# Quick Start Guide

Get up and running in 10 minutes!

## 1. Install Dependencies (2 min)

```bash
npm install
```

## 2. Set Up Supabase (5 min)

### Create Project
1. Go to [supabase.com](https://supabase.com) → Sign up → New Project
2. Wait for project creation

### Run SQL Scripts
1. Supabase Dashboard → SQL Editor → New Query
2. Copy/paste from `supabase/schema.sql` → Run
3. New Query → Copy/paste from `supabase/seed.sql` → Run

### Get API Keys
1. Settings → API
2. Copy "Project URL" and "anon public" key

## 3. Configure Environment (1 min)

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Start Development Server (1 min)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Add Your First Student (1 min)

1. Click "Admin Dashboard"
2. Fill in student details
3. Upload a photo (optional)
4. Select courses
5. Click "Save Student"

## 6. View Certificate

1. Go to "View Students"
2. Click "View Certificate"
3. Enjoy the confetti! 🎉

## Done! 

Your certificate system is ready to use.

---

**Need more details?** See `SETUP_INSTRUCTIONS.md`

**Having issues?** Check the Troubleshooting section in `README.md`

