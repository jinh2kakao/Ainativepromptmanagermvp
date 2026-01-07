
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/utils/axios';
import { Search, Loader2, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useJobCategories } from '@/hooks/useJobCategories';

interface PromptTemplate {
    id: string;
    title: string | null;
    name: string;
    mode: string;
    category_id: string | null;
    description?: string;
    content: string;
}

interface TemplateSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (templateId: string) => void;
    categoryName?: string;
}

export function TemplateSelectorModal({ isOpen, onClose, onSelect, categoryName }: TemplateSelectorModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Category Filtering State
    const { data: parentCategories = [] } = useJobCategories();
    const [selectedParentId, setSelectedParentId] = useState<string>('');
    const [selectedChildId, setSelectedChildId] = useState<string>('');

    // Derived Child Categories
    const childCategories = useMemo(() => {
        if (!selectedParentId) return [];
        const parent = parentCategories.find(p => p.id === selectedParentId);
        return parent?.subCategories || [];
    }, [parentCategories, selectedParentId]);

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
        }
    }, [isOpen]); // Reload when opened

    // Debounce search and filter updates
    useEffect(() => {
        const timer = setTimeout(() => {
            if (isOpen) fetchTemplates();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedParentId, selectedChildId]);

    // Reset Child selection when Parent changes
    const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedParentId(e.target.value);
        setSelectedChildId('');
    };

    const fetchTemplates = async () => {
        try {
            setIsLoading(true);
            const params: any = { limit: 100 };
            if (searchTerm) params.search = searchTerm;

            // Prioritize specific child category, fallback to parent (backend handles children inclusion)
            if (selectedChildId) {
                params.category_id = selectedChildId;
            } else if (selectedParentId) {
                params.category_id = selectedParentId;
            }

            const response = await api.get('/api/admin/templates', { params });
            // Sort: Already linked (but here we are selecting for linking, so maybe just default sort)
            setTemplates(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>템플릿 연결 - {categoryName}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    {/* Filters */}
                    <div className="flex gap-3">
                        <select
                            value={selectedParentId}
                            onChange={handleParentChange}
                            className="flex-1 px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">대분류 전체</option>
                            {parentCategories.map(p => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                        </select>
                        <select
                            value={selectedChildId}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                            disabled={!selectedParentId || childCategories.length === 0}
                            className="flex-1 px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <option value="">소분류 전체</option>
                            {childCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            placeholder="템플릿 이름 또는 내용 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-hidden mt-4 border rounded-md bg-white">
                    <ScrollArea className="h-full">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                검색 조건에 맞는 템플릿이 없습니다.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {templates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="p-4 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                                        onClick={() => onSelect(template.id)}
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-gray-900 truncate">
                                                    {template.title || template.name}
                                                </span>
                                                {template.mode === 'assistance' && (
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Assistance</Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 line-clamp-2">
                                                {template.description || template.content.slice(0, 100)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            {template.category_id ? (
                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium whitespace-nowrap">
                                                    다른 카테고리
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full whitespace-nowrap group-hover:bg-blue-100 group-hover:text-blue-700">
                                                    미연결
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                <div className="p-2 text-xs text-center text-gray-400 mt-2">
                    총 {templates.length}개의 템플릿 검색됨
                </div>
            </DialogContent>
        </Dialog>
    );
}
