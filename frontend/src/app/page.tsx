'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store';
import { DashboardTemplates } from '@/components/dashboard/DashboardTemplates';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Wait for global auth initialization
    if (!isInitialized) return;

    // 1. Check if user is logged in
    if (user) {
      setIsChecking(false);
      return;
    }

    // 2. Check if guest has completed onboarding or visited before
    if (typeof window !== 'undefined') {
      const hasCompleted = localStorage.getItem('onboarding_completed');
      const legacyGuestId = localStorage.getItem('guest_id');

      if (!hasCompleted && !legacyGuestId) {
        router.replace('/onboarding/welcome');
      } else {
        setIsChecking(false);
      }
    }
  }, [user, isInitialized, router]);

  if (!isInitialized || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-6 pt-8 pb-4">
        <DashboardTemplates />
      </div>
    </main>
  );
}