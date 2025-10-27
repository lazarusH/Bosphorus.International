'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#ADD8E6] flex items-center justify-center">
      <div className="text-2xl font-semibold text-black">Redirecting...</div>
    </div>
  );
}

