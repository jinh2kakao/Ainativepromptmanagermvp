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
    applicable_agents?: string[];
}

export interface PromptUpdate {
    title?: string;
    mode?: 'simple' | 'assistance';
    content?: string;
    category?: string;
    sub_category?: string;
    is_public?: boolean;
    structure?: any;
    variables?: string[];
    applicable_agents?: string[];
}

// Helper to map backend snake_case to frontend camelCase
const mapToPrompt = (data: any): Prompt => {
    return {
        id: data.id,
        title: data.title,
        mode: data.mode,
        content: data.content || '',
        category: data.category,
        subCategory: data.sub_category,
        isPublic: data.is_public,
        ownerId: data.owner_id,
        structure: data.structure,
        variables: data.variables || [],
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
        latest_score: data.latest_score,
        applicableAgents: data.applicable_agents || [],
    };
};

export const getPrompts = async (): Promise<Prompt[]> => {
    const response = await api.get('/api/prompts/');
    return response.data.map(mapToPrompt);
};

export const getPrompt = async (id: string): Promise<Prompt> => {
    const response = await api.get(`/api/prompts/${id}`);
    return mapToPrompt(response.data);
};

export const createPrompt = async (data: PromptCreate): Promise<Prompt> => {
    const response = await api.post('/api/prompts/', data);
    return mapToPrompt(response.data);
};

export const updatePrompt = async (id: string, data: PromptUpdate): Promise<Prompt> => {
    const response = await api.patch(`/api/prompts/${id}`, data);
    return mapToPrompt(response.data);
};

export const deletePrompt = async (id: string): Promise<void> => {
    await api.delete(`/api/prompts/${id}`);
};

export const optimizePrompt = async (id: string): Promise<{ status: string, evaluation: any }> => {
    const response = await api.post(`/api/prompts/${id}/optimize`);
    return response.data;
};

export const fetchPromptAnalysis = async (id: string): Promise<{ status: string, evaluation: any, optimization: any }> => {
    const response = await api.get(`/api/prompts/${id}/analysis`);
    return response.data;
};

export const evaluatePrompt = async (id: string): Promise<{ status: string, evaluation: any, score: number }> => {
    const response = await api.post(`/api/prompts/${id}/evaluate`);
    return response.data;
};
