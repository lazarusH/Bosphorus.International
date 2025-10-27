'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase, Course } from '@/lib/supabase';
import confetti from 'canvas-confetti';
import { FiCheck, FiCalendar } from 'react-icons/fi';

interface StudentWithCourses {
  id: string;
  student_id: string;
  name: string;
  profile_photo_url: string | null;
  entry_session: string;
  graduation_date: string | null;
  courses: Course[];
}

export default function CertificatePage() {
  const params = useParams();
  const [student, setStudent] = useState<StudentWithCourses | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
  }, [params.id]);

  useEffect(() => {
    if (student) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [student]);

  const fetchStudentData = async () => {
    try {
      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('id', params.id)
        .single();

      if (studentError) throw studentError;

      // Fetch student's courses
      const { data: studentCoursesData, error: coursesError } = await supabase
        .from('student_courses')
        .select('course_id')
        .eq('student_id', params.id);

      if (coursesError) throw coursesError;

      const courseIds = studentCoursesData.map(sc => sc.course_id);

      // Fetch course details
      const { data: coursesData, error: courseDetailsError } = await supabase
        .from('courses')
        .select('*')
        .in('id', courseIds)
        .order('course_number');

      if (courseDetailsError) throw courseDetailsError;

      setStudent({
        ...studentData,
        courses: coursesData || []
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600">
        <div className="text-white text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-gray-900">Student Not Found</h1>
          <p className="text-gray-600 mt-2">The certificate you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    const year = date.getFullYear();
    return { month, day, year, full: `${month.charAt(0) + month.slice(1).toLowerCase()} ${day}, ${year}` };
  };

  const graduationDate = formatDate(student.graduation_date);

  return (
    <div className="min-h-screen certificate-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Sparkle decorations */}
      <div className="sparkle" style={{ top: '10%', left: '15%', animationDelay: '0s' }}></div>
      <div className="sparkle" style={{ top: '20%', right: '20%', animationDelay: '0.5s' }}></div>
      <div className="sparkle" style={{ bottom: '30%', left: '25%', animationDelay: '1s' }}></div>
      <div className="sparkle" style={{ top: '40%', right: '15%', animationDelay: '1.5s' }}></div>
      <div className="sparkle" style={{ bottom: '20%', right: '30%', animationDelay: '2s' }}></div>
      <div className="sparkle" style={{ top: '60%', left: '10%', animationDelay: '2.5s' }}></div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="p-8 md:p-12 text-center">
            {/* Profile Photo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full blur-md opacity-50"></div>
                {student.profile_photo_url ? (
                  <img
                    src={student.profile_photo_url}
                    alt={student.name}
                    className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                  />
                ) : (
                  <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-white shadow-xl">
                    <span className="text-4xl md:text-5xl font-bold text-white">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Student Name */}
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
              {student.name}
            </h1>

            {/* School Name */}
            <p className="text-base md:text-lg text-gray-600 font-medium uppercase tracking-wider mb-6">
              Bosphorus Cosmetology and Skin Care School
            </p>

            {/* Graduation Date */}
            {graduationDate && (
              <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl px-6 py-4 mb-8">
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl px-4 py-3 mr-4 text-center min-w-[80px]">
                  <div className="text-xs font-semibold uppercase">{graduationDate.month}</div>
                  <div className="text-3xl font-bold">{graduationDate.day}</div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Graduation Date
                  </div>
                  <div className="text-lg font-bold text-gray-900">{graduationDate.full}</div>
                </div>
              </div>
            )}

            {/* Taken Courses Section */}
            <div className="mt-8">
              <h2 className="text-xl md:text-2xl font-bold text-teal-600 mb-4 text-left">
                Taken Courses
              </h2>
              
              <div className="space-y-3">
                {student.courses.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No courses registered yet.</p>
                ) : (
                  student.courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl px-5 py-4 flex items-start text-left hover:from-teal-100 hover:to-cyan-100 transition-all"
                    >
                      <div className="flex-shrink-0 mr-3 mt-0.5">
                        <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                          <FiCheck className="text-white text-sm font-bold" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {course.course_name}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {course.session_type}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <div className="text-gray-500 font-medium">Student ID</div>
                  <div className="text-gray-900 font-semibold">{student.student_id}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500 font-medium">Entry Session</div>
                  <div className="text-gray-900 font-semibold">{student.entry_session}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center bg-white bg-opacity-90 rounded-full px-6 py-3 shadow-lg">
            <img 
              src="/verified-badge.svg" 
              alt="Verified" 
              className="w-6 h-6 mr-3"
            />
            <span className="text-sm font-semibold text-gray-800">Verified Certificate</span>
          </div>
        </div>
      </div>
    </div>
  );
}

