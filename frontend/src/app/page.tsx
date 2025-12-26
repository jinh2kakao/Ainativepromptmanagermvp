'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import PromptListContainer from '@/features/prompts/PromptListContainer';
import { useAuthStore } from '@/features/auth/store';

export default function Home() {
  // Global Auth is handled in ClientLayout
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <PromptListContainer />
    </Suspense>
  );
}