import { useState, useEffect, useMemo } from 'react';
import { api } from '@/utils/axios';
import { getPrompts } from '@/features/prompts/api';
import { Search, X, FileText, ChevronRight } from 'lucide-react';
import { Prompt } from '@/types';

interface PromptSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (prompt: Prompt) => void;
}

interface Category {
    id: string;
    name: string;
    value: string;
    parent_id?: string | null;
}

export default function PromptSelectionModal({ isOpen, onClose, onSelect }: PromptSelectionModalProps) {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [promptsData, categoriesRes] = await Promise.all([
                getPrompts(),
                api.get('/api/categories/'), // Use public endpoint
            ]);
            console.log('Prompts fetched:', promptsData);
            console.log('Categories fetched:', categoriesRes.data);
            setPrompts(promptsData);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPrompts = prompts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.content?.toLowerCase().includes(searchTerm.toLowerCase());

        // Fix: Compare category name, not ID, and handle sub-categories
        const selectedCategoryObj = categories.find(c => c.id === selectedCategory);
        let matchesCategory = true;

        if (selectedCategory && selectedCategoryObj) {
            if (selectedCategoryObj.parent_id) {
                // It's a sub-category
                matchesCategory = p.subCategory === selectedCategoryObj.name || p.subCategory === selectedCategoryObj.value;
            } else {
                // It's a main category
                matchesCategory = p.category === selectedCategoryObj.name || p.category === selectedCategoryObj.value;
            }
        }

        return matchesSearch && matchesCategory;
    });

    // Calculate counts
    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        prompts.forEach(p => {
            // Count for main category
            if (p.category) {
                const mainCat = categories.find(c => c.name === p.category || c.value === p.category);
                if (mainCat) {
                    counts[mainCat.id] = (counts[mainCat.id] || 0) + 1;
                }
            }
            // Count for sub category
            if (p.subCategory) {
                const subCat = categories.find(c => c.name === p.subCategory || c.value === p.subCategory);
                if (subCat) {
                    counts[subCat.id] = (counts[subCat.id] || 0) + 1;
                }
            }
        });
        return counts;
    }, [prompts, categories]);

    // Group categories for sidebar
    // Only show root categories that have prompts or have children with prompts
    const rootCategories = categories.filter(c => {
        if (c.parent_id) return false;
        const hasDirectPrompts = (categoryCounts[c.id] || 0) > 0;
        const hasChildPrompts = categories.some(child => child.parent_id === c.id && (categoryCounts[child.id] || 0) > 0);
        return hasDirectPrompts || hasChildPrompts;
    });

    const getSubCategories = (parentId: string) => categories.filter(c => c.parent_id === parentId && (categoryCounts[c.id] || 0) > 0);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Select Prompt</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Sidebar - Categories */}
                    <div className="w-full md:w-64 h-48 md:h-auto border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto bg-gray-50 p-4 shrink-0">
                        <div className="space-y-1">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${selectedCategory === '' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <span>All Prompts</span>
                                <span className="text-xs bg-white/50 px-1.5 py-0.5 rounded-full">{prompts.length}</span>
                            </button>
                            {rootCategories.map(root => (
                                <div key={root.id} className="pt-2">
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between items-center">
                                        <span>{root.name}</span>
                                        {(categoryCounts[root.id] || 0) > 0 && (
                                            <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">
                                                {categoryCounts[root.id]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1 space-y-0.5">
                                        {getSubCategories(root.id).map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => setSelectedCategory(sub.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${selectedCategory === sub.id
                                                    ? 'bg-white shadow-sm text-blue-600 ring-1 ring-gray-200'
                                                    : 'text-gray-600 hover:bg-gray-200/50'
                                                    }`}
                                            >
                                                <span className="truncate">{sub.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                                        {categoryCounts[sub.id]}
                                                    </span>
                                                    {selectedCategory === sub.id && <ChevronRight className="w-3 h-3" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main - Prompt List */}
                    <div className="flex-1 flex flex-col bg-white">
                        <div className="p-4 border-b border-gray-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search prompts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                            ) : filteredPrompts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <FileText className="w-12 h-12 mb-2 opacity-20" />
                                    <p>No prompts found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredPrompts.map(prompt => (
                                        <button
                                            key={prompt.id}
                                            onClick={() => onSelect(prompt)}
                                            className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group"
                                        >
                                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1">
                                                {prompt.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 line-clamp-2">
                                                {prompt.content || 'No content'}
                                            </p>
                                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                                                <span className="bg-gray-100 px-2 py-1 rounded">
                                                    {prompt.mode === 'assistance' ? 'Assistance' : 'Simple'}
                                                </span>
                                                <span>Updated {new Date(prompt.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
