# Bosphorus International - Student Certificate System

A modern web application for managing student certificates with QR code generation and beautiful certificate viewing interface.

![Certificate System](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)

## Features

✨ **Admin Dashboard**
- Add and manage student records
- Upload student profile photos
- Select courses for each student
- Generate unique QR codes automatically
- Download QR codes for printing

🎓 **Student Certificates**
- Beautiful mobile-responsive certificate view
- Confetti animation on certificate load
- Public access via unique QR codes
- Display student information and completed courses
- Professional design matching school branding

🔐 **Supabase Integration**
- PostgreSQL database for student records
- Storage for profile photos
- Row Level Security (RLS) policies
- Authentication ready

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **QR Codes**: qrcode library
- **Animations**: canvas-confetti

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- Git (optional)

### Installation

1. **Clone or download this repository**

```bash
git clone <your-repo-url>
cd Bosphorus.International
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**

   a. Create a new project on [Supabase](https://supabase.com)
   
   b. Go to SQL Editor in your Supabase dashboard
   
   c. Run the schema file:
      - Open `supabase/schema.sql`
      - Copy all contents
      - Paste in SQL Editor and click "Run"
   
   d. Run the seed file:
      - Open `supabase/seed.sql`
      - Copy all contents
      - Paste in SQL Editor and click "Run"
   
   e. Create the storage bucket:
      - Go to Storage in Supabase dashboard
      - The bucket should be auto-created by the schema, but verify "student-photos" exists
      - Make sure it's set to "Public bucket"

4. **Configure environment variables**

   Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

   Get these values from:
   - Supabase Dashboard → Settings → API
   - Copy "Project URL" and "anon public" key

5. **Run the development server**

```bash
npm run dev
```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Adding Students (Admin)

1. Go to `/admin` or click "Admin Dashboard" from home page
2. Fill in the student information:
   - Full Name (required)
   - Student ID (required)
   - Entry Session (required)
   - Graduation Date (optional)
   - Profile Photo (optional)
   - Select courses from the list
3. Click "Save Student"
4. The system will:
   - Upload the photo to Supabase Storage
   - Generate a unique QR code
   - Create the student record
   - Associate selected courses

### Viewing Certificates

**Method 1: Browse All Students**
1. Go to `/students` or click "View Students" from home page
2. Search or browse the student list
3. Click "View Certificate" on any student card

**Method 2: Scan QR Code**
1. Download the QR code from the admin panel
2. Print or display the QR code
3. Scan with any QR code scanner
4. Opens the beautiful certificate page with confetti!

### Certificate Features

- Automatic confetti animation on load
- Beautiful golden gradient background
- Student photo in circular frame
- School name and branding
- Graduation date with calendar display
- List of completed courses with checkmarks
- Student ID and entry session
- Verified certificate badge
- Mobile-responsive design

## Database Schema

### Tables

**courses**
- `id`: Primary key
- `course_number`: Course number (1-16)
- `course_name`: Name of the course
- `session_type`: Theory, Practical, or both

**students**
- `id`: UUID primary key
- `student_id`: Unique student identifier
- `name`: Full name
- `profile_photo_url`: URL to photo in storage
- `entry_session`: Entry session/year
- `graduation_date`: Date of graduation
- `qr_code_url`: Data URL of QR code
- `created_at`: Timestamp
- `updated_at`: Timestamp

**student_courses**
- Junction table linking students to their courses
- Enforces unique student-course combinations

### Storage

**student-photos** bucket
- Public read access
- Authenticated write access
- Stores student profile photos

## Available Courses

The system includes 16 predefined courses:

1. The art science of facial aesthetics (Theoretical and practical)
2. Skin structure and function (Theory)
3. Skin typing (Theoretical and practical)
4. Common skin condition (Theory)
5. Hair and nail structure and growth (Theory)
6. Skin cosmetics (Theory)
7. Hair cosmetics (Theory)
8. Hair analyzer (Practical)
9. Skin analyzer (Practical)
10. Hydrafacial (Practical)
11. Microneedling (Practical)
12. PRP (platelet-rich-plasma) (Practical)
13. Chemical peel (Practical)
14. RF (Radio frequency) (Practical)
15. DPN (Dermatosis papulosis nigra) removal (Practical)
16. Laser (hair removal) (Practical)

## Project Structure

```
Bosphorus.International/
├── app/
│   ├── admin/
│   │   └── page.tsx           # Admin dashboard
│   ├── certificate/
│   │   └── [id]/
│   │       └── page.tsx       # Certificate viewer
│   ├── students/
│   │   └── page.tsx           # Students list
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── lib/
│   └── supabase.ts            # Supabase client config
├── supabase/
│   ├── schema.sql             # Database schema
│   └── seed.sql               # Seed data
├── public/                    # Static assets
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind config
└── next.config.js             # Next.js config
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Any Node.js hosting

Make sure to set the environment variables on your hosting platform.

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Public read access is enabled for certificate viewing
- Write access requires authentication
- Profile photos are stored in a public bucket
- QR codes contain only the student ID (UUID), not sensitive data

## Future Enhancements

Potential features to add:
- [ ] Admin authentication system
- [ ] Edit student information
- [ ] Bulk student import (CSV)
- [ ] Email certificates to students
- [ ] Print-friendly certificate layout
- [ ] Course completion dates
- [ ] Student grades/performance
- [ ] Multiple certificate templates
- [ ] Analytics dashboard

## Support

For issues or questions:
1. Check the Supabase dashboard for database errors
2. Check browser console for client-side errors
3. Verify environment variables are set correctly
4. Ensure SQL scripts were run successfully

## License

This project is private and proprietary to Bosphorus International.

---

Built with ❤️ for Bosphorus Cosmetology and Skin Care School

