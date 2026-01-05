'use client';

import { DashboardTemplates } from '@/components/dashboard/DashboardTemplates';

export default function Home() {
  // Global Auth is handled in ClientLayout
  return (
    <main className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto px-6 pt-8 pb-4">
        <DashboardTemplates />
      </div>
    </main>
  );
}