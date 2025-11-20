# Bosphorus International - Student Certificate System

A modern, scalable web application for managing student certificates with QR code generation and beautiful certificate viewing interface.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-green?style=for-the-badge&logo=supabase)

## ✨ Features

### 👨‍💼 Admin Dashboard
- Add and manage student records
- Upload student profile photos
- Select multiple courses for each student
- Auto-generate unique QR codes
- Download QR codes as PNG or PDF
- Real-time error handling with user-friendly messages
- Secure authentication system

### 🎓 Student Certificates
- Beautiful mobile-responsive certificate view
- Confetti animation on certificate load
- Public access via unique QR codes
- Display student information and completed courses
- Professional design matching school branding
- Calendar-style graduation date display

### 📱 Students Directory
- Browse all registered students
- Search functionality
- Quick certificate access
- Mobile-friendly interface

### 🔐 Security
- Row Level Security (RLS) policies
- Authentication-protected admin actions
- Public certificate viewing (no auth required)
- Secure file storage on Supabase

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account ([supabase.com](https://supabase.com))
- Git (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Bosphorus.International
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project on [Supabase](https://supabase.com)
   - Go to SQL Editor in your Supabase dashboard
   - Run `supabase/schema.sql` (creates tables and policies)
   - Run `supabase/seed.sql` (adds 16 predefined courses)
   - Create an admin user in Authentication → Users

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   
   Get these values from: Supabase Dashboard → Settings → API

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

📖 **For detailed setup instructions, see [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)**  
⚡ **For a quick 10-minute setup, see [QUICK_START.md](QUICK_START.md)**

## 📚 Project Structure

```
Bosphorus.International/
├── app/
│   ├── admin/
│   │   └── page.tsx           # Admin dashboard
│   ├── certificate/
│   │   └── [id]/
│   │       └── page.tsx       # Certificate viewer
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── students/
│   │   └── page.tsx           # Students list
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page (redirects to login)
├── lib/
│   ├── auth.ts                # Authentication helpers
│   └── supabase.ts            # Supabase client configuration
├── supabase/
│   ├── schema.sql             # Database schema + RLS policies
│   ├── seed.sql               # Seed data (16 courses)
│   └── README.md              # Database documentation
├── public/
│   ├── bosphorus logo.jpg     # School logo
│   └── verified-badge.svg     # Verification badge
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── tailwind.config.ts         # Tailwind CSS config
└── next.config.js             # Next.js config
```

## 🗄️ Database Schema

### Tables

**courses**
- `id`: Primary key (SERIAL)
- `course_number`: Course number (1-16)
- `course_name`: Name of the course
- `session_type`: Theory, Practical, or both
- `created_at`: Timestamp

**students**
- `id`: UUID primary key
- `student_id`: Unique student identifier
- `name`: Full name
- `profile_photo_url`: URL to photo in storage
- `entry_session`: Entry session/year
- `graduation_date`: Date of graduation (DATE)
- `qr_code_url`: Data URL of QR code
- `created_at`: Timestamp
- `updated_at`: Timestamp

**student_courses**
- Junction table linking students to their courses
- `student_id`: Foreign key to students
- `course_id`: Foreign key to courses
- `enrolled_at`: Timestamp
- Enforces unique student-course combinations

### Storage

**student-photos** bucket
- Public read access
- Authenticated write access
- Stores student profile photos

## 🎯 Usage

### Adding Students (Admin)

1. Go to `/admin` or navigate from home page
2. Fill in the student information:
   - Full Name (required)
   - Student ID (required, must be unique)
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
1. Go to `/students`
2. Search or browse the student list
3. Click "View Certificate" on any student card

**Method 2: Scan QR Code**
1. Download the QR code from the admin panel
2. Print or display the QR code
3. Scan with any QR code scanner
4. Opens the beautiful certificate page with confetti!

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **QR Codes**: qrcode library
- **PDF Generation**: jsPDF
- **Animations**: canvas-confetti
- **Icons**: React Icons

## 📦 Available Courses

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

## 🚢 Deployment

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

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## 🔒 Security Notes

- Row Level Security (RLS) is enabled on all tables
- Public read access is enabled for certificate viewing
- Write access requires authentication
- Profile photos are stored in a public bucket
- QR codes contain only the student ID (UUID), not sensitive data
- Admin actions are protected by authentication

## 🐛 Troubleshooting

### Common Issues

**404 errors when adding students**
- Make sure you've run both SQL files (`schema.sql` and `seed.sql`) in Supabase
- Verify tables exist in Supabase Dashboard → Table Editor

**Authentication errors**
- Check that you've created an admin user in Supabase
- Verify "Auto Confirm User" was checked when creating the user
- Make sure you're logged in before accessing `/admin`

**Date display issues**
- The system handles timezone conversions properly
- Dates are parsed as local dates to prevent timezone shifts

**Duplicate student ID errors**
- Each student ID must be unique
- The system will show a clear error message if a duplicate is detected

**Photo upload fails**
- Check that the `student-photos` bucket exists in Supabase Storage
- Verify the bucket is set to "Public bucket"
- Check file size (max 50MB by default)

## 📈 Future Enhancements

Potential features to add:
- [ ] Edit student information
- [ ] Bulk student import (CSV)
- [ ] Email certificates to students
- [ ] Print-friendly certificate layout
- [ ] Course completion dates
- [ ] Student grades/performance tracking
- [ ] Multiple certificate templates
- [ ] Analytics dashboard
- [ ] Export student data
- [ ] Multi-language support

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get running in 10 minutes
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Detailed step-by-step setup
- **[FEATURES.md](FEATURES.md)** - Complete feature documentation
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[supabase/README.md](supabase/README.md)** - Database documentation

## 🤝 Contributing

This is a private project for Bosphorus International. If you have suggestions or improvements, please discuss them with the project maintainers.

## 📄 License

This project is proprietary and confidential. All rights reserved by Bosphorus International.

## 🙏 Support

For issues or questions:
1. Check the documentation files listed above
2. Check the Supabase dashboard for database errors
3. Check browser console for client-side errors
4. Verify environment variables are set correctly
5. Ensure SQL scripts were run successfully

---

**Built with ❤️ for Bosphorus Cosmetology and Skin Care School**
