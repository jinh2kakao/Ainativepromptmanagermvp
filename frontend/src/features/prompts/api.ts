import { api } from '@/utils/axios';
import { Prompt } from '@/types';

// Types (should ideally be shared or imported from a types file, but defining here for now based on backend models)
// Assuming Prompt type is already defined in @/types or we need to define it.
// Let's check @/types first or define interfaces here.

export interface PromptCreate {
    title: string;
    mode: 'simple' | 'assistance';
    content?: string;
    category?: string;
    sub_category?: string;
    is_public?: boolean;
    structure?: any;
    variables?: string[];
}

export interface PromptUpdate {
    title?: string;
    content?: string;
    category?: string;
    sub_category?: string;
    is_public?: boolean;
    structure?: any;
    variables?: string[];
}

export const getPrompts = async (): Promise<Prompt[]> => {
    const response = await api.get('/api/prompts/');
    return response.data;
};

export const getPrompt = async (id: string): Promise<Prompt> => {
    const response = await api.get(`/api/prompts/${id}`);
    return response.data;
};

export const createPrompt = async (data: PromptCreate): Promise<Prompt> => {
    const response = await api.post('/api/prompts/', data);
    return response.data;
};

export const updatePrompt = async (id: string, data: PromptUpdate): Promise<Prompt> => {
    const response = await api.patch(`/api/prompts/${id}`, data);
    return response.data;
};

export const deletePrompt = async (id: string): Promise<void> => {
    await api.delete(`/api/prompts/${id}`);
};
