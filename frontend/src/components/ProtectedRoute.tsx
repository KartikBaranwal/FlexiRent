"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isHydrated, setAuthModalOpen, setAuthModalMode } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      router.push('/');
    }
  }, [user, isHydrated, router]);

  if (!isHydrated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
