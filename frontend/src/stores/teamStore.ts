
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TeamStore {
    currentTeamId: string | null; // null = Personal Workspace
    setCurrentTeamId: (id: string | null) => void;
}

export const useTeamStore = create<TeamStore>()(
    persist(
        (set) => ({
            currentTeamId: null,
            setCurrentTeamId: (id) => set({ currentTeamId: id }),
        }),
        {
            name: 'team-storage', // key in localStorage
        }
    )
);
