'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, Course, Student, getSiteUrl } from '@/lib/supabase';
import { checkAuth, signOut } from '@/lib/auth';
import QRCode from 'qrcode';
import { FiUpload, FiSave, FiTrash2, FiEdit, FiDownload, FiLogOut, FiFileText, FiPlus, FiUsers, FiBookOpen, FiSearch, FiX, FiInfo } from 'react-icons/fi';
import jsPDF from 'jspdf';
import ManageCoursesView from './ManageCoursesView';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import PWAInstallBanner from '../components/PWAInstallBanner';


export default function AdminPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);
    const [activeView, setActiveView] = useState<'all-students' | 'add-student' | 'manage-courses'>('all-students');
    const [searchQuery, setSearchQuery] = useState('');

    // Detail View State
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentCourses, setStudentCourses] = useState<Course[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<{ id: string, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
        toast.success('Logged out successfully');
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

    const fetchStudentCourses = async (studentId: string) => {
        setLoadingDetails(true);
        const { data, error } = await supabase
            .from('student_courses')
            .select('course_id')
            .eq('student_id', studentId);

        if (error) {
            console.error('Error fetching student courses:', error);
            setLoadingDetails(false);
            return;
        }

        const courseIds = data.map(item => item.course_id);
        const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select('*')
            .in('id', courseIds);

        if (coursesError) {
            console.error('Error fetching courses data:', coursesError);
        } else {
            setStudentCourses(coursesData || []);
        }
        setLoadingDetails(false);
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
        const loadingToast = toast.loading('Registering student...');

        try {
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

            const qrCodeUrl = await generateQRCode(studentData.id);

            await supabase
                .from('students')
                .update({
                    profile_photo_url: photoUrl,
                    qr_code_url: qrCodeUrl,
                })
                .eq('id', studentData.id);

            if (formData.selectedCourses.length > 0) {
                const studentCoursesData = formData.selectedCourses.map(courseId => ({
                    student_id: studentData.id,
                    course_id: courseId,
                }));

                await supabase
                    .from('student_courses')
                    .insert(studentCoursesData);
            }

            toast.success('Student registered successfully', { id: loadingToast });
            setFormData({
                name: '',
                studentId: '',
                entrySession: '',
                graduationDate: '',
                profilePhoto: null,
                selectedCourses: [],
            });
            fetchStudents();
            setActiveView('all-students');
        } catch (error: any) {
            console.error('Error adding student:', error);
            let errorMessage = 'Error registering student';
            if (error?.code === '23505') {
                errorMessage = `Duplicate Student ID Detected`;
            }
            toast.error(errorMessage, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (id: string, name: string) => {
        setStudentToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!studentToDelete) return;

        setIsDeleting(true);
        const { error } = await supabase.from('students').delete().eq('id', studentToDelete.id);

        if (error) {
            toast.error('Error deleting student');
        } else {
            toast.success(`Student removed`);
            fetchStudents();
            if (selectedStudent?.id === studentToDelete.id) {
                setSelectedStudent(null);
            }
        }

        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
    };

    const downloadQRCodePNG = (qrCodeUrl: string, studentName: string) => {
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `qr-${studentName.replace(/\s+/g, '-').toLowerCase()}.png`;
        link.click();
        toast.success('QR Code Image downloaded');
    };

    const downloadQRCodePDF = async (qrCodeUrl: string, studentName: string, studentId: string) => {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Bosphorus International', 105, 20, { align: 'center' });
        pdf.setFontSize(14);
        pdf.text('Student Certificate QR Code', 105, 30, { align: 'center' });
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Student: ${studentName}`, 20, 50);
        pdf.text(`ID: ${studentId}`, 20, 60);
        pdf.addImage(qrCodeUrl, 'PNG', 65, 80, 80, 80);
        pdf.setFontSize(10);
        pdf.text('Scan this QR code to view the certificate', 105, 175, { align: 'center' });
        pdf.save(`qr-${studentName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
        toast.success('Certificate PDF generated');
    };

    const openDetailView = async (student: Student) => {
        setSelectedStudent(student);
        await fetchStudentCourses(student.id);
    };

    if (authChecking) {
        return (
            <div className="min-h-screen bg-[#F0F7FA] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#8ECAE6]/10 border-t-[#219EBC] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <>
            <PWAInstallBanner />
            <div className="min-h-screen bg-[#023047] flex">
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Student?"
                    message={`Are you sure you want to delete ${studentToDelete?.name}? This cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    isLoading={isDeleting}
                />

                {/* Student Detail Modal */}
                {selectedStudent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedStudent(null)}></div>
                        <div className="relative w-full max-w-4xl bg-[#023047] rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto border border-white/10">
                            <div className="p-10 md:p-14">
                                <div className="flex items-center justify-between mb-12">
                                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Student Details</h2>
                                    <button onClick={() => setSelectedStudent(null)} className="w-14 h-14 flex items-center justify-center bg-white/5 text-white/40 rounded-2xl hover:bg-white/10 hover:text-white transition p-2 border border-white/10">
                                        <FiX size={28} />
                                    </button>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-14">
                                    <div className="space-y-10 text-black">
                                        <div className="relative inline-block mx-auto lg:mx-0">
                                            {selectedStudent.profile_photo_url ? (
                                                <img src={selectedStudent.profile_photo_url} alt={selectedStudent.name} className="w-64 h-64 rounded-[3.5rem] object-cover shadow-2xl border-4 border-white/10" />
                                            ) : (
                                                <div className="w-64 h-64 rounded-[3.5rem] bg-white/5 flex items-center justify-center text-white/10 border-4 border-dashed border-white/5"><FiUsers size={80} /></div>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Full Name</label>
                                                <p className="text-3xl font-black text-white uppercase">{selectedStudent.name}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Student ID</label>
                                                    <p className="text-xl font-bold text-white/80">{selectedStudent.student_id}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Session</label>
                                                    <p className="text-xl font-bold text-white/80">{selectedStudent.entry_session}</p>
                                                </div>
                                            </div>
                                            {selectedStudent.graduation_date && (
                                                <div>
                                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-1">Graduation Date</label>
                                                    <p className="text-xl font-bold text-white/80">{new Date(selectedStudent.graduation_date).toLocaleDateString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase border-b border-white/10 pb-4">Enrolled Courses</h3>
                                        {loadingDetails ? (
                                            <div className="flex justify-center py-20">
                                                <div className="w-10 h-10 border-4 border-white/10 border-t-[#219EBC] rounded-full animate-spin"></div>
                                            </div>
                                        ) : studentCourses.length > 0 ? (
                                            <div className="space-y-4">
                                                {studentCourses.map((course) => (
                                                    <div key={course.id} className="flex items-center gap-5 p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/10 transition-all duration-300">
                                                        <div className="w-12 h-12 bg-[#219EBC] rounded-2xl flex items-center justify-center shadow-lg text-white font-black text-xs">
                                                            {course.course_number.toString().padStart(2, '0')}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-white uppercase text-sm">{course.course_name}</p>
                                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{course.session_type}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-white/20 font-black uppercase tracking-widest text-center py-20">No courses enrolled</p>
                                        )}

                                        <div className="pt-10 space-y-4">
                                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest text-center">Certificate Actions</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button onClick={() => downloadQRCodePNG(selectedStudent.qr_code_url!, selectedStudent.name)} className="flex items-center justify-center py-5 bg-[#219EBC] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#219EBC]/20 hover:bg-[#1A7A91] transition-all"><FiDownload size={18} className="mr-2" /> PNG QR</button>
                                                <button onClick={() => downloadQRCodePDF(selectedStudent.qr_code_url!, selectedStudent.name, selectedStudent.student_id)} className="flex items-center justify-center py-5 bg-white/5 text-white border-2 border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 hover:border-white transition-all"><FiFileText size={18} className="mr-2" /> PDF Certificate</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop Sidebar */}
                <aside className="hidden md:flex flex-col w-72 bg-[#022A3F] h-screen sticky top-0 shadow-[4px_0_32px_rgba(33,158,188,0.15)] z-50">
                    <div className="p-10 border-b border-white/10 flex justify-center bg-white/5">
                        <img src="/bosphorus logo.jpg" alt="Bosphorus International" className="h-24 w-auto rounded-2xl shadow-lg" />
                    </div>

                    <nav className="flex-1 p-8 space-y-4 mt-6">
                        <button
                            onClick={() => setActiveView('all-students')}
                            className={`w-full flex items-center px-6 py-5 rounded-[2rem] transition-all duration-500 group ${activeView === 'all-students'
                                ? 'bg-[#219EBC] text-white shadow-xl shadow-black/10 scale-[1.02]'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <FiUsers className={`mr-4 text-xl ${activeView === 'all-students' ? 'text-white' : 'group-hover:text-white'}`} />
                            <span className="font-black text-xs uppercase tracking-widest">All Students</span>
                        </button>

                        <button
                            onClick={() => setActiveView('add-student')}
                            className={`w-full flex items-center px-6 py-5 rounded-[2rem] transition-all duration-500 group ${activeView === 'add-student'
                                ? 'bg-[#219EBC] text-white shadow-xl shadow-black/10 scale-[1.02]'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <FiPlus className={`mr-4 text-xl ${activeView === 'add-student' ? 'text-white' : 'group-hover:text-white'}`} />
                            <span className="font-black text-xs uppercase tracking-widest">Register Student</span>
                        </button>

                        <button
                            onClick={() => setActiveView('manage-courses')}
                            className={`w-full flex items-center px-6 py-5 rounded-[2rem] transition-all duration-500 group ${activeView === 'manage-courses'
                                ? 'bg-[#219EBC] text-white shadow-xl shadow-black/10 scale-[1.02]'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                        >
                            <FiBookOpen className={`mr-4 text-xl ${activeView === 'manage-courses' ? 'text-white' : 'group-hover:text-white'}`} />
                            <span className="font-black text-xs uppercase tracking-widest">Manage Courses</span>
                        </button>
                    </nav>

                    <div className="p-8 border-t border-white/10 mb-6">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-6 py-5 text-white/50 hover:text-white hover:bg-red-500/20 rounded-[2rem] transition-all duration-300 font-black text-xs uppercase tracking-widest"
                        >
                            <FiLogOut className="mr-4 text-xl" />
                            Logout
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#023047] via-[#1A7A91] to-[#219EBC]">
                    <div className="p-8 md:p-16 lg:p-20 max-w-7xl mx-auto">
                        {/* Mobile Header */}
                        <div className="md:hidden flex items-center justify-between mb-12 bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-sm border border-white/10">
                            <img src="/bosphorus logo.jpg" alt="Bosphorus International" className="h-12 w-auto rounded-xl" />
                            <button onClick={handleLogout} className="p-3 text-white/40 hover:text-white transition-colors"><FiLogOut size={24} /></button>
                        </div>

                        <header className="mb-14 animate-in fade-in slide-in-from-left-6 duration-700">
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4 uppercase">
                                {activeView === 'all-students' && 'All Students'}
                                {activeView === 'add-student' && 'Register Student'}
                                {activeView === 'manage-courses' && 'Manage Courses'}
                            </h1>
                        </header>

                        <div className="pb-32 md:pb-0 min-h-[700px]">
                            {/* View Transitions */}
                            {activeView === 'add-student' && (
                                <div className="animate-in fade-in slide-in-from-left-12 duration-700">
                                    <div className="relative overflow-hidden bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-2xl p-12 md:p-20">
                                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                                        <h2 className="text-4xl font-black text-white mb-12 tracking-tighter uppercase">Register Student</h2>

                                        <form onSubmit={handleSubmit} className="space-y-10">
                                            <div className="grid md:grid-cols-2 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Full Name</label>
                                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-8 py-6 bg-black/20 border border-white/10 rounded-[1.8rem] focus:ring-4 focus:ring-white/10 text-white outline-none font-bold placeholder:text-white/20" placeholder="Student Name" />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Student ID</label>
                                                    <input type="text" required value={formData.studentId} onChange={(e) => setFormData({ ...formData, studentId: e.target.value })} className="w-full px-8 py-6 bg-black/20 border border-white/10 rounded-[1.8rem] focus:ring-4 focus:ring-white/10 text-white outline-none font-bold placeholder:text-white/20" placeholder="ST-1234" />
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Session</label>
                                                    <input type="text" required value={formData.entrySession} onChange={(e) => setFormData({ ...formData, entrySession: e.target.value })} className="w-full px-8 py-6 bg-black/20 border border-white/10 rounded-[1.8rem] focus:ring-4 focus:ring-white/10 text-white outline-none font-bold placeholder:text-white/20" placeholder="e.g. Autumn 2024" />
                                                </div>
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Graduation Date</label>
                                                    <input type="date" value={formData.graduationDate} onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })} className="w-full px-8 py-6 bg-black/20 border border-white/10 rounded-[1.8rem] focus:ring-4 focus:ring-white/10 text-white outline-none font-bold" />
                                                </div>
                                            </div>

                                            <div className="space-y-3 text-white">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Profile Photo</label>
                                                <label className="flex items-center justify-center w-full px-12 py-10 bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] cursor-pointer hover:bg-white hover:text-[#219EBC] hover:border-white transition-all group backdrop-blur-md">
                                                    <FiUpload size={32} className="mr-4 group-hover:scale-110 transition-transform" />
                                                    <span className="font-black text-xs uppercase tracking-[0.2em]">{formData.profilePhoto ? formData.profilePhoto.name : 'Choose File'}</span>
                                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                                </label>
                                            </div>

                                            <div className="space-y-3 text-white">
                                                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Select Courses</label>
                                                <div className="max-h-[350px] overflow-y-auto bg-black/20 backdrop-blur-md rounded-[2.5rem] p-10 space-y-4 custom-scrollbar border border-white/10">
                                                    {courses.map((course) => (
                                                        <label key={course.id} className={`flex items-start space-x-6 p-6 rounded-[1.8rem] cursor-pointer transition-all border ${formData.selectedCourses.includes(course.id) ? 'bg-white/20 border-white' : 'bg-transparent border-white/5 hover:border-white/20'}`}>
                                                            <input type="checkbox" checked={formData.selectedCourses.includes(course.id)} onChange={() => handleCourseToggle(course.id)} className="w-6 h-6 rounded-lg text-[#219EBC] border-white/10 focus:ring-white/10 bg-transparent" />
                                                            <div className="flex-1">
                                                                <div className={`text-sm font-black tracking-tight uppercase text-white`}>{course.course_name}</div>
                                                                <div className={`text-[9px] font-black uppercase tracking-[0.2em] mt-1 ${formData.selectedCourses.includes(course.id) ? 'text-white/60' : 'text-white/30'}`}>{course.session_type}</div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <button type="submit" disabled={loading} className="w-full py-8 bg-white text-[#219EBC] font-black rounded-[2rem] hover:bg-white/90 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 text-xs uppercase tracking-[0.3em] flex items-center justify-center">
                                                {loading ? <div className="w-8 h-8 border-4 border-[#219EBC]/20 border-t-[#219EBC] rounded-full animate-spin"></div> : 'Register Student'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {activeView === 'all-students' && (
                                <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
                                    <div className="bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-2xl p-12 md:p-20">
                                        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-20 gap-12">
                                            <div>
                                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase">All Students</h2>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                                                    <span className="text-white/40 font-black text-[11px] uppercase tracking-[0.3em]">{students.length} Records found</span>
                                                </div>
                                            </div>
                                            <div className="relative flex-1 max-w-2xl group">
                                                <input type="text" placeholder="Search by name or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-20 pr-10 py-7 bg-white/5 border border-white/10 rounded-[2.5rem] focus:ring-8 focus:ring-white/5 focus:border-white/30 focus:bg-white/10 transition-all text-white font-bold text-xl placeholder:text-white/20 shadow-sm outline-none" />
                                                <FiSearch className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={32} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-10">
                                            {(() => {
                                                const filtered = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.student_id.toLowerCase().includes(searchQuery.toLowerCase()));
                                                if (filtered.length === 0) return (
                                                    <div className="col-span-full py-60 text-center bg-gray-50/50 rounded-[4rem] border border-dashed border-gray-100">
                                                        <p className="text-gray-300 font-black text-5xl uppercase tracking-tighter">No results found</p>
                                                    </div>
                                                );

                                                return filtered.map((student) => (
                                                    <div key={student.id} className="group relative overflow-hidden bg-gradient-to-br from-[#219EBC] to-[#1A7A91] rounded-[3.5rem] p-12 hover:shadow-[0_48px_96px_-24px_rgba(33,158,188,0.3)] transition-all duration-700 hover:-translate-y-3 cursor-pointer" onClick={() => openDetailView(student)}>
                                                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24"></div>

                                                        <div className="relative flex flex-col lg:flex-row items-center lg:items-start gap-12 z-10">
                                                            <div className="relative">
                                                                {student.profile_photo_url ? (
                                                                    <img src={student.profile_photo_url} alt={student.name} className="w-48 h-48 rounded-[3rem] object-cover shadow-2xl shadow-black/20 transition-all duration-700 hover:scale-105 border-4 border-white/30" />
                                                                ) : (
                                                                    <div className="w-48 h-48 rounded-[3rem] bg-white/10 backdrop-blur-md flex items-center justify-center text-white/50"><FiUsers size={72} /></div>
                                                                )}
                                                                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-[#219EBC] group-hover:rotate-12 transition-transform">
                                                                    <span className="text-[14px] font-black tracking-tighter text-[#219EBC]">{student.student_id.slice(-4)}</span>
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 text-center lg:text-left">
                                                                <h3 className="text-4xl font-black text-white leading-tight mb-6 tracking-tighter uppercase">{student.name}</h3>
                                                                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
                                                                    <span className="px-6 py-2 bg-white/15 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl backdrop-blur-md border border-white/5 shadow-inner">ID: {student.student_id}</span>
                                                                    <span className="px-6 py-2 bg-black/10 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-2xl">{student.entry_session}</span>
                                                                </div>

                                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                                                                    <button onClick={(e) => { e.stopPropagation(); openDetailView(student); }} className="flex flex-col items-center justify-center py-4 text-white hover:text-white/90 rounded-[1.5rem] transition-all group/btn">
                                                                        <FiInfo size={20} className="mb-1" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">Info</span>
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); downloadQRCodePNG(student.qr_code_url!, student.name); }} className="flex flex-col items-center justify-center py-4 text-white hover:text-white/90 rounded-[1.5rem] transition-all group/btn">
                                                                        <FiDownload size={20} className="mb-1" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">PNG</span>
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); downloadQRCodePDF(student.qr_code_url!, student.name, student.student_id); }} className="flex flex-col items-center justify-center py-4 text-white hover:text-white/90 rounded-[1.5rem] transition-all group/btn">
                                                                        <FiFileText size={20} className="mb-1" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">PDF</span>
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); openDeleteModal(student.id, student.name); }} className="flex flex-col items-center justify-center py-4 text-white hover:text-red-300 rounded-[1.5rem] transition-all group/btn">
                                                                        <FiTrash2 size={20} className="mb-1" />
                                                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover/btn:opacity-100">Del</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeView === 'manage-courses' && (
                                <div className="animate-in fade-in slide-in-from-bottom-12 duration-700">
                                    <ManageCoursesView onCoursesChange={fetchCourses} />
                                </div>
                            )}
                        </div>

                        {/* Mobile Navigation */}
                        <div className="fixed bottom-10 left-10 right-10 bg-[#023047]/80 backdrop-blur-3xl border border-white/10 md:hidden flex justify-around p-5 z-50 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]">
                            <button onClick={() => setActiveView('all-students')} className={`flex flex-col items-center p-5 rounded-[2rem] transition-all ${activeView === 'all-students' ? 'text-white bg-[#219EBC] shadow-xl shadow-[#219EBC]/20' : 'text-white/30'}`}>
                                <FiUsers size={32} />
                            </button>
                            <button onClick={() => setActiveView('add-student')} className={`flex flex-col items-center p-5 rounded-[2rem] transition-all ${activeView === 'add-student' ? 'text-white bg-[#219EBC] shadow-xl shadow-[#219EBC]/20' : 'text-white/30'}`}>
                                <FiPlus size={32} />
                            </button>
                            <button onClick={() => setActiveView('manage-courses')} className={`flex flex-col items-center p-5 rounded-[2rem] transition-all ${activeView === 'manage-courses' ? 'text-white bg-[#219EBC] shadow-xl shadow-[#219EBC]/20' : 'text-white/30'}`}>
                                <FiBookOpen size={32} />
                            </button>
                        </div>
                    </div>
                </main >
            </div >
        </>
    );
}
