'use client';

import { useState, useEffect } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        if (isStandalone) {
            setIsInstalled(true);
            return;
        }

        // Check if user has dismissed the banner before (persists for session)
        if (sessionStorage.getItem('pwa-banner-dismissed')) {
            return;
        }

        const checkPrompt = () => {
            const prompt = (window as any).deferredPrompt;
            if (prompt) {
                setDeferredPrompt(prompt);
                setIsVisible(true);
            }
        };

        const handleReady = () => {
            console.log('PWA Install Ready signal received');
            checkPrompt();
        };

        const handleInstalled = () => {
            setIsInstalled(true);
            setIsVisible(false);
            setDeferredPrompt(null);
        };

        // Check immediately in case it was already captured
        checkPrompt();

        window.addEventListener('pwa-install-ready', handleReady);
        window.addEventListener('appinstalled', handleInstalled);

        // Also keep listening for the native event just in case
        const handleNativePrompt = (e: Event) => {
            e.preventDefault();
            (window as any).deferredPrompt = e;
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setIsVisible(true);
        };
        window.addEventListener('beforeinstallprompt', handleNativePrompt);

        return () => {
            window.removeEventListener('pwa-install-ready', handleReady);
            window.removeEventListener('appinstalled', handleInstalled);
            window.removeEventListener('beforeinstallprompt', handleNativePrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem('pwa-banner-dismissed', 'true');
    };

    // Don't render if installed or not visible
    if (isInstalled || !isVisible) {
        return null;
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] animate-in slide-in-from-top-full duration-500">
            <div className="bg-gradient-to-r from-[#219EBC] to-[#1A7A91] px-4 py-3 shadow-xl shadow-black/20">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <FiDownload className="text-white" size={20} />
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm">Install Bosphorus Admin</p>
                            <p className="text-white/60 text-xs">Quick access from your home screen</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleInstallClick}
                            className="px-5 py-2.5 bg-white text-[#219EBC] font-black text-xs uppercase tracking-wider rounded-xl hover:bg-white/90 transition-all active:scale-95 shadow-lg"
                        >
                            Install
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            aria-label="Dismiss"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
