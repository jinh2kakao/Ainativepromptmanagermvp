import { Prompt, ViewMode } from '../types';

const STORAGE_KEYS = {
  PROMPTS: 'prompts',
  VIEW_MODE: 'viewMode',
  LAST_INPUT_MODE: 'lastInputMode',
  USER_TYPE: 'userType'
};

export const QUOTA_LIMITS = {
  GUEST: 10,
  FREE: 50,
  PRO: Infinity
};

export type UserType = 'guest' | 'free' | 'pro';

// Prompts
export function savePrompts(prompts: Prompt[]): void {
  localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
}

export function loadPrompts(): Prompt[] {
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
}

// View Mode
export function saveViewMode(mode: ViewMode): void {
  localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
}

export function loadViewMode(): ViewMode {
  return (localStorage.getItem(STORAGE_KEYS.VIEW_MODE) as ViewMode) || 'list';
}

// Input Mode
export function saveLastInputMode(mode: 'simple' | 'assistance'): void {
  localStorage.setItem(STORAGE_KEYS.LAST_INPUT_MODE, mode);
}

export function loadLastInputMode(): 'simple' | 'assistance' {
  return (localStorage.getItem(STORAGE_KEYS.LAST_INPUT_MODE) as 'simple' | 'assistance') || 'simple';
}

// User Type
export function saveUserType(type: UserType): void {
  localStorage.setItem(STORAGE_KEYS.USER_TYPE, type);
}

export function loadUserType(): UserType {
  return (localStorage.getItem(STORAGE_KEYS.USER_TYPE) as UserType) || 'guest';
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
  
  if (userType === 'free') {
    if (currentCount >= limit) {
      return `${limit}개 프롬프트 제한에 도달했습니다. Pro로 업그레이드하여 무제한 사용하세요.`;
    } else if (currentCount >= 45) {
      return `Free 제한까지 ${limit - currentCount}개 남았습니다.`;
    }
  }
  
  return null;
}
