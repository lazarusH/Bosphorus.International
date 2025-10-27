'use client';

import { useState, useEffect } from 'react';
import { supabase, Student } from '@/lib/supabase';
import Link from 'next/link';
import { FiExternalLink, FiUser } from 'react-icons/fi';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ADD8E6] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="mb-6">
            <img 
              src="/bosphorus logo.jpg" 
              alt="Bosphorus International" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-black mb-2">All Students</h1>
          <p className="text-gray-800">View all registered students and their certificates</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or student ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
          />
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FiUser className="text-6xl text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchQuery ? 'No students found matching your search.' : 'No students registered yet.'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
              >
                <div className="p-6">
                  {/* Profile Photo */}
                  <div className="flex justify-center mb-4">
                    {student.profile_photo_url ? (
                      <img
                        src={student.profile_photo_url}
                        alt={student.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-blue-100">
                        <span className="text-3xl font-bold text-white">
                          {student.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Student Info */}
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                    <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                    <p className="text-sm text-gray-600">Session: {student.entry_session}</p>
                    {student.graduation_date && (
                      <p className="text-sm text-gray-600 mt-1">
                        Graduated: {new Date(student.graduation_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* View Certificate Button */}
                  <Link
                    href={`/certificate/${student.id}`}
                    className="flex items-center justify-center w-full px-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition"
                  >
                    View Certificate
                    <FiExternalLink className="ml-2" />
                  </Link>

                  {/* QR Code */}
                  {student.qr_code_url && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={student.qr_code_url}
                        alt="QR Code"
                        className="w-20 h-20 border-2 border-gray-200 rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

