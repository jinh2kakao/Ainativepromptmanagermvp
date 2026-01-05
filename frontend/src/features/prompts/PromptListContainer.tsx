'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { usePrompts, useCreatePrompt, useUpdatePrompt, useDeletePrompt } from './usePromptHooks';
import { ViewMode, Prompt, UserType } from '@/types';
import { supabase } from '@/utils/supabase/client';
import { api } from '@/utils/axios';

// Figma UI 컴포넌트들
// import { Sidebar } from '@/components/ui-generated/Sidebar'; // Removed: Global Sidebar
import { PromptListView } from '@/components/ui-generated/PromptListView';
import { PromptListSkeleton } from '@/components/ui-generated/PromptListSkeleton';
import { PromptModal } from '@/components/ui-generated/PromptModal';
import { EmptyState } from '@/components/ui-generated/EmptyState';
import { PricingModal } from '@/components/ui-generated/PricingModal';
import { QuotaWarning } from '@/components/ui-generated/QuotaWarning';
import { SettingsPage } from '@/components/ui-generated/settings/SettingsPage';
import { useUser } from '@/features/auth/useUser';

import { useAuthStore } from '@/features/auth/store';
import { canCreatePrompt, getQuotaLimit, getQuotaWarning } from '@/utils/storage';
import { useAlert } from '@/components/providers/AlertProvider';
import { useUIStore } from '@/stores/uiStore';
import { ViewToggle } from '@/components/common/ViewToggle';
import { ProductTour, Step } from '@/components/tour/ProductTour';

interface CategoryOption {
    id: string;
    label: string;
    value: string;
    subCategories?: CategoryOption[];
}



const dashboardSteps: Step[] = [
    {
        targetId: 'tour-dashboard-create-btn',
        title: '첫 프롬프트 만들기',
        description: 'AI 프롬프트 매니저에 오신 멋진 시작입니다!\n이 버튼을 눌러 첫 번째 프롬프트를 만들어보세요.',
        position: 'top'
    }
];

