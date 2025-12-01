import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPrompts, getPrompt, createPrompt, updatePrompt, deletePrompt, PromptCreate, PromptUpdate } from './api';
import { toast } from 'sonner';

export const usePrompts = () => {
    return useQuery({
        queryKey: ['prompts'],
        queryFn: getPrompts,
    });
};

export const usePrompt = (id: string) => {
    return useQuery({
        queryKey: ['prompts', id],
        queryFn: () => getPrompt(id),
        enabled: !!id,
    });
};

export const useCreatePrompt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PromptCreate) => createPrompt(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prompts'] });
            toast.success('프롬프트가 생성되었습니다.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || '프롬프트 생성 중 오류가 발생했습니다.');
        },
    });
};

export const useUpdatePrompt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: PromptUpdate }) => updatePrompt(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['prompts'] });
            queryClient.invalidateQueries({ queryKey: ['prompts', data.id] });
            toast.success('프롬프트가 수정되었습니다.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || '프롬프트 수정 중 오류가 발생했습니다.');
        },
    });
};

export const useDeletePrompt = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deletePrompt(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prompts'] });
            toast.success('프롬프트가 삭제되었습니다.');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || '프롬프트 삭제 중 오류가 발생했습니다.');
        },
    });
};
