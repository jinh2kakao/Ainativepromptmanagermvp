'use client';

import { useRouter } from 'next/navigation';
import { usePrompts, useDeletePrompt } from './usePromptHooks';
import { PromptList } from '@/components/ui-generated/PromptList';
import { Prompt } from '@/types';
import { Loader2 } from 'lucide-react';

export default function PromptListContainer() {
    const router = useRouter();
    const { data: prompts, isLoading, error } = usePrompts();
    const deletePromptMutation = useDeletePrompt();

    const handleRun = (prompt: Prompt) => {
        // TODO: Implement run functionality
        console.log('Run prompt:', prompt);
    };

    const handleEdit = (prompt: Prompt) => {
        // TODO: Implement edit functionality
        console.log('Edit prompt:', prompt);
    };

    const handleDelete = (id: string) => {
        if (confirm('정말로 이 프롬프트를 삭제하시겠습니까?')) {
            deletePromptMutation.mutate(id);
        }
    };

    const handlePromptClick = (prompt: Prompt) => {
        router.push(`/prompts/${prompt.id}`);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                데이터를 불러오는 중 오류가 발생했습니다.
            </div>
        );
    }

    return (
        <PromptList
            prompts={prompts || []}
            onRun={handleRun}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPromptClick={handlePromptClick}
        />
    );
}
