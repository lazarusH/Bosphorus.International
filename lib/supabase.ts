import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get the site URL for QR codes (use production URL when deployed)
export const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || 
         (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
};

export interface Course {
  id: number;
  course_number: number;
  course_name: string;
  session_type: string;
}

export interface Student {
  id: string;
  student_id: string;
  name: string;
  profile_photo_url: string | null;
  entry_session: string;
  graduation_date: string | null;
  qr_code_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentCourse {
  id: number;
  student_id: string;
  course_id: number;
  enrolled_at: string;
}

export interface StudentWithCourses extends Student {
  courses: Course[];
}

