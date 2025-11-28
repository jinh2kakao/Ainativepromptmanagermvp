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
    };
    asset: {
      knowledgeBase: string;
      styleGuide: string;
    };
    instruction: {
      task: string;
      context: string;
      constraints: string;
    };
    result: {
      format: string;
      example: string;
    };
  };
  variables: string[]; // Extracted {{variable}} names
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = 'list' | 'kanban';

export type JobType = 'general' | 'uiux-planning' | 'uiux-design' | 'dev-tech' | 'marketing' | 'video-creator';

export type UserType = 'guest' | 'free' | 'pro';
