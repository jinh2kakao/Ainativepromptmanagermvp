'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react'; // [추가] 아이콘 임포트
import { usePrompts, useCreatePrompt, useDeletePrompt } from './usePromptHooks';
import { ViewMode, Prompt } from '@/types';
import { supabase } from '@/utils/supabase/client';

// Figma UI 컴포넌트들
import { Header } from '@/components/ui-generated/Header';
import { PromptListView } from '@/components/ui-generated/PromptListView';
import { PromptModal } from '@/components/ui-generated/PromptModal';
import { EmptyState } from '@/components/ui-generated/EmptyState';
import { PricingModal } from '@/components/ui-generated/PricingModal';
import { SettingsPage } from '@/components/ui-generated/settings/SettingsPage';
import { useAuthStore } from '@/features/auth/store';

export default function PromptListContainer() {
    const router = useRouter();
    // 1. 데이터 관리
    const { data: prompts = [], isLoading, error } = usePrompts();
    const createMutation = useCreatePrompt();
    const deleteMutation = useDeletePrompt();
    const { user } = useAuthStore();

    // 2. UI 상태 관리
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

    // 3. 기능 구현
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const handleCreate = () => {
        setEditingPrompt(null);
        setIsModalOpen(true);
    };

    const handleEdit = (prompt: Prompt) => {
        setEditingPrompt(prompt);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('정말로 삭제하시겠습니까?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSave = async (data: any) => {
        if (editingPrompt) {
            alert("수정 기능 준비 중");
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
    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;

    // Settings Page Rendering
    if (isSettingsOpen) {
        return (
            <SettingsPage
                onBack={() => setIsSettingsOpen(false)}
                userEmail={user?.email || 'user@example.com'}
                userName={user?.user_metadata?.full_name || 'User'}
                userType="free"
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 1. Global Header (상단 네비게이션) */}
            <Header
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                userType="free"
                promptCount={prompts.length}
                quotaLimit={10}
                onSignUp={handleLogout}
                onOpenPricing={() => setIsPricingModalOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
            />

            {/* 2. Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {prompts.length === 0 ? (
                    // 데이터 없을 때: Empty State
                    <EmptyState onCreateClick={handleCreate} />
                ) : (
                    // 데이터 있을 때: Page Header + List
                    <div className="space-y-6">

                        {/* [추가됨] Figma 디자인의 Page Header 영역 */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">My Prompts</h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    {prompts.length} prompt{prompts.length !== 1 && 's'} saved
                                </p>
                            </div>
                            <button
                                onClick={handleCreate}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                New Prompt
                            </button>
                        </div>

                        {/* 리스트 뷰 (검색창 + 카드 리스트) */}
                        <PromptListView
                            prompts={prompts}
                            viewMode={viewMode}
                            onPromptClick={(p) => router.push(`/prompts/view?id=${p.id}`)}
                            onRun={(p) => console.log('Run', p)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    </div>
                )}
            </main>

            {/* 모달 */}
            {isModalOpen && (
                <PromptModal
                    prompt={editingPrompt}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
                />
            )}

            {/* Pricing Modal */}
            {isPricingModalOpen && (
                <PricingModal
                    onClose={() => setIsPricingModalOpen(false)}
                    onUpgrade={() => {
                        alert('업그레이드 페이지로 이동합니다 (준비중)');
                        setIsPricingModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}