'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { FiLock, FiMail, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import PWAInstallBanner from '../components/PWAInstallBanner';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading('Logging in...');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.session) {
                toast.success('Login successful', { id: loadingToast });
                router.push('/admin');
            }
        } catch (error: any) {
            toast.error(error.message || 'Login failed', { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <PWAInstallBanner />
            <div className="h-screen bg-gradient-to-br from-[#219EBC] via-[#1A7A91] to-[#023047] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-[50%] right-[20%] w-64 h-64 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="max-w-md w-full relative z-10 flex flex-col justify-center">
                    {/* Logo Section */}
                    <div className="text-center mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
                        <div className="inline-block mb-4 sm:mb-6">
                            <img
                                src="/bosphorus logo.jpg"
                                alt="Bosphorus International"
                                className="h-20 sm:h-28 w-auto rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/30"
                            />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-3 sm:mb-4 uppercase">Admin Portal</h1>
                        <p className="text-white/60 font-bold text-[10px] sm:text-xs uppercase tracking-[0.3em]">Bosphorus International Academy</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: '200ms' }}>
                        <div className="space-y-2">
                            <label className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center pointer-events-none text-white/50 z-20 transition-colors group-focus-within:text-white">
                                    <FiMail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-5 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] sm:rounded-[1.8rem] focus:ring-4 focus:ring-white/10 focus:bg-black/30 outline-none text-white font-bold transition-all placeholder:text-white/20 shadow-2xl text-sm sm:text-base relative z-10"
                                    placeholder="admin@bosphorus.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] sm:text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center pointer-events-none text-white/50 z-20 transition-colors group-focus-within:text-white">
                                    <FiLock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 sm:pl-16 pr-5 sm:pr-6 py-4 sm:py-5 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] sm:rounded-[1.8rem] focus:ring-4 focus:ring-white/10 focus:bg-black/30 outline-none text-white font-bold transition-all placeholder:text-white/20 shadow-2xl text-sm sm:text-base relative z-10"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 sm:py-6 bg-white text-[#219EBC] font-black rounded-[1.5rem] sm:rounded-[1.8rem] hover:bg-white/90 transition-all shadow-2xl hover:shadow-white/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-6 sm:mt-8 text-xs sm:text-sm uppercase tracking-[0.2em]"
                        >
                            {loading ? (
                                <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-[#219EBC]/20 border-t-[#219EBC] rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <FiArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 sm:mt-12 text-center animate-in fade-in duration-700" style={{ animationDelay: '400ms' }}>
                        <p className="text-[9px] sm:text-[10px] font-bold text-white/30 uppercase tracking-[0.25em] sm:tracking-[0.3em] leading-relaxed">
                            Certificate Program Management<br />Bosphorus International
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
