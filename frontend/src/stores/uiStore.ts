import { create } from 'zustand';

export type ViewMode = 'list' | 'kanban';

interface UIState {
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    viewMode: ViewMode;
    toggleSidebar: () => void;
    toggleMobileMenu: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setMobileMenuOpen: (open: boolean) => void;
    setViewMode: (mode: ViewMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarCollapsed: false,
    isMobileMenuOpen: false,
    viewMode: 'list',
    toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
    setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
    setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    setViewMode: (mode) => set({ viewMode: mode }),
}));
