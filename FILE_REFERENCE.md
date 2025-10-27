# 📁 File Reference Guide

Complete reference of all files in the project and what they do.

---

## 📚 Documentation Files (Start Here!)

| File | Purpose | When to Read |
|------|---------|--------------|
| **START_HERE.md** | Navigation hub, start guide | First thing to read |
| **QUICK_START.md** | 10-minute setup guide | When you want to get started fast |
| **SETUP_INSTRUCTIONS.md** | Detailed step-by-step setup | When you want complete instructions |
| **README.md** | Main project documentation | For overview and reference |
| **FEATURES.md** | Complete feature documentation | To understand capabilities |
| **PROJECT_SUMMARY.md** | Technical overview | For developers/technical users |
| **DEPLOYMENT.md** | Production deployment guide | When ready to go live |
| **FILE_REFERENCE.md** | This file - explains all files | For understanding project structure |

---

## ⚙️ Configuration Files

### `package.json`
**Purpose**: Defines project dependencies and scripts
**Contains**:
- Next.js 14
- React 18
- TypeScript 5
- Supabase client
- QR code library
- Confetti library
- React Icons
- Tailwind CSS

**Scripts**:
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run linter
```

### `tsconfig.json`
**Purpose**: TypeScript compiler configuration
**Key Settings**:
- Target: ES5
- Strict mode enabled
- Path aliases configured (@/*)
- Next.js integration

### `tailwind.config.ts`
**Purpose**: Tailwind CSS configuration
**Contains**:
- Content paths for purging
- Theme extensions
- Custom gradients

### `postcss.config.js`
**Purpose**: PostCSS configuration for Tailwind
**Includes**:
- Tailwind CSS plugin
- Autoprefixer

### `next.config.js`
**Purpose**: Next.js framework configuration
**Settings**:
- Image optimization
- Supabase image domains allowed

### `.gitignore`
**Purpose**: Files to exclude from Git
**Ignores**:
- node_modules/
- .next/
- .env.local
- Build artifacts

### `.env.example`
**Purpose**: Example environment variables template
**Note**: Copy this to `.env.local` and fill in your values

### `.env.local` (YOU CREATE THIS)
**Purpose**: Your secret configuration
**Contains**:
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```
**⚠️ NEVER COMMIT THIS FILE TO GIT**

---

## 🗄️ Database Files (supabase/)

### `supabase/schema.sql`
**Purpose**: Creates database structure
**Creates**:
- `courses` table (16 courses)
- `students` table (student records)
- `student_courses` table (relationships)
- Indexes for performance
- RLS policies for security
- Storage bucket for photos
- Storage policies

**When to Use**: Run FIRST in Supabase SQL Editor

**Size**: ~150 lines

### `supabase/seed.sql`
**Purpose**: Populates initial data
**Inserts**:
- 16 predefined courses with details

**When to Use**: Run SECOND in Supabase SQL Editor

**Size**: ~20 lines

### `supabase/README.md`
**Purpose**: Database documentation
**Contains**:
- Schema explanation
- Table structure
- Course list
- How to apply scripts
- Verification steps
- Troubleshooting

---

## 🎨 Application Files (app/)

### `app/globals.css`
**Purpose**: Global styles and animations
**Contains**:
- Tailwind directives
- Certificate background gradient
- Sparkle animation keyframes
- Custom CSS classes
- Dark mode support

**Size**: ~80 lines

### `app/layout.tsx`
**Purpose**: Root layout component
**Contains**:
- HTML structure
- Metadata (title, description)
- Font loading (Inter)
- Global CSS import

**Used By**: All pages

### `app/page.tsx`
**Purpose**: Home page (landing page)
**Route**: `/`
**Features**:
- Welcome message
- Navigation buttons
- Quick start guide
- Gradient background

**Size**: ~40 lines

---

### Admin Section

#### `app/admin/page.tsx`
**Purpose**: Admin dashboard for managing students
**Route**: `/admin`
**Features**:
- Add student form
- Photo upload
- Course selection (16 checkboxes)
- Student list view
- Delete students
- Download QR codes
- Real-time updates

**Functions**:
- `fetchCourses()` - Load courses from DB
- `fetchStudents()` - Load students from DB
- `handlePhotoChange()` - Handle photo upload
- `handleCourseToggle()` - Toggle course selection
- `uploadPhoto()` - Upload to Supabase Storage
- `generateQRCode()` - Create QR code data URL
- `handleSubmit()` - Save student to database
- `handleDelete()` - Delete student
- `downloadQRCode()` - Download QR as image

**Size**: ~400 lines

---

### Certificate Section

#### `app/certificate/[id]/page.tsx`
**Purpose**: Certificate viewer page
**Route**: `/certificate/[uuid]`
**Features**:
- Beautiful golden gradient design
- Confetti animation on load
- Student profile photo
- School name display
- Graduation date calendar
- Course list with checkmarks
- Verified badge
- Mobile responsive

**Functions**:
- `fetchStudentData()` - Load student and courses
- `formatDate()` - Format graduation date
- Confetti effect (useEffect hook)

**Animations**:
- Confetti burst (3 seconds)
- Sparkle effects
- Smooth transitions

**Size**: ~300 lines

---

### Students Section

#### `app/students/page.tsx`
**Purpose**: Browse all students
**Route**: `/students`
**Features**:
- Grid layout of student cards
- Search functionality
- Student photos
- Quick info display
- "View Certificate" buttons
- QR code previews

**Functions**:
- `fetchStudents()` - Load all students
- `filteredStudents` - Search/filter logic

**Size**: ~120 lines

---

## 🔧 Library Files (lib/)

### `lib/supabase.ts`
**Purpose**: Supabase client configuration
**Exports**:
- `supabase` - Configured Supabase client
- `Course` - TypeScript interface
- `Student` - TypeScript interface
- `StudentCourse` - TypeScript interface
- `StudentWithCourses` - Combined interface

**Functions**:
- Creates singleton Supabase client
- Provides type safety for database operations

**Size**: ~40 lines

---

## 📦 Generated/External Folders

### `node_modules/`
**Purpose**: Installed npm packages
**Size**: ~200MB (varies)
**Note**: Created by `npm install`, not committed to Git

### `.next/`
**Purpose**: Next.js build output
**Size**: Varies
**Note**: Created by `npm run build`, not committed to Git

---

## 🎯 File Dependencies

### To Run Development Server:
```
package.json (dependencies)
  ↓
.env.local (configuration)
  ↓
app/layout.tsx (root layout)
  ↓
app/page.tsx (home)
app/admin/page.tsx
app/students/page.tsx
app/certificate/[id]/page.tsx
  ↓
lib/supabase.ts (database)
```

### To Set Up Database:
```
Supabase Project
  ↓
supabase/schema.sql (structure)
  ↓
supabase/seed.sql (data)
  ↓
Ready to use!
```

---

## 📊 File Statistics

**Total Files Created**: 26
- Documentation: 8 files
- Configuration: 6 files
- Database: 3 files
- Application: 9 files

**Total Lines of Code**: ~2,500+
- TypeScript: ~1,200 lines
- SQL: ~170 lines
- CSS: ~80 lines
- Documentation: ~3,000 lines

**Languages Used**:
- TypeScript (.tsx, .ts)
- SQL (.sql)
- CSS (.css)
- JavaScript (.js)
- Markdown (.md)

---

## 🔍 How to Find Things

### "Where is the student form?"
→ `app/admin/page.tsx` (lines ~50-200)

### "Where is the confetti animation?"
→ `app/certificate/[id]/page.tsx` (lines ~30-60)

### "Where is the database schema?"
→ `supabase/schema.sql`

### "Where are the courses defined?"
→ `supabase/seed.sql`

### "Where is the Supabase connection?"
→ `lib/supabase.ts`

### "Where are the styles?"
→ `app/globals.css` and Tailwind classes in components

### "Where is the QR code generation?"
→ `app/admin/page.tsx` (generateQRCode function)

### "Where is the photo upload?"
→ `app/admin/page.tsx` (uploadPhoto function)

---

## 🎨 Customization Guide

### Want to change colors?
Edit: `tailwind.config.ts` and CSS classes in components

### Want to change school name?
Edit: `app/certificate/[id]/page.tsx` (line with "Bosphorus...")

### Want to add more courses?
Edit: `supabase/seed.sql` and re-run in Supabase

### Want to change the home page?
Edit: `app/page.tsx`

### Want to modify the certificate design?
Edit: `app/certificate/[id]/page.tsx` and `app/globals.css`

### Want to add authentication?
Add Supabase Auth in `lib/supabase.ts` and protect `app/admin/page.tsx`

---

## 🚨 Critical Files (Don't Delete!)

These files are essential for the system to work:

- ✅ `package.json` - Dependencies
- ✅ `tsconfig.json` - TypeScript config
- ✅ `next.config.js` - Next.js config
- ✅ `.env.local` - Your credentials (YOU CREATE THIS)
- ✅ `lib/supabase.ts` - Database connection
- ✅ All files in `app/` - Application pages
- ✅ `supabase/schema.sql` - Database structure
- ✅ `supabase/seed.sql` - Initial data

---

## 🔄 File Workflow

### Adding a Student (File Flow)
```
User interacts with: app/admin/page.tsx
  ↓
Uses: lib/supabase.ts
  ↓
Uploads photo to: Supabase Storage
  ↓
Saves data to: students table (created by schema.sql)
  ↓
Creates relationships: student_courses table
  ↓
Generates QR code: Canvas API
  ↓
Stores QR URL: students.qr_code_url
```

### Viewing Certificate (File Flow)
```
User scans QR code
  ↓
Browser opens: app/certificate/[id]/page.tsx
  ↓
Fetches data via: lib/supabase.ts
  ↓
Queries: students + student_courses + courses tables
  ↓
Triggers: Confetti animation
  ↓
Displays: Beautiful certificate
```

---

## 📋 Checklist: Required Files

Before running, ensure these exist:

- [ ] `package.json`
- [ ] `tsconfig.json`
- [ ] `next.config.js`
- [ ] `tailwind.config.ts`
- [ ] `.env.local` (YOU CREATE THIS!)
- [ ] `lib/supabase.ts`
- [ ] `app/layout.tsx`
- [ ] `app/page.tsx`
- [ ] `app/admin/page.tsx`
- [ ] `app/certificate/[id]/page.tsx`
- [ ] `app/students/page.tsx`
- [ ] `app/globals.css`
- [ ] `supabase/schema.sql`
- [ ] `supabase/seed.sql`

---

## 🎓 Learning Path by File

**Beginner: Start Here**
1. `START_HERE.md` - Navigation
2. `QUICK_START.md` - Setup
3. `app/page.tsx` - Simple home page
4. `app/students/page.tsx` - List view

**Intermediate: Dig Deeper**
1. `app/admin/page.tsx` - Complex form
2. `lib/supabase.ts` - Database integration
3. `supabase/schema.sql` - Database design
4. `app/certificate/[id]/page.tsx` - Dynamic routing

**Advanced: Master It**
1. `next.config.js` - Framework config
2. `tsconfig.json` - TypeScript setup
3. `tailwind.config.ts` - Styling system
4. All TypeScript interfaces in `lib/supabase.ts`

---

## 💾 Backup Important Files

These files contain YOUR data (backup regularly):
- `.env.local` (your credentials)
- Supabase database (export from dashboard)
- Uploaded photos (Supabase Storage)

These files are code (safe in Git):
- Everything else!

---

## 📞 File-Specific Help

**Error in package.json?**
- Delete `node_modules/`
- Run `npm install` again

**Error in .env.local?**
- Check no spaces around `=`
- Verify values from Supabase dashboard
- Ensure file is in root directory

**Error in TypeScript files?**
- Run `npm install` to get types
- Check imports are correct
- Restart VS Code/editor

**Error in SQL files?**
- Copy entire file contents
- Run in Supabase SQL Editor
- Check for success message

---

**Need more help?** Check the documentation files listed at the top!

**Ready to code?** Start with [START_HERE.md](START_HERE.md)!

