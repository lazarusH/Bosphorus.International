# Supabase Database Setup

This folder contains SQL scripts to set up your Supabase database.

## Files

### `schema.sql`
Creates the database structure including:
- **Tables**: courses, students, student_courses
- **Indexes**: For better query performance
- **RLS Policies**: Security rules for data access
- **Storage Bucket**: For student photos

### `seed.sql`
Populates the database with initial data:
- 16 predefined courses for the cosmetology program

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Log into your Supabase project
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `schema.sql`
5. Paste and click **Run**
6. Create another new query
7. Copy the contents of `seed.sql`
8. Paste and click **Run**

### Option 2: Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db reset
supabase db push
```

## Verification

After running the scripts, verify the setup:

### Tables
Go to **Table Editor** and check:
- ✅ `courses` table exists with 16 rows
- ✅ `students` table exists (empty)
- ✅ `student_courses` table exists (empty)

### Storage
Go to **Storage** and check:
- ✅ `student-photos` bucket exists
- ✅ Bucket is set to **Public**

### Policies
Go to **Authentication** → **Policies** and check:
- ✅ All tables have RLS enabled
- ✅ Public read policies exist
- ✅ Authenticated write policies exist

## Database Schema Diagram

```
┌─────────────┐
│   courses   │
├─────────────┤
│ id (PK)     │
│ course_num  │
│ course_name │
│ session_type│
└─────────────┘
       │
       │
       │ Many-to-Many
       │
       ▼
┌──────────────────┐      ┌─────────────────┐
│ student_courses  │◄────►│    students     │
├──────────────────┤      ├─────────────────┤
│ id (PK)          │      │ id (PK/UUID)    │
│ student_id (FK)  │      │ student_id      │
│ course_id (FK)   │      │ name            │
│ enrolled_at      │      │ profile_photo   │
└──────────────────┘      │ entry_session   │
                          │ graduation_date │
                          │ qr_code_url     │
                          │ created_at      │
                          │ updated_at      │
                          └─────────────────┘
```

## Courses List

The seed file creates 16 courses:

| # | Course Name | Session Type |
|---|-------------|--------------|
| 1 | The art science of facial aesthetics | Theoretical and practical |
| 2 | Skin structure and function | Theory |
| 3 | Skin typing | Theoretical and practical |
| 4 | Common skin condition | Theory |
| 5 | Hair and nail structure and growth | Theory |
| 6 | Skin cosmetics | Theory |
| 7 | Hair cosmetics | Theory |
| 8 | Hair analyzer | Practical |
| 9 | Skin analyzer | Practical |
| 10 | Hydrafacial | Practical |
| 11 | Microneedling | Practical |
| 12 | PRP(platelet-rich-plasma) | Practical |
| 13 | Chemical peel | Practical |
| 14 | RF (Radio frequency) | Practical |
| 15 | DPN(Dermatosis papulosis nigra) removal | Practical |
| 16 | Laser( hair removal) | Practical |

## Security

### Row Level Security (RLS)

All tables have RLS enabled with these policies:

**Public Access** (Anyone can read):
- View all courses
- View all students
- View student-course relationships

**Authenticated Access** (Admins only):
- Create, update, delete students
- Assign courses to students
- Upload/manage photos

### Storage Security

The `student-photos` bucket:
- ✅ Public read access (so certificates can display photos)
- ✅ Authenticated write access (only admins can upload)
- ✅ 50MB file size limit
- ✅ Image files only recommended

## Modifying the Schema

If you need to modify the database:

1. Make changes to `schema.sql`
2. Create a migration file (for production)
3. Or re-run the entire schema (for development)

**Warning**: Re-running schema.sql will NOT delete existing data, but be careful with modifications.

## Troubleshooting

### "Permission denied" errors
- Check that RLS policies were created
- Verify you're using the correct API keys
- Check Supabase project is active

### "Table already exists" errors
- This is normal if running schema.sql multiple times
- The `IF NOT EXISTS` clauses prevent errors
- Existing data will be preserved

### Storage bucket not working
- Verify bucket was created
- Check it's set to "Public"
- Check file size limits
- Verify storage policies were applied

### Courses not showing
- Make sure seed.sql was run successfully
- Check Table Editor → courses table
- Should have 16 rows

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Check the main README.md for more troubleshooting tips

