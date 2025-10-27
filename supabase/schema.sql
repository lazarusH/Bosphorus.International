-- Create courses table with predefined courses
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  course_number INTEGER NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  session_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  profile_photo_url TEXT,
  entry_session TEXT NOT NULL,
  graduation_date DATE,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create student_courses junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS student_courses (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, course_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_course_id ON student_courses(course_id);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to courses" ON courses;
DROP POLICY IF EXISTS "Allow public read access to students" ON students;
DROP POLICY IF EXISTS "Allow public read access to student_courses" ON student_courses;
DROP POLICY IF EXISTS "Allow authenticated users to insert courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated users to update courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated users to delete courses" ON courses;
DROP POLICY IF EXISTS "Allow authenticated users to insert students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to update students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to delete students" ON students;
DROP POLICY IF EXISTS "Allow authenticated users to insert student_courses" ON student_courses;
DROP POLICY IF EXISTS "Allow authenticated users to delete student_courses" ON student_courses;

-- Create policies for public read access (for certificate viewing)
CREATE POLICY "Allow public read access to courses" ON courses
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to students" ON students
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to student_courses" ON student_courses
  FOR SELECT USING (true);

-- Create policies for authenticated users (admin) to insert/update/delete
CREATE POLICY "Allow authenticated users to insert courses" ON courses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update courses" ON courses
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete courses" ON courses
  FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert students" ON students
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update students" ON students
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete students" ON students
  FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to insert student_courses" ON student_courses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete student_courses" ON student_courses
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-photos', 'student-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow public read access to student photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload student photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update student photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete student photos" ON storage.objects;

-- Create storage policy for public read access
CREATE POLICY "Allow public read access to student photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-photos');

-- Create storage policy for authenticated upload
CREATE POLICY "Allow authenticated users to upload student photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'student-photos' AND auth.uid() IS NOT NULL);

-- Create storage policy for authenticated update
CREATE POLICY "Allow authenticated users to update student photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'student-photos' AND auth.uid() IS NOT NULL);

-- Create storage policy for authenticated delete
CREATE POLICY "Allow authenticated users to delete student photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'student-photos' AND auth.uid() IS NOT NULL);

