'use client';

import { useState } from 'react';
// [수정] Prompt 타입 제거 (여기서 가져오지 않습니다)
import { usePrompts, useCreatePrompt, useDeletePrompt } from './usePromptHooks';
// [수정] Prompt 타입을 중앙 타입 정의(@/types)에서 가져옵니다.
import { ViewMode, Prompt } from '@/types';
import { supabase } from '@/utils/supabase/client';

// Figma UI 컴포넌트들
import { Header } from '@/components/ui-generated/Header';
import { PromptListView } from '@/components/ui-generated/PromptListView';
import { PromptModal } from '@/components/ui-generated/PromptModal';
import { EmptyState } from '@/components/ui-generated/EmptyState';

export default function PromptListContainer() {
    // 1. 데이터 관리 (React Query)
    const { data: prompts = [], isLoading, error } = usePrompts();
    const createMutation = useCreatePrompt();
    const deleteMutation = useDeletePrompt();

    // 2. UI 상태 관리
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Prompt 타입이 @/types로 통일되어 에러가 사라집니다.
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

    // 3. 기능 구현 (Handlers)

    // [추가] 로그아웃 기능 (Header와 연결)
    const handleLogout = async () => {
        await supabase.auth.signOut();
        // page.tsx가 감지하여 자동으로 로그인 화면으로 바뀝니다.
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
            });
        }
        setIsModalOpen(false);
    };

    // 4. 화면 렌더링
    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error: {error.message}</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* 상단 헤더 */}
            <Header
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                userType="free"
                promptCount={prompts.length}
                quotaLimit={10}
                // [중요] 여기에 로그아웃 함수를 연결합니다. 
                // (Header 컴포넌트 정의에 따라 onSignUp 대신 onLogout 등의 이름일 수 있습니다.)
                onSignUp={handleLogout}
                onOpenPricing={() => alert('가격 정책 준비 중')}
                onOpenSettings={() => alert('설정 준비 중')}
            />

            {/* 메인 콘텐츠 (중앙 정렬) */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {prompts.length === 0 ? (
                    <EmptyState onCreateClick={handleCreate} />
                ) : (
                    <PromptListView
                        prompts={prompts}
                        viewMode={viewMode}
                        onPromptClick={(p) => console.log('View', p)}
                        onRun={(p) => console.log('Run', p)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
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
        </div>
    );
}