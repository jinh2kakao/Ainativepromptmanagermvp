'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/features/auth/store';
import { LayoutDashboard, Users, FileText, FolderTree, Settings, LogOut, CreditCard, Megaphone, HelpCircle, MessageSquare, Bot } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, session, isInitialized } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Wait for global auth initialization
        if (!isInitialized) return;

        // Check if user is admin
        // Note: In a real app, we should also verify with the backend
        // For MVP, we check the role in the user object (assuming it's synced)
        // However, the current frontend user object might not have 'role' yet if we didn't update the type.
        // We'll need to update the User type in frontend as well.

        const qaToken = typeof window !== 'undefined' ? localStorage.getItem('qa_token') : null;

        if (!session && !qaToken) {
            router.push('/login');
            return;
        }

        // Temporary: Allow access if email contains 'admin' or specific logic
        // Ideally, we should check user.role === 'admin'
        // Let's assume we updated the frontend User type or we check a custom claim

        // For now, let's just allow access for demo/dev purposes or check a specific email
        // In production, strictly check user.role

        // if (user?.role !== 'admin') {
        //   toast.error('관리자 권한이 필요합니다.');
        //   router.push('/');
        //   return;
        // }

        setIsLoading(false);
    }, [session, router, user, isInitialized]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    const navItems = [
        { href: '/admin', label: '대시보드', icon: LayoutDashboard },
        { href: '/admin/users', label: '사용자 관리', icon: Users },
        { href: '/admin/prompts', label: '프롬프트 관리', icon: FileText },
        { href: '/admin/projects', label: '프로젝트 모니터링', icon: FolderTree },
        { href: '/admin/categories', label: '카테고리 관리', icon: FolderTree },
        { href: '/admin/templates', label: '템플릿 관리', icon: FileText },
        { href: '/admin/notices', label: '공지사항 관리', icon: Megaphone },
        { href: '/admin/faqs', label: 'FAQ 관리', icon: HelpCircle },
        { href: '/admin/qna', label: '1:1 문의 관리', icon: MessageSquare },
        { href: '/admin/agents', label: 'AI 에이전트 관리', icon: Bot },
        { href: '/admin/payments', label: '결제 관리', icon: CreditCard },
        { href: '/admin/invoices', label: '인보이스 관리', icon: FileText },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Admin Console</h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        서비스로 돌아가기
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
