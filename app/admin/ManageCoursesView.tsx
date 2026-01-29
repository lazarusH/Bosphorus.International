'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Course } from '@/lib/supabase';
import { FiX, FiEdit2, FiTrash2, FiPlus, FiSave, FiBookOpen } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';

interface ManageCoursesViewProps {
    onCoursesChange: () => void;
}

export default function ManageCoursesView({ onCoursesChange }: ManageCoursesViewProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        course_name: '',
        session_type: ''
    });
    const [saving, setSaving] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newCourseForm, setNewCourseForm] = useState({
        course_name: '',
        session_type: 'Theory'
    });

    // Confirmation Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<{ id: number, name: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('course_number');

        if (error) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
        } else {
            setCourses(data || []);
        }
        setLoading(false);
    };

    const startEdit = (course: Course) => {
        setEditingId(course.id);
        setEditForm({
            course_name: course.course_name,
            session_type: course.session_type
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({ course_name: '', session_type: '' });
    };

    const handleUpdate = async (id: number) => {
        setSaving(true);
        const loadingToast = toast.loading('Updating course...');
        try {
            const { error: updateError } = await supabase
                .from('courses')
                .update({
                    course_name: editForm.course_name.trim(),
                    session_type: editForm.session_type
                })
                .eq('id', id);

            if (updateError) throw updateError;

            toast.success('Course updated successfully', { id: loadingToast });
            setEditingId(null);
            fetchCourses();
            onCoursesChange();
        } catch (err: any) {
            console.error('Error updating course:', err);
            toast.error(err.message || 'Error updating course', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    const openDeleteModal = (id: number, name: string) => {
        setCourseToDelete({ id, name });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!courseToDelete) return;
        setIsDeleting(true);

        try {
            const { error: deleteError } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseToDelete.id);

            if (deleteError) throw deleteError;

            toast.success(`Course removed`);
            fetchCourses();
            onCoursesChange();
        } catch (err: any) {
            console.error('Error deleting course:', err);
            toast.error('Error deleting course');
        } finally {
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
        }
    };

    const handleAddCourse = async () => {
        if (!newCourseForm.course_name.trim()) return;
        setSaving(true);
        const loadingToast = toast.loading('Saving course...');
        try {
            const { data: existingCourses } = await supabase
                .from('courses')
                .select('course_number')
                .order('course_number', { ascending: false })
                .limit(1);

            const nextNum = existingCourses && existingCourses.length > 0
                ? existingCourses[0].course_number + 1
                : 1;

            const { error: insertError } = await supabase
                .from('courses')
                .insert([{
                    course_number: nextNum,
                    course_name: newCourseForm.course_name.trim(),
                    session_type: newCourseForm.session_type
                }]);

            if (insertError) throw insertError;

            toast.success('Course added successfully', { id: loadingToast });
            setNewCourseForm({ course_name: '', session_type: 'Theory' });
            setIsAdding(false);
            fetchCourses();
            onCoursesChange();
        } catch (err: any) {
            console.error('Error adding course:', err);
            toast.error('Error adding course', { id: loadingToast });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-2xl p-8 md:p-14">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Remove course?"
                message={`Are you sure you want to remove "${courseToDelete?.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                isLoading={isDeleting}
            />

            <div className="relative z-10">
                <div className="p-8 md:p-14 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Manage Courses</h2>
                    </div>
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full md:w-auto flex items-center justify-center px-10 py-5 bg-white text-[#219EBC] rounded-[1.8rem] hover:bg-[#F0F7FA] transition shadow-xl shadow-black/10 font-black text-[10px] md:text-xs uppercase tracking-widest active:scale-95 whitespace-nowrap"
                        >
                            <FiPlus className="mr-2 text-lg" />
                            Add Course
                        </button>
                    )}
                </div>

                <div className="p-8 md:p-14">
                    {isAdding && (
                        <div className="bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 mb-12 animate-in slide-in-from-top-4 fade-in duration-300">
                            <div className="flex items-center justify-between mb-10">
                                <h3 className="text-2xl font-black text-white tracking-tight uppercase">New Course Details</h3>
                                <button onClick={() => setIsAdding(false)} className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white transition bg-white/5 rounded-full">
                                    <FiX size={20} />
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-10 text-white">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Course Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newCourseForm.course_name}
                                        onChange={(e) => setNewCourseForm({ ...newCourseForm, course_name: e.target.value })}
                                        placeholder="Course Name"
                                        className="w-full px-8 py-6 bg-black/20 border border-white/10 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-white/10 text-white font-bold placeholder:text-white/20"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Course Type</label>
                                    <div className="relative">
                                        <select
                                            value={newCourseForm.session_type}
                                            onChange={(e) => setNewCourseForm({ ...newCourseForm, session_type: e.target.value })}
                                            className="w-full px-8 py-6 bg-black/20 border border-white/10 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-white/10 text-white font-bold appearance-none outline-none cursor-pointer"
                                        >
                                            <option value="Theory" className="bg-[#1A7A91] text-white">Theory Only</option>
                                            <option value="Theory and Practical" className="bg-[#1A7A91] text-white">Theory & Practical</option>
                                        </select>
                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                            <FiBookOpen size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-6 mt-12">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-8 py-5 text-white underline font-black uppercase tracking-widest text-[10px]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCourse}
                                    disabled={saving || !newCourseForm.course_name.trim()}
                                    className="px-12 py-5 bg-white text-[#219EBC] rounded-[1.5rem] hover:shadow-2xl hover:shadow-black/20 transition font-black uppercase tracking-widest text-[10px] disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : 'Save Course'}
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40 space-y-8">
                            <div className="w-16 h-16 border-[6px] border-white/10 border-t-white rounded-full animate-spin"></div>
                            <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.3em]">Loading Courses...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto text-white">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-8 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">No</th>
                                        <th className="px-8 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Course Name</th>
                                        <th className="px-8 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Type</th>
                                        <th className="px-8 py-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-white/5 transition-all group">
                                            <td className="px-8 py-10 text-sm font-black text-white/20">
                                                {course.course_number.toString().padStart(2, '0')}
                                            </td>
                                            <td className="px-8 py-10">
                                                {editingId === course.id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.course_name}
                                                        onChange={(e) => setEditForm({ ...editForm, course_name: e.target.value })}
                                                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-[1.2rem] text-white font-bold outline-none focus:ring-2 focus:ring-white/10"
                                                    />
                                                ) : (
                                                    <span className="text-2xl font-black text-white tracking-tighter uppercase">{course.course_name}</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-10">
                                                {editingId === course.id ? (
                                                    <select
                                                        value={editForm.session_type}
                                                        onChange={(e) => setEditForm({ ...editForm, session_type: e.target.value })}
                                                        className="w-full px-6 py-4 bg-black/20 border border-white/10 rounded-[1.2rem] text-white font-bold outline-none focus:ring-2 focus:ring-white/10 appearance-none cursor-pointer"
                                                    >
                                                        <option value="Theory" className="bg-[#1A7A91] text-white">Theory Only</option>
                                                        <option value="Theory and Practical" className="bg-[#1A7A91] text-white">Theory & Practical</option>
                                                    </select>
                                                ) : (
                                                    <span className={`inline-flex px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md ${course.session_type === 'Theory'
                                                        ? 'bg-white/10 text-white border border-white/10'
                                                        : 'bg-white/20 text-white border border-white/20'
                                                        }`}>
                                                        {course.session_type === 'Theory' ? 'Theory Only' : 'Theory & Practical'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-10 text-right">
                                                {editingId === course.id ? (
                                                    <div className="flex justify-end space-x-4">
                                                        <button
                                                            onClick={() => handleUpdate(course.id)}
                                                            disabled={saving}
                                                            className="w-14 h-14 flex items-center justify-center bg-white text-[#219EBC] rounded-2xl hover:scale-110 transition shadow-xl"
                                                            title="Save"
                                                        >
                                                            <FiSave size={22} />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="w-14 h-14 flex items-center justify-center bg-white/10 text-white rounded-2xl hover:bg-white/20 transition"
                                                            title="Cancel"
                                                        >
                                                            <FiX size={22} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end space-x-4 transition-all duration-500">
                                                        <button
                                                            onClick={() => startEdit(course)}
                                                            className="w-14 h-14 flex items-center justify-center bg-white/10 text-white border border-white/10 rounded-2xl hover:bg-white hover:text-[#219EBC] transition-all hover:shadow-2xl hover:shadow-black/20"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(course.id, course.course_name)}
                                                            className="w-14 h-14 flex items-center justify-center bg-white/10 text-white border border-white/10 rounded-2xl hover:bg-red-500 hover:border-red-500 transition-all"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={20} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {courses.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-48 text-center text-white/5 font-black text-6xl uppercase tracking-tighter">
                                                No Courses
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
