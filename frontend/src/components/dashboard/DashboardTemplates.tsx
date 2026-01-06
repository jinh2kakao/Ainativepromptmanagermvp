import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Clock, TrendingUp, Plus } from 'lucide-react';
import { api } from '@/utils/axios';
import { TemplateCard } from './TemplateCard';
import { useUser } from '@/features/auth/useUser';
import { CategoryGrid } from '@/components/common/CategoryGrid';
import { cn } from '@/lib/utils'; // Ensure cn is imported
import { Button } from '@/components/ui/button';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

// Helper for fetching popular templates with pagination
const fetchPopularTemplates = async ({ pageParam = 0 }) => {
    const res = await api.get('/api/templates/stats/popular', {
        params: {
            offset: pageParam,
            limit: 6
        }
    });
    return res.data;
};

const fetchRecentTemplates = async () => {
    const res = await api.get('/api/templates/stats/recent');
    // Ensure unique IDs just in case, though backend handles it mostly
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
    const { data: user, isLoading: isUserLoading } = useUser();
    const router = useRouter();
    // isAuthenticated is true if user exists. 
    // If !user and !isUserLoading, it means Guest.
    const isAuthenticated = !!user;

    // --- Trending Now (Infinite Scroll) ---
    const {
        data: popularData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isPopularLoading
    } = useInfiniteQuery({
        queryKey: ['templates', 'popular'],
        queryFn: fetchPopularTemplates,
        initialPageParam: 0,
        getNextPageParam: (lastPage, allPages) => {
            // Stop if we reached 30 items or if last page was empty/insufficient
            const totalFetched = allPages.flatMap(p => p).length;
            if (totalFetched >= 30 || lastPage.length < 6) {
                return undefined;
            }
            return totalFetched; // Return current count as next offset
        },
    });

    // Flatten popular templates
    const popularTemplates = React.useMemo(() => {
        return popularData?.pages.flatMap(page => page) || [];
    }, [popularData]);

    // Intersection Observer for Infinite Scroll
    const loadMoreRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [hasNextPage, fetchNextPage]);


    // --- Recent Templates ---
    const { data: recentTemplates = [] } = useQuery({
        queryKey: ['templates', 'recent'],
        queryFn: fetchRecentTemplates,
        enabled: isAuthenticated,
    });

    // --- Categories ---
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
    // Helper function
    const enrich = (templates: any[]) => templates.map((t: any) => ({
        ...t,
        category: categoryMap[t.category_id] || null
    }));

    const enrichedPopular = React.useMemo(() => enrich(popularTemplates), [popularTemplates, categoryMap]);
    const enrichedRecent = React.useMemo(() => enrich(recentTemplates), [recentTemplates, categoryMap]);

    const handleNewPrompt = () => {
        router.push('/prompts/new');
    };

    return (
        <div className="space-y-10 mb-8">
            {/* A. Welcome Message & CTA */}
            {/* Display for both Authenticated and Guest (once user loading finishes) */}
            {!isUserLoading && (
                <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isAuthenticated
                                ? `Welcome back, ${user?.name || user?.email?.split('@')[0]}! 👋`
                                : `Welcome, Guest! 👋`
                            }
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isAuthenticated
                                ? "오늘도 생산적인 하루 되세요."
                                : "AI 네이티브 프롬프트 매니저에 오신 것을 환영합니다."
                            }
                        </p>
                    </div>
                    <Button
                        onClick={handleNewPrompt}
                        className="shrink-0 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 h-[42px]" // Explicit height/padding for button consistency
                    >
                        <Plus className="w-4 h-4" />
                        NEW POOMPT
                    </Button>
                </section>
            )}

            {/* B. Recent Templates (Authenticated Users with History) */}
            {isAuthenticated && enrichedRecent.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-bold text-gray-900">🕒 Jump back in</h2>
                    </div>

                    <ResponsiveMasonry
                        columnsCountBreakPoints={{ 350: 1, 750: 2, 1024: 4 }}
                    >
                        <Masonry gutter="1rem">
                            {enrichedRecent.map((template: any) => (
                                <TemplateCard key={template.id} template={template} className="mb-4" />
                            ))}
                        </Masonry>
                    </ResponsiveMasonry>

                </section>
            )}

            {/* C. Popular Templates */}
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

                {/* Popular Grid (Masonry) */}
                <ResponsiveMasonry
                    columnsCountBreakPoints={{ 350: 1, 768: 2, 1024: 3, 1280: 4 }}
                >
                    <Masonry gutter="1.5rem">
                        {enrichedPopular.map((template: any) => (
                            <TemplateCard key={template.id} template={template} className="mb-6" />
                        ))}

                        {/* Skeleton Loading for Next Page - Inside Masonry? mixing elements is tricky. 
                             Masonry expects children to be items. 
                             If we render skeletons as children, they will flow too. 
                         */}
                        {(isPopularLoading || isFetchingNextPage) && (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={`loading-${i}`} className="bg-gray-100 rounded-xl animate-pulse h-48 mb-6" />
                            ))
                        )}
                    </Masonry>
                </ResponsiveMasonry>

                {/* Infinite Scroll Trigger */}
                <div ref={loadMoreRef} className="h-4 w-full" />
            </section>

            {/* D. Category Shortcuts */}
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
