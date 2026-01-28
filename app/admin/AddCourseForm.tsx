'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { FiX } from 'react-icons/fi';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseAdded: () => void;
}

export default function AddCourseModal({ isOpen, onClose, onCourseAdded }: AddCourseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    courseName: '',
    courseType: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the highest course number and increment it
      const { data: existingCourses, error: fetchError } = await supabase
        .from('courses')
        .select('course_number')
        .order('course_number', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      const nextCourseNumber = existingCourses && existingCourses.length > 0
        ? existingCourses[0].course_number + 1
        : 1;

      // Insert new course
      const { error: insertError } = await supabase
        .from('courses')
        .insert([
          {
            course_number: nextCourseNumber,
            course_name: formData.courseName.trim(),
            session_type: formData.courseType,
          }
        ]);

      if (insertError) throw insertError;

      // Reset form
      setFormData({
        courseName: '',
        courseType: '',
      });

      // Notify parent component
      onCourseAdded();

      // Close modal
      onClose();
    } catch (error: any) {
      console.error('Error adding course:', error);

      // Parse error and show user-friendly message
      let errorMessage = 'Error adding course. Please try again.';

      if (error?.code === '23505') {
        errorMessage = 'This course already exists. Please check the information and try again.';
      } else if (error?.code === '23502') {
        errorMessage = 'Please fill in all required fields.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <FiX size={24} />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Course</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Course Name *
            </label>
            <input
              type="text"
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
              placeholder="Enter course name"
            />
          </div>

          {/* Course Type */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Type *
            </label>
            <select
              required
              value={formData.courseType}
              onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-black"
            >
              <option value="">Select type</option>
              <option value="Theoretical">Theoretical</option>
              <option value="Theory and Practical">Theory and Practical</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
