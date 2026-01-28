'use client';

import { useState, useEffect } from 'react';
import { supabase, Course } from '@/lib/supabase';
import { FiX, FiEdit2, FiTrash2, FiPlus, FiSave } from 'react-icons/fi';

interface ManageCoursesProps {
    isOpen: boolean;
    onClose: () => void;
    onCoursesChange: () => void;
}

export default function ManageCourses({ isOpen, onClose, onCoursesChange }: ManageCoursesProps) {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        course_name: '',
        session_type: ''
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newCourseForm, setNewCourseForm] = useState({
        course_name: '',
        session_type: 'Theoretical'
    });

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
        }
    }, [isOpen]);

    const fetchCourses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('course_number');

        if (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to load courses');
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
        setError(null);
        try {
            const { error: updateError } = await supabase
                .from('courses')
                .update({
                    course_name: editForm.course_name.trim(),
                    session_type: editForm.session_type
                })
                .eq('id', id);

            if (updateError) throw updateError;

            setEditingId(null);
            fetchCourses();
            onCoursesChange();
        } catch (err: any) {
            console.error('Error updating course:', err);
            setError(err.message || 'Error updating course');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this course? This may affect students enrolled in it.')) return;

        try {
            const { error: deleteError } = await supabase
                .from('courses')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            fetchCourses();
            onCoursesChange();
        } catch (err: any) {
            console.error('Error deleting course:', err);
            setError(err.message || 'Error deleting course');
        }
    };

    const handleAddCourse = async () => {
        if (!newCourseForm.course_name.trim()) return;
        setSaving(true);
        setError(null);
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

            setNewCourseForm({ course_name: '', session_type: 'Theoretical' });
            setIsAdding(false);
            fetchCourses();
            onCoursesChange();
        } catch (err: any) {
            console.error('Error adding course:', err);
            setError(err.message || 'Error adding course');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col relative">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Manage Courses</h2>
                        <p className="text-sm text-gray-500">View and edit available courses</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        {!isAdding && (
                            <button
                                onClick={() => setIsAdding(true)}
                                className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-semibold"
                            >
                                <FiPlus className="mr-2" />
                                Add New Course
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {isAdding && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 animate-in slide-in-from-top duration-200">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Add New Course</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Course Name</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newCourseForm.course_name}
                                        onChange={(e) => setNewCourseForm({ ...newCourseForm, course_name: e.target.value })}
                                        placeholder="e.g. Advanced Cybersecurity"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Session Type</label>
                                    <select
                                        value={newCourseForm.session_type}
                                        onChange={(e) => setNewCourseForm({ ...newCourseForm, session_type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-black bg-white"
                                    >
                                        <option value="Theoretical">Theoretical</option>
                                        <option value="Theory and Practical">Theory and Practical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-4">
                                <button
                                    onClick={() => setIsAdding(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCourse}
                                    disabled={saving || !newCourseForm.course_name.trim()}
                                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold disabled:opacity-50"
                                >
                                    {saving ? 'Adding...' : 'Save Course'}
                                </button>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-8 text-black">Loading courses...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-3 text-sm font-semibold text-gray-700">#</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-gray-700">Course Name</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-gray-700">Type</th>
                                        <th className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {courses.map((course) => (
                                        <tr key={course.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 text-sm text-gray-600">{course.course_number}</td>
                                            <td className="px-4 py-4">
                                                {editingId === course.id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.course_name}
                                                        onChange={(e) => setEditForm({ ...editForm, course_name: e.target.value })}
                                                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none text-black"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium text-gray-900">{course.course_name}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                {editingId === course.id ? (
                                                    <select
                                                        value={editForm.session_type}
                                                        onChange={(e) => setEditForm({ ...editForm, session_type: e.target.value })}
                                                        className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-black outline-none text-black bg-white"
                                                    >
                                                        <option value="Theoretical">Theoretical</option>
                                                        <option value="Theory and Practical">Theory and Practical</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                                        {course.session_type}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right space-x-2">
                                                {editingId === course.id ? (
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => handleUpdate(course.id)}
                                                            disabled={saving}
                                                            className="text-green-600 hover:text-green-800 transition p-1"
                                                            title="Save"
                                                        >
                                                            <FiSave size={18} />
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="text-red-600 hover:text-red-800 transition p-1"
                                                            title="Cancel"
                                                        >
                                                            <FiX size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end space-x-2">
                                                        <button
                                                            onClick={() => startEdit(course)}
                                                            className="text-blue-600 hover:text-blue-800 transition p-1"
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(course.id)}
                                                            className="text-red-600 hover:text-red-800 transition p-1"
                                                            title="Delete"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {courses.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                                                No courses found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition font-semibold"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
