'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PromptForm } from '@/components/ui-generated/PromptForm';
import { usePrompt, useUpdatePrompt } from '@/features/prompts/usePromptHooks';
import { useAuthStore } from '@/features/auth/store';
import { useUser } from '@/features/auth/useUser';
import { UserType } from '@/types';

import { PromptFormSkeleton } from '@/components/ui-generated/PromptFormSkeleton';

function EditPromptContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const { data: prompt, isLoading, error } = usePrompt(id || '');
    const updateMutation = useUpdatePrompt();
    const { user: authUser } = useAuthStore();
    const { data: userProfile } = useUser();

    // User Type
    const userType: UserType = authUser ? 'free' : 'guest';
    const isAdmin = userProfile?.role === 'admin';

    if (!id) return <div className="p-4 text-center">Invalid Prompt ID</div>;
    if (isLoading) return <PromptFormSkeleton />;
    if (error) return <div className="p-4 text-center text-red-500">Error: {(error as Error).message}</div>;
    if (!prompt) return <div className="p-4 text-center">Prompt not found</div>;

    const handleSave = (data: any) => {
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
                applicable_agents: data.applicable_agents,
            }
        }, {
            onSuccess: () => {
                router.push(`/prompts/view?id=${prompt.id}`);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <PromptForm
                    prompt={prompt}
                    onSave={handleSave}
                    onCancel={() => router.back()}
                    isSubmitting={updateMutation.isPending}
                />
            </main>
        </div>
    );
}

export default function EditPromptPage() {
    return (
        <Suspense fallback={<PromptFormSkeleton />}>
            <EditPromptContent />
        </Suspense>
    );
}
