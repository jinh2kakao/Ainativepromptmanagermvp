import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Clock, TrendingUp } from 'lucide-react';
import { api } from '@/utils/axios';
import { TemplateCard } from './TemplateCard';
import { useUser } from '@/features/auth/useUser';
import { CategoryGrid } from '@/components/common/CategoryGrid';

// Helper for fetching
const fetchPopularTemplates = async () => {
    const res = await api.get('/api/templates/stats/popular');
    return res.data;
};

const fetchRecentTemplates = async () => {
    const res = await api.get('/api/templates/stats/recent');
    return res.data;
};

const fetchRootCategories = async () => {
    const res = await api.get('/api/categories/');
    return res.data.filter((c: any) => !c.parent_id);
};

const fetchAllCategories = async () => {
    const res = await api.get('/api/categories/');
    return res.data;
};

export function DashboardTemplates() {
    const { data: user } = useUser();
    const router = useRouter();
    const isAuthenticated = !!user;

    const { data: popularTemplates = [], isLoading: isPopularLoading } = useQuery({
        queryKey: ['templates', 'popular'],
        queryFn: fetchPopularTemplates,
    });

    const { data: recentTemplates = [] } = useQuery({
        queryKey: ['templates', 'recent'],
        queryFn: fetchRecentTemplates,
        enabled: isAuthenticated,
    });

    const { data: rootCategories = [] } = useQuery({
        queryKey: ['categories', 'root'],
        queryFn: fetchRootCategories,
    });

    const { data: allCategories = [] } = useQuery({
        queryKey: ['categories', 'all'],
        queryFn: fetchAllCategories,
    });

    // Create category lookup map
    const categoryMap = React.useMemo(() => {
        const map: Record<string, any> = {};
        allCategories.forEach((c: any) => {
            map[c.id] = c;
        });
        return map;
    }, [allCategories]);

    // Enrich templates with category object
    const enrichedPopularTemplates = React.useMemo(() =>
        popularTemplates.map((t: any) => ({ ...t, category: categoryMap[t.category_id] || null })),
        [popularTemplates, categoryMap]
    );

    const enrichedRecentTemplates = React.useMemo(() =>
        recentTemplates.map((t: any) => ({ ...t, category: categoryMap[t.category_id] || null })),
        [recentTemplates, categoryMap]
    );

    return (
        <div className="space-y-10 mb-8">
            {/* A. Welcome Message (Authenticated Users Only) */}
            {isAuthenticated && user && (
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user.name || user.email?.split('@')[0]}! 👋
                    </h1>
                    <p className="text-gray-600 mt-1">오늘도 생산적인 하루 되세요.</p>
                </section>
            )}

            {/* A. Recent Templates (Authenticated Users with History) */}
            {isAuthenticated && enrichedRecentTemplates.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">🕒 Jump back in</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {enrichedRecentTemplates.map((template: any) => (
                            <TemplateCard key={template.id} template={template} className="h-full" />
                        ))}
                    </div>
                </section>
            )}

            {/* B. Popular Templates */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-bold text-gray-900">🔥 Trending Now</h2>
                    </div>
                    <button
                        onClick={() => router.push('/templates')}
                        className="text-sm text-gray-500 hover:text-blue-600 font-medium"
                    >
                        전체보기
                    </button>
                </div>

                {isPopularLoading ? (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-100 rounded-xl animate-pulse h-48 break-inside-avoid mb-6" />
                        ))}
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                        {enrichedPopularTemplates.map((template: any) => (
                            <TemplateCard key={template.id} template={template} className="mb-6 break-inside-avoid" />
                        ))}
                    </div>
                )}
            </section>

            {/* C. Category Shortcuts */}
            {rootCategories.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4">📂 Explore by Category</h2>
                    <CategoryGrid
                        categories={rootCategories}
                        navigateOnClick={true}
                    />
                </section>
            )}
        </div>
    );
}