export default function PromptListContainer() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { alert, confirm } = useAlert();
    const queryClient = useQueryClient();
    // 1. 데이터 관리
    const { data: prompts = [], isLoading, error } = usePrompts();
    const createMutation = useCreatePrompt();
    const updateMutation = useUpdatePrompt();
    const deleteMutation = useDeletePrompt();
    const { user: authUser, isInitialized } = useAuthStore();
    const { data: userProfile } = useUser();

    // 2. UI 상태 관리
    const { promptListView, setPromptListView } = useUIStore(); // Use promptListView instead of generic viewMode
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    // const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Removed: Global State

    // User Type
    const rawUserType = userProfile?.user_type || (authUser ? 'FREE' : 'GUEST');
    const userType: UserType = (rawUserType.toLowerCase() === 'enterprise' ? 'enterprise' : rawUserType.toLowerCase()) as UserType;
    const isAdmin = userProfile?.role === 'admin';

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/api/categories/');
                const rawCats = response.data;

                // Build Tree
                const roots = rawCats.filter((c: any) => !c.parent_id);
                const tree = roots.map((root: any) => {
                    const children = rawCats.filter((c: any) => c.parent_id === root.id);
                    return {
                        id: root.id,
                        label: root.name,
                        value: root.value,
                        subCategories: children.map((child: any) => ({
                            id: child.id,
                            label: child.name,
                            value: child.value
                        }))
                    };
                });
                setCategories(tree);
            } catch (error) {
                console.error('Failed to fetch categories', error);
            }
        };
        fetchCategories();
    }, []);

    // Sync View Mode from URL
    // Sync View Mode from URL
    useEffect(() => {
        const viewParam = searchParams.get('view');
        if (viewParam === 'list' || viewParam === 'kanban') {
            setPromptListView(viewParam);
        }
    }, [searchParams, setPromptListView]);

    // 3. 기능 구현
    const handleAuthAction = async () => {
        if (userType === 'guest') {
            router.push('/auth');
        } else {
            await supabase.auth.signOut();
            queryClient.clear(); // Clear all cache on logout
        }
    };

    const handleCreate = async () => {
        if (!canCreatePrompt(prompts.length, userType)) {
            if (userType === 'guest') {
                // Show Sign Up Toast/Alert
                if (await confirm('무료 회원가입하고 더 많은 프롬프트를 생성하세요!', '회원가입 필요')) {
                    router.push('/auth');
                }
            } else {
                // Show Pricing Modal
                setIsPricingModalOpen(true);
            }
            return;
        }
        router.push('/prompts/new');
    };

    const handleEdit = (prompt: Prompt) => {
        router.push(`/prompts/edit?id=${prompt.id}`);
    };

    const handleDelete = async (id: string) => {
        if (await confirm('정말로 삭제하시겠습니까?', '삭제 확인', { variant: 'destructive' })) {
            setDeletingId(id);
            deleteMutation.mutate(id, {
                onSettled: () => setDeletingId(null)
            });
        }
    };

    const handleSave = async (data: any) => {
        if (editingPrompt) {
            updateMutation.mutate({
                id: editingPrompt.id,
                data: {
                    title: data.title,
                    content: data.content,
                    mode: data.mode,
                    is_public: data.isPublic,
                    category: data.category,
                    sub_category: data.subCategory,
                    structure: data.structure,
                    variables: data.variables,
                }
            });
        } else {
            createMutation.mutate({
                title: data.title,
                content: data.content,
                mode: data.mode || 'simple',
                is_public: data.isPublic || false,
                category: data.category,
                sub_category: data.subCategory,
                structure: data.structure,
                variables: data.variables,
            });
        }
        setIsModalOpen(false);
    };

    // 4. 로딩 및 에러 처리
    // Auth initialization check ensures we don't show empty state before we know if user is logged in
    if (!isInitialized || isLoading) {
        return <PromptListSkeleton />;
    }

    if (error) return <div className="p-4 text-center text-red-500">Error: {(error as any).message}</div>;

    // Quota Logic
    const quotaLimit = getQuotaLimit(userType);
    const quotaWarning = getQuotaWarning(prompts.length, userType);
    const canCreate = canCreatePrompt(prompts.length, userType);

    // Settings Page Rendering
    if (isSettingsOpen) {
        return (
            <SettingsPage
                onBack={() => setIsSettingsOpen(false)}
                userEmail={authUser?.email || 'user@example.com'}
                userName={authUser?.user_metadata?.full_name || 'User'}
                userType={userType}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 1. Global Header (상단 네비게이션) */}
            {/* 1. Sidebar (Moved to ClientLayout) */}

            {/* 2. Main Content */}
            <main
                className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8"
            >

                {/* Quota Warning */}
                {quotaWarning && (
                    <div className="mb-6">
                        <QuotaWarning
                            message={quotaWarning}
                            severity={prompts.length >= quotaLimit ? 'error' : 'warning'}
                            onSignUp={userType === 'guest' ? handleAuthAction : undefined}
                        />
                    </div>
                )}

                {isLoading ? (
                    <PromptListSkeleton />
                ) : error ? (
                    <div className="p-4 text-center text-red-500">Error: {(error as any).message}</div>
                ) : prompts.length === 0 ? (
                    // 데이터 없을 때: Empty State
                    <EmptyState onCreateClick={handleCreate} />
                ) : (
                    // 데이터 있을 때: Page Header + List
                    <div className="space-y-6">

                        {/* Page Header 영역 */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Prompts</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {prompts.length} prompt{prompts.length !== 1 && 's'} saved
                                </p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <ViewToggle
                                    view={promptListView}
                                    onChange={setPromptListView}
                                />
                                <div className="relative w-full sm:w-auto">
                                    <Button
                                        id="tour-dashboard-create-btn"
                                        onClick={handleCreate}
                                        disabled={!canCreate}
                                        size="lg"
                                        className={`w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-200 border-0 ${canCreate
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        <Plus />
                                        New Prompt
                                    </Button>
                                    {!canCreate && (
                                        <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-full sm:w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-10 shadow-xl">
                                            <p>{quotaLimit}개 프롬프트 제한에 도달했습니다.</p>
                                            <button
                                                onClick={() => setIsPricingModalOpen(true)}
                                                className="mt-2 text-blue-300 hover:text-blue-200 underline"
                                            >
                                                업그레이드하여 무제한 사용하기
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 리스트 뷰 (검색창 + 카드 리스트) */}
                        <PromptListView
                            prompts={prompts}
                            categories={categories}
                            viewMode={promptListView} // Pass promptListView instead of viewMode
                            onPromptClick={(p) => router.push(`/prompts/view?id=${p.id}`)}
                            onRun={(p) => console.log('Run', p)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            deletingId={deletingId}
                        />
                    </div>
                )}
            </main>

            {/* 모달 - Removed PromptModal */}
            {/* {isModalOpen && (
                <PromptModal
                    prompt={editingPrompt}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )} */}

            {/* Pricing Modal */}
            {isPricingModalOpen && (
                <PricingModal
                    onClose={() => setIsPricingModalOpen(false)}
                    onUpgrade={async () => {
                        await alert('업그레이드 페이지로 이동합니다 (준비중)');
                        setIsPricingModalOpen(false);
                    }}
                />
            )}
            <ProductTour
                steps={dashboardSteps}
                storageKey="hasSeenDashboardTour"
                onFinish={() => router.push('/prompts/new')}
            />
        </div>
    );
}