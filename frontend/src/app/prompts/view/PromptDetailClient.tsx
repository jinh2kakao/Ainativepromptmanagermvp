'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { usePrompt, useDeletePrompt, useUpdatePrompt } from '@/features/prompts/usePromptHooks';
import { PromptDetailPage } from '@/components/ui-generated/PromptDetailPage';

import { supabase } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export function PromptDetailClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get('id') as string;
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const { data: prompt, isLoading, error } = usePrompt(id);
    const deleteMutation = useDeletePrompt();
    const updateMutation = useUpdatePrompt();

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setCurrentUserId(user.id);
                }
            } finally {
                setIsAuthLoading(false);
            }
        };
        getUser();
    }, []);

    if (isLoading || isAuthLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (error) return <div className="p-4 text-center text-red-500">Error: {(error as Error).message}</div>;
    if (!prompt) return <div className="p-4 text-center">Prompt not found</div>;

    const handleBack = () => {
        router.back();
    };

    const handleEdit = (p: any) => {
        // TODO: Implement edit navigation or modal
        alert('Edit functionality to be implemented');
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

    return (
        <PromptDetailPage
            prompt={prompt}
            currentUserId={currentUserId}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRun={handleRun}
            onTogglePublic={handleTogglePublic}
        />
    );
}
