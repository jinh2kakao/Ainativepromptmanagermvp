'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePrompt, useDeletePrompt, useUpdatePrompt } from '@/features/prompts/usePromptHooks';
import { PromptDetailPage } from '@/components/ui-generated/PromptDetailPage';

import { supabase } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function PromptDetail() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [currentUserId, setCurrentUserId] = useState<string>('');

    const { data: prompt, isLoading, error } = usePrompt(id);
    const deleteMutation = useDeletePrompt();
    const updateMutation = useUpdatePrompt();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
        };
        getUser();
    }, []);

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
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
