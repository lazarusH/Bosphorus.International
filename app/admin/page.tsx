'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Course, Student, getSiteUrl } from '@/lib/supabase';
import { checkAuth, signOut } from '@/lib/auth';
import QRCode from 'qrcode';
import { FiUpload, FiSave, FiTrash2, FiEdit, FiDownload, FiLogOut, FiFileText } from 'react-icons/fi';
import jsPDF from 'jspdf';

export default function AdminPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    entrySession: '',
    graduationDate: '',
    profilePhoto: null as File | null,
    selectedCourses: [] as number[],
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const session = await checkAuth();
    if (!session) {
      router.push('/login');
      return;
    }
    setAuthChecking(false);
    fetchCourses();
    fetchStudents();
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('course_number');
    
    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }
    setCourses(data || []);
  };

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching students:', error);
      return;
    }
    setStudents(data || []);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, profilePhoto: e.target.files[0] });
    }
  };

  const handleCourseToggle = (courseId: number) => {
    const selected = formData.selectedCourses;
    if (selected.includes(courseId)) {
      setFormData({
        ...formData,
        selectedCourses: selected.filter(id => id !== courseId)
      });
    } else {
      setFormData({
        ...formData,
        selectedCourses: [...selected, courseId]
      });
    }
  };

  const uploadPhoto = async (file: File, studentId: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('student-photos')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading photo:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('student-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const generateQRCode = async (studentId: string): Promise<string> => {
    const siteUrl = getSiteUrl();
    const url = `${siteUrl}/certificate/${studentId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate unique student UUID
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert([
          {
            student_id: formData.studentId,
            name: formData.name,
            entry_session: formData.entrySession,
            graduation_date: formData.graduationDate || null,
          }
        ])
        .select()
        .single();

      if (studentError) throw studentError;

      let photoUrl = null;
      if (formData.profilePhoto) {
        photoUrl = await uploadPhoto(formData.profilePhoto, studentData.id);
      }

      // Generate QR code
      const qrCodeUrl = await generateQRCode(studentData.id);

      // Update student with photo and QR code URLs
      await supabase
        .from('students')
        .update({
          profile_photo_url: photoUrl,
          qr_code_url: qrCodeUrl,
        })
        .eq('id', studentData.id);

      // Insert selected courses
      if (formData.selectedCourses.length > 0) {
        const studentCourses = formData.selectedCourses.map(courseId => ({
          student_id: studentData.id,
          course_id: courseId,
        }));

        await supabase
          .from('student_courses')
          .insert(studentCourses);
      }

      alert('Student added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        studentId: '',
        entrySession: '',
        graduationDate: '',
        profilePhoto: null,
        selectedCourses: [],
      });
      
      // Refresh students list
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) {
      console.error('Error deleting student:', error);
      alert('Error deleting student.');
      return;
    }

    alert('Student deleted successfully!');
    fetchStudents();
  };

  const downloadQRCodePNG = (qrCodeUrl: string, studentName: string) => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-${studentName.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.click();
  };

  const downloadQRCodePDF = async (qrCodeUrl: string, studentName: string, studentId: string) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Bosphorus International', 105, 20, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Student Certificate QR Code', 105, 30, { align: 'center' });

    // Add student info
    pdf.setFontSize(12);
    pdf.text(`Student: ${studentName}`, 20, 50);
    pdf.text(`ID: ${studentId}`, 20, 60);

    // Add QR code
    const qrSize = 80;
    const x = (210 - qrSize) / 2; // Center on A4 width (210mm)
    pdf.addImage(qrCodeUrl, 'PNG', x, 80, qrSize, qrSize);

    // Add instructions
    pdf.setFontSize(10);
    pdf.text('Scan this QR code to view the certificate', 105, 175, { align: 'center' });

    // Save PDF
    pdf.save(`qr-${studentName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-semibold text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ADD8E6] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <img 
              src="/bosphorus logo.jpg" 
              alt="Bosphorus International" 
              className="h-16 w-auto"
            />
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
            >
              <FiLogOut className="mr-2" />
              Logout
            </button>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Admin Dashboard</h1>
            <p className="text-gray-800">Manage student records and certificates</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Add Student Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Student</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="Enter student name"
                />
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Student ID *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="Enter student ID"
                />
              </div>

              {/* Entry Session */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Entry Session *
                </label>
                <input
                  type="text"
                  required
                  value={formData.entrySession}
                  onChange={(e) => setFormData({ ...formData, entrySession: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  placeholder="e.g., Fall 2024"
                />
              </div>

              {/* Graduation Date */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Graduation Date
                </label>
                <input
                  type="date"
                  value={formData.graduationDate}
                  onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
                />
              </div>

              {/* Profile Photo */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                    <FiUpload className="mr-2" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                  {formData.profilePhoto && (
                    <span className="text-sm text-gray-600">{formData.profilePhoto.name}</span>
                  )}
                </div>
              </div>

              {/* Courses */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">
                  Select Courses
                </label>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-2">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedCourses.includes(course.id)}
                        onChange={() => handleCourseToggle(course.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {course.course_number}. {course.course_name}
                        </div>
                        <div className="text-xs text-gray-500">{course.session_type}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave className="mr-2" />
                {loading ? 'Saving...' : 'Save Student'}
              </button>
            </form>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Students</h2>
            
            <div className="space-y-4 max-h-[800px] overflow-y-auto">
              {students.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No students added yet.</p>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        {student.profile_photo_url && (
                          <img
                            src={student.profile_photo_url}
                            alt={student.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                          <p className="text-sm text-gray-600">Session: {student.entry_session}</p>
                          {student.graduation_date && (
                            <p className="text-sm text-gray-600">
                              Graduation: {new Date(student.graduation_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {student.qr_code_url && (
                          <>
                            <button
                              onClick={() => downloadQRCodePNG(student.qr_code_url!, student.name)}
                              className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                            >
                              <FiDownload className="mr-1" />
                              PNG
                            </button>
                            <button
                              onClick={() => downloadQRCodePDF(student.qr_code_url!, student.name, student.student_id)}
                              className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                            >
                              <FiFileText className="mr-1" />
                              PDF
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        >
                          <FiTrash2 className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

