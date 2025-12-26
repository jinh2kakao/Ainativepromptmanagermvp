'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { usePrompt, useDeletePrompt, useUpdatePrompt } from '@/features/prompts/usePromptHooks';
import { PromptDetailPage } from '@/components/ui-generated/PromptDetailPage';
import { PromptModal } from '@/components/ui-generated/PromptModal';

import { supabase } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

import { PromptDetailSkeleton } from '@/components/ui-generated/PromptDetailSkeleton';

export function PromptDetailClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id') as string;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const { data: prompt, isLoading, error } = usePrompt(id);
    const deleteMutation = useDeletePrompt();
    const updateMutation = useUpdatePrompt();

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUserId(user.id);
                } else {
                    // Check for Guest ID
                    let guestId = null;
                    try {
                        guestId = typeof window !== 'undefined' ? localStorage.getItem('guest_id') : null;
                    } catch (e) {
                        console.warn('LocalStorage access denied', e);
                    }
                    if (guestId) {
                        setCurrentUserId(guestId);
                    }
                }
            } catch (error) {
                console.error('Failed to get user or storage:', error);
            } finally {
                setIsAuthLoading(false);
            }
        };
        getUser();
    }, []);

    if (isLoading) return <PromptDetailSkeleton />;
    if (error) return <div className="p-4 text-center text-red-500">Error: {(error as Error).message}</div>;
    if (!prompt) return <div className="p-4 text-center">Prompt not found</div>;

    const handleBack = () => {
        router.back();
    };

    const handleEdit = (p: any) => {
        router.push(`/prompts/edit?id=${prompt.id}`);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id, {
            onSuccess: () => {
                router.push('/');
            }
        });
    };

    const handleRun = (p: any) => {
        // TODO: Implement run functionality
        console.log('Run', p);
    };

    const handleTogglePublic = (id: string, isPublic: boolean) => {
        updateMutation.mutate({ id, data: { is_public: isPublic } });
    };

    const handleSave = async (data: any) => {
        updateMutation.mutate({
            id: prompt.id,
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
        setIsEditModalOpen(false);
    };

    const handleUpdateContent = async (newContent: string, applicableAgents?: string[]) => {
        const payload: any = { content: newContent };
        if (applicableAgents) {
            payload.applicable_agents = applicableAgents;
        }
        await updateMutation.mutateAsync({
            id: prompt.id,
            data: payload
        });
    };

    return (
        <>
            <PromptDetailPage
                prompt={prompt}
                currentUserId={currentUserId}
                onBack={handleBack}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRun={handleRun}
                onTogglePublic={handleTogglePublic}
                isDeleting={deleteMutation.isPending}
                isUpdating={updateMutation.isPending}
                onUpdateContent={handleUpdateContent}
            />
            {/* {isEditModalOpen && (
                <PromptModal
                    prompt={prompt}
                    onSave={handleSave}
                    onClose={() => setIsEditModalOpen(false)}
                />
            )} */}
        </>
    );
}
