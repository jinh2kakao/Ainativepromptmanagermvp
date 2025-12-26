
export interface Team {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
    updated_at: string;
    member_count?: number; // Optional, if backend sends it
    members?: TeamMember[];
}

export interface TeamMember {
    team_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    joined_at: string;
    user_name?: string;
    user_email?: string;
    user?: {
        name: string;
        email: string;
    }
}

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface TeamCreate {
    name: string;
}

export interface MemberAdd {
    email: string;
    role: 'admin' | 'editor' | 'viewer';
}
