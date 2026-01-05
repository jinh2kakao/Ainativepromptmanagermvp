'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { PromptForm } from '@/components/ui-generated/PromptForm';
import { useCreatePrompt } from '@/features/prompts/usePromptHooks';

import { useAuthStore } from '@/features/auth/store';
import { useUser } from '@/features/auth/useUser';
import { UserType } from '@/types';
import { api } from '@/utils/axios';
import { jobCategories } from '@/utils/jobCategories';
import { Suspense } from 'react';
import { parsePairPrompt } from '@/utils/pairParser';

const fetchTemplate = async (id: string) => {
    const res = await api.get(`/api/templates/${id}`);
    return res.data;
};

function NewPromptContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('templateId');

    const createMutation = useCreatePrompt();
    const { user: authUser } = useAuthStore();
    const { data: userProfile } = useUser();

    // User Type (Mock for now)
    const userType: UserType = authUser ? 'free' : 'guest';
    const isAdmin = userProfile?.role === 'admin';

    // Fetch Template if ID exists
    const { data: template, isLoading: isTemplateLoading } = useQuery({
        queryKey: ['template', templateId],
        queryFn: () => fetchTemplate(templateId!),
        enabled: !!templateId,
    });

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

    if (templateId && isTemplateLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading template...</div>;
    }

    // specific initialPrompt construction
    let initialPrompt = null;
    if (template) {
        // Map Category
        let category = '';
        let subCategory = '';
        const tCatValue = template.category?.value;

        if (tCatValue) {
            // Find in jobCategories
            for (const cat of jobCategories) {
                if (cat.value === tCatValue) {
                    category = cat.value;
                    break;
                }
                if (cat.subCategories) {
                    const sub = cat.subCategories.find((s: any) => s.value === tCatValue);
                    if (sub) {
                        category = cat.value;
                        subCategory = sub.value;
                        break;
                    }
                }
            }
        }

        initialPrompt = {
            title: template.title || template.name, // Use template title
            mode: template.mode,
            content: template.content,
            structure: template.mode === 'assistance' && template.content ? parsePairPrompt(template.content) : undefined,
            category,
            subCategory,
            applicableAgents: template.applicable_agents || [], // template uses snake_case in backend, but frontend expects camelCase?
            // Backend `PromptTemplateRead` has `applicable_agents` (snake).
            // Frontend `Prompt` interface likely Camel.
            // `PromptForm` uses `prompt?.applicableAgents`.
            isPublic: false,
        };
    }

    return (
        <main>
            {/* Key ensures re-mount if template loads */}
            <PromptForm
                key={templateId || 'new'}
                prompt={initialPrompt as any} // Cast to compat
                onSave={handleSave}
                onCancel={() => router.back()}
                isSubmitting={createMutation.isPending}
            />
        </main>
    );
}

export default function NewPromptPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<div>Loading...</div>}>
                <NewPromptContent />
            </Suspense>
        </div>
    );
}
