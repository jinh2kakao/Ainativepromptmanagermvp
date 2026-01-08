export interface Prompt {
  id: string;
  title: string;
  mode: 'simple' | 'assistance';
  content: string; // Assembled markdown (for execution)
  category?: string; // Main category for Kanban view
  subCategory?: string; // Sub category
  isPublic: boolean; // Public/Private visibility
  ownerId?: string; // Owner user ID (for access control)
  structure?: { // For assistance mode (for editing)
    job: string; // This will now store subCategory value
    persona: {
      profile: string;
      intent: string;
      [key: string]: string;
    };
    asset: {
      knowledgeBase: string;
      styleGuide: string;
      [key: string]: string;
    };
    instruction: {
      task: string;
      context: string;
      constraints: string;
      [key: string]: string;
    };
    result: {
      format: string;
      example: string;
      [key: string]: string;
    };
  };
  variables: string[]; // Extracted {{variable}} names
  createdAt: number;
  updatedAt: number;
  latest_score?: number; // Added from PRD v2.1.0
  applicableAgents?: string[]; // Added in Selectable Input task
}

export type ViewMode = 'list' | 'kanban';

export type JobType = 'general' | 'uiux-planning' | 'uiux-design' | 'dev-tech' | 'marketing' | 'video-creator';

export type UserType = 'guest' | 'free' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name?: string;
  user_type: UserType;
  role: 'user' | 'admin';
  is_active: boolean;
  terms_agreed?: boolean; // Added for Agreement Flow
  created_at: string;
  updated_at: string;
}

// AI Agent Interface
export interface AiAgent {
  id: string;
  name: string;
  group: string;
  is_active: boolean;
  sort_order: number;
}


// Community Types
export interface Notice {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author_id: string;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type InquiryStatus = 'PENDING' | 'ANSWERED' | 'CLOSED';

export interface Inquiry {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string; // Added category
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
  comments?: InquiryComment[];
  user_email?: string; // Admin view only
  user_name?: string; // Admin view only
}

export interface InquiryComment {
  id: string;
  inquiry_id: string;
  author_id: string;
  content: string;
  is_staff_reply: boolean;
  created_at: string;
}
