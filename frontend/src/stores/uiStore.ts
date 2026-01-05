
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ViewMode = 'list' | 'kanban';

interface UIState {
    isSidebarCollapsed: boolean;
    isMobileMenuOpen: boolean;
    viewMode: ViewMode;
    promptListView: 'list' | 'kanban'; // Added promptListView state
    toggleSidebar: () => void;
    toggleMobileMenu: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setMobileMenuOpen: (open: boolean) => void;
    setViewMode: (mode: ViewMode) => void;
    setPromptListView: (view: 'list' | 'kanban') => void; // Added setPromptListView action
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isSidebarCollapsed: false,
            isMobileMenuOpen: false,
            viewMode: 'list',
            promptListView: 'list', // Initial state for promptListView
            toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
            toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
            setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
            setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
            setViewMode: (mode) => set({ viewMode: mode }),
            setPromptListView: (view) => set({ promptListView: view }), // Action for promptListView
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({
                isSidebarCollapsed: state.isSidebarCollapsed,
                promptListView: state.promptListView, // Persist promptListView
            }),
        }
    )
);
