import React from 'react';
import { LayoutList, Kanban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
    view: 'list' | 'kanban';
    onChange: (view: 'list' | 'kanban') => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
    return (
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            <button
                onClick={() => onChange('list')}
                className={cn(
                    "p-1.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
                    view === 'list'
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                )}
                title="List View"
                aria-label="Switch to list view"
            >
                <LayoutList className="w-4 h-4" />
            </button>
            <button
                onClick={() => onChange('kanban')}
                className={cn(
                    "p-1.5 rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
                    view === 'kanban'
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                )}
                title="Kanban View"
                aria-label="Switch to kanban view"
            >
                <Kanban className="w-4 h-4" />
            </button>
        </div>
    );
}
