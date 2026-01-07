
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';

export interface CategoryOption {
    id?: string;
    value: string;
    label: string;
    icon?: string;
    description?: string;
    subCategories?: CategoryOption[];
}

export function useJobCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            try {
                const response = await api.get('/api/categories/');
                const allCategories = response.data;
                console.log('[useJobCategories] Raw categories:', allCategories);

                // Transform flat list to hierarchy
                const parents = allCategories
                    .filter((c: any) => !c.parent_id || c.parent_id === null)
                    .sort((a: any, b: any) => a.order - b.order);

                return parents.map((parent: any) => {
                    const children = allCategories
                        .filter((c: any) => c.parent_id === parent.id)
                        .sort((a: any, b: any) => a.order - b.order)
                        .map((child: any) => ({
                            value: child.value,
                            label: child.name || child.value || 'Unnamed Sub',
                            id: child.id,
                            icon: child.icon,
                            description: child.description
                        }));

                    return {
                        value: parent.value,
                        label: parent.name || parent.value || 'Unnamed Category',
                        id: parent.id,
                        icon: parent.icon,
                        description: parent.description,
                        subCategories: children
                    };
                }) as CategoryOption[];
            } catch (error) {
                console.error('[useJobCategories] Error fetching categories:', error);
                return [];
            }
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
