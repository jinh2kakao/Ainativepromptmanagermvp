import { Prompt } from './index';

export interface Project {
    id: string;
    title: string;
    description?: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
    team_id?: string;
    locked_by?: string;
    locked_at?: string;
    data?: any;
    nodes?: ProjectNode[];
}

export interface ProjectNode {
    id: string;
    project_id: string;
    prompt_id?: string;
    type: string; // 'prompt' | 'note' | ...
    position_x: number;
    position_y: number;
    data?: any;
    prompt?: Prompt;
}

export interface ProjectTemplate {
    id: string;
    name: string;
    description?: string;
    category_id?: string;
    content: any;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

export interface PromptTemplate {
    id: string;
    category_id?: string;
    mode: 'simple' | 'assistance';
    name: string;
    content: string;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}
