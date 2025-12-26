import { Prompt, ViewMode } from '../types';

const STORAGE_KEYS = {
  PROMPTS: 'prompts',
  VIEW_MODE: 'viewMode',
  LAST_INPUT_MODE: 'lastInputMode',
  USER_TYPE: 'userType'
};

export const QUOTA_LIMITS = {
  GUEST: 10,
  FREE: Infinity,
  PRO: Infinity,
  ENTERPRISE: Infinity
};

export type UserType = 'guest' | 'free' | 'pro' | 'enterprise';

// Prompts
export function savePrompts(prompts: Prompt[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
    } catch (e) {
      console.warn('Failed to save prompts to localStorage:', e);
    }
  }
}

export function loadPrompts(): Prompt[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROMPTS);
    if (!data) return [];

    const prompts: Prompt[] = JSON.parse(data);

    // Migration: Add isPublic and ownerId to existing prompts
    const migratedPrompts = prompts.map((prompt) => ({
      ...prompt,
      isPublic: prompt.isPublic ?? false,
      ownerId: prompt.ownerId ?? 'user_guest_001'
    }));

    return migratedPrompts;
  } catch (e) {
    console.warn('Failed to load prompts from localStorage:', e);
    return [];
  }
}

// View Mode
export function saveViewMode(mode: ViewMode): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
    } catch (e) {
      console.warn('Failed to save viewMode:', e);
    }
  }
}

export function loadViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'list';
  try {
    return (localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode) || 'list';
  } catch (e) {
    return 'list';
  }
}

// Input Mode
export function saveLastInputMode(mode: 'simple' | 'assistance'): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_INPUT_MODE, mode);
    } catch (e) {
      console.warn('Failed to save lastInputMode:', e);
    }
  }
}

export function loadLastInputMode(): 'simple' | 'assistance' {
  if (typeof window === 'undefined') return 'simple';
  try {
    return (localStorage.getItem(STORAGE_KEYS.LAST_INPUT_MODE) as 'simple' | 'assistance') || 'simple';
  } catch (e) {
    return 'simple';
  }
}

// User Type
export function saveUserType(type: UserType): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_TYPE, type);
    } catch (e) {
      console.warn('Failed to save userType:', e);
    }
  }
}

export function loadUserType(): UserType {
  if (typeof window === 'undefined') return 'guest';
  try {
    return (localStorage.getItem(STORAGE_KEYS.USER_TYPE) as UserType) || 'guest';
  } catch (e) {
    return 'guest';
  }
}

// Quota management
export function getQuotaLimit(userType: UserType): number {
  return QUOTA_LIMITS[userType.toUpperCase() as keyof typeof QUOTA_LIMITS];
}

export function canCreatePrompt(currentCount: number, userType: UserType): boolean {
  return currentCount < getQuotaLimit(userType);
}

export function getQuotaWarning(currentCount: number, userType: UserType): string | null {
  const limit = getQuotaLimit(userType);

  if (userType === 'guest') {
    if (currentCount >= limit) {
      return `${limit}개 프롬프트 제한에 도달했습니다. 무료 회원가입하여 계속하세요.`;
    } else if (currentCount >= 7) {
      return `Guest 제한까지 ${limit - currentCount}개 남았습니다.`;
    }
  }

  // Free, Pro, Enterprise have infinite prompts
  return null;

  return null;
}
