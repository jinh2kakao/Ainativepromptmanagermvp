
import { useQuery } from '@tanstack/react-query';
import { api } from '@/utils/axios';

export interface CategoryOption {
    value: string;
    label: string;
    subCategories?: CategoryOption[];
}

export function useJobCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get('/api/categories/');
            const allCategories = response.data;

            // Transform flat list to hierarchy
            const parents = allCategories
                .filter((c: any) => !c.parent_id)
                .sort((a: any, b: any) => a.order - b.order);

            return parents.map((parent: any) => {
                const children = allCategories
                    .filter((c: any) => c.parent_id === parent.id)
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((child: any) => ({
                        value: child.value,
                        label: child.name // or child.value, depending on usage
                    }));

                return {
                    value: parent.value,
                    label: parent.name,
                    subCategories: children
                };
            }) as CategoryOption[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
