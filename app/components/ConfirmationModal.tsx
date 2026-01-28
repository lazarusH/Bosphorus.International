'use client';

import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: <FiAlertTriangle className="text-red-500" size={24} />,
            bg: 'bg-red-50',
            button: 'bg-red-500 hover:bg-red-600 shadow-red-200',
        },
        warning: {
            icon: <FiAlertTriangle className="text-amber-500" size={24} />,
            bg: 'bg-amber-50',
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
        },
        info: {
            icon: <FiAlertTriangle className="text-blue-500" size={24} />,
            bg: 'bg-blue-50',
            button: 'bg-blue-500 hover:bg-blue-600 shadow-blue-200',
        }
    };

    const style = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className={`w-12 h-12 ${style.bg} rounded-2xl flex items-center justify-center`}>
                            {style.icon}
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-50 rounded-xl"
                        >
                            <FiX size={20} />
                        </button>
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        {message}
                    </p>

                    <div className="flex gap-3 mt-10">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`flex-1 px-6 py-4 ${style.button} text-white font-bold rounded-2xl transition shadow-xl disabled:opacity-50 flex items-center justify-center`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
