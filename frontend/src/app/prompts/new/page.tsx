'use client';

import { useRouter } from 'next/navigation';
import { PromptForm } from '@/components/ui-generated/PromptForm';
import { useCreatePrompt } from '@/features/prompts/usePromptHooks';

import { useAuthStore } from '@/features/auth/store';
import { useUser } from '@/features/auth/useUser';
import { UserType } from '@/types';

export default function NewPromptPage() {
    const router = useRouter();
    const createMutation = useCreatePrompt();
    const { user: authUser } = useAuthStore();
    const { data: userProfile } = useUser();

    // User Type (Mock for now)
    const userType: UserType = authUser ? 'free' : 'guest';
    const isAdmin = userProfile?.role === 'admin';

    const handleSave = (data: any) => {
        createMutation.mutate({
            title: data.title,
            content: data.content,
            mode: data.mode || 'simple',
            is_public: data.isPublic || false,
            category: data.category,
            sub_category: data.subCategory,
            structure: data.structure,
            variables: data.variables,
            applicable_agents: data.applicable_agents,
        }, {
            onSuccess: () => {
                router.push('/');
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                <PromptForm
                    onSave={handleSave}
                    onCancel={() => router.back()}
                    isSubmitting={createMutation.isPending}
                />
            </main>
        </div>
    );
}
