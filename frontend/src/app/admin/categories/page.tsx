'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/axios';
import { FolderTree, Plus, Edit2, Trash2, ChevronRight, ChevronDown, Link as LinkIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { TemplateSelectorModal } from '@/components/admin/TemplateSelectorModal';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Category {
    id: string;
    parent_id: string | null;
    name: string;
    value: string;
    order: number;
    icon?: string;
    description?: string;
    config_json?: any;
    children?: Category[];
}

interface LinkedTemplate {
    id: string;
    title: string | null;
    name: string;
}

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Linked Templates State
    const [linkedTemplates, setLinkedTemplates] = useState<LinkedTemplate[]>([]);
    const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

    // Unlink Alert State
    const [isUnlinkAlertOpen, setIsUnlinkAlertOpen] = useState(false);
    const [unlinkTemplateId, setUnlinkTemplateId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        value: '',
        parent_id: '',
        order: 0,
        icon: '',
        description: '',
        config_json: '{}'
    });

    // Helper to build tree structure
    const buildCategoryTree = (flatCategories: Category[]): Category[] => {
        const categoryMap = new Map<string, Category>();
        // Clone objects to avoid mutation issues and init children
        flatCategories.forEach(cat => categoryMap.set(cat.id, { ...cat, children: [] }));

        const rootCategories: Category[] = [];

        // Sort by order
        const sortedCategories = [...flatCategories].sort((a, b) => a.order - b.order);

        sortedCategories.forEach(cat => {
            const categoryWithChildren = categoryMap.get(cat.id)!;
            if (cat.parent_id) {
                const parent = categoryMap.get(cat.parent_id);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(categoryWithChildren);
                }
            } else {
                rootCategories.push(categoryWithChildren);
            }
        });

        return rootCategories;
    };

    // Helper to flatten tree for table display with depth
    const flattenCategoryTree = (categories: Category[], depth = 0): (Category & { depth: number })[] => {
        let result: (Category & { depth: number })[] = [];
        for (const cat of categories) {
            result.push({ ...cat, depth });
            if (cat.children && cat.children.length > 0) {
                result = result.concat(flattenCategoryTree(cat.children, depth + 1));
            }
        }
        return result;
    };

    const [flatCategories, setFlatCategories] = useState<(Category & { depth: number })[]>([]);

    const [searchTerm, setSearchTerm] = useState('');

    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log("Fetching categories...");
            const response = await api.get('/api/admin/categories');
            console.log("Categories fetched:", response.data);
            const rawCategories = response.data;
            setCategories(rawCategories);
        } catch (error: any) {
            console.error("Fetch categories error:", error);
            const msg = error.response?.data?.detail || error.message || '카테고리 목록을 불러오는데 실패했습니다.';
            // Force visible alert for debugging if toast fails
            // alert(`Error: ${msg}`); 
            setError(msg);
            toast.error(msg);
        } finally {
            console.log("Fetch categories finally block reached");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);


    // Filter and build tree
    useEffect(() => {
        let filtered = categories;
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = categories.filter(c =>
                c.name.toLowerCase().includes(lowerTerm) ||
                c.value.toLowerCase().includes(lowerTerm)
            );
        }

        if (searchTerm) {
            setFlatCategories(filtered.map(c => ({ ...c, depth: 0 })));
        } else {
            const tree = buildCategoryTree(filtered);
            const flatTree = flattenCategoryTree(tree);
            setFlatCategories(flatTree);
        }
    }, [categories, searchTerm]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                parent_id: formData.parent_id || null,
                config_json: formData.config_json ? JSON.parse(formData.config_json) : null
            };

            if (editingCategory) {
                await api.put(`/api/admin/categories/${editingCategory.id}`, payload);
                toast.success('카테고리가 수정되었습니다.');
            } else {
                await api.post('/api/admin/categories', payload);
                toast.success('카테고리가 추가되었습니다.');
            }

            setIsModalOpen(false);
            fetchCategories();
            resetForm();
        } catch (error) {
            toast.error('작업 실패. 입력을 확인해주세요.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('정말로 이 카테고리를 삭제하시겠습니까? 하위 카테고리가 있다면 함께 삭제될 수 있습니다.')) return;
        try {
            await api.delete(`/api/admin/categories/${id}`);
            toast.success('카테고리가 삭제되었습니다.');
            fetchCategories();
        } catch (error) {
            toast.error('삭제 실패');
        }
    };

    const fetchLinkedTemplates = async (categoryId: string) => {
        try {
            setIsLoadingTemplates(true);
            // Updated to use the new onboarding links endpoint
            const response = await api.get(`/api/admin/categories/${categoryId}/templates`);
            setLinkedTemplates(response.data);
        } catch (error) {
            console.error("Failed to fetch linked templates", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleLinkTemplate = async (templateId: string) => {
        if (!editingCategory) return;
        try {
            // New endpoint: Link to onboarding WITHOUT changing category_id
            await api.post(`/api/admin/categories/${editingCategory.id}/templates/${templateId}`);
            toast.success("템플릿이 연결되었습니다.");
            fetchLinkedTemplates(editingCategory.id);
            setIsTemplateSelectorOpen(false);
        } catch (error) {
            toast.error("템플릿 연결 실패");
        }
    };

    // Unlink Alert Handlers
    const openUnlinkAlert = (templateId: string) => {
        setUnlinkTemplateId(templateId);
        setIsUnlinkAlertOpen(true);
    };

    const executeUnlinkTemplate = async () => {
        if (!unlinkTemplateId || !editingCategory) return;

        try {
            // New endpoint: Unlink from onboarding
            await api.delete(`/api/admin/categories/${editingCategory.id}/templates/${unlinkTemplateId}`);
            toast.success("연결이 해제되었습니다.");
            fetchLinkedTemplates(editingCategory.id);
        } catch (error) {
            toast.error("연결 해제 실패");
        } finally {
            setIsUnlinkAlertOpen(false);
            setUnlinkTemplateId(null);
        }
    };

    const handleUnlinkAllTemplates = async () => {
        if (linkedTemplates.length === 0) return;
        if (!confirm(`정말 ${linkedTemplates.length}개의 템플릿 연결을 모두 해제하시겠습니까?`)) return;

        try {
            // Loop delete calls (could be optimized with bulk endpoint later)
            await Promise.all(linkedTemplates.map(t =>
                api.delete(`/api/admin/categories/${editingCategory?.id}/templates/${t.id}`)
            ));
            toast.success("모든 템플릿의 연결이 해제되었습니다.");
            if (editingCategory) fetchLinkedTemplates(editingCategory.id);
        } catch (error) {
            toast.error("일부 템플릿의 연결 해제에 실패했습니다.");
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                value: category.value,
                parent_id: category.parent_id || '',
                order: category.order,
                icon: category.icon || '',
                description: category.description || '',
                config_json: JSON.stringify(category.config_json || {}, null, 2)
            });
            fetchLinkedTemplates(category.id);
        } else {
            setEditingCategory(null);
            setLinkedTemplates([]); // Clear linked templates for new category
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            value: '',
            parent_id: '',
            order: 0,
            icon: '',
            description: '',
            config_json: '{}'
        });
    };

    // Helper to get root categories for parent selector
    const rootCategories = categories.filter(c => !c.parent_id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">카테고리 관리</h2>
                    <p className="text-gray-500">직무 분류 체계 및 연결된 템플릿을 관리합니다.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="검색 (이름, 값)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        카테고리 추가
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">이름 (Label)</th>
                                <th className="px-6 py-4 font-medium text-gray-500">값 (Value)</th>
                                <th className="px-6 py-4 font-medium text-gray-500">아이콘</th>
                                <th className="px-6 py-4 font-medium text-gray-500">순서</th>
                                <th className="px-6 py-4 font-medium text-gray-500 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        로딩 중...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-red-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <span>오류 발생: {error}</span>
                                            <button
                                                onClick={() => fetchCategories()}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                재시도
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : flatCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        등록된 카테고리가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                flatCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div style={{ paddingLeft: `${category.depth * 20}px` }} className="flex items-center gap-2">
                                                {category.depth > 0 && <div className="w-2 h-2 border-l border-b border-gray-300 -mt-1" />}
                                                {category.name}
                                            </div>
                                            {category.description && (
                                                <div style={{ paddingLeft: `${category.depth * 20}px` }} className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                                                    {category.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {category.value}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {category.icon || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {category.order}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(category)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
                            </h3>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <form id="categoryForm" onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">이름 (Label)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">값 (Value)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">아이콘 (Lucide Name)</label>
                                        <input
                                            type="text"
                                            value={formData.icon}
                                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                            placeholder="eg. Users, Code..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                                        <input
                                            type="number"
                                            value={formData.order}
                                            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">상위 카테고리</label>
                                    <select
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">최상위 (대분류)</option>
                                        {rootCategories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">설정 (JSON)</label>
                                    <textarea
                                        value={formData.config_json}
                                        onChange={(e) => setFormData({ ...formData, config_json: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                                        rows={3}
                                    />
                                </div>
                            </form>

                            {/* Connected Templates Section */}
                            {editingCategory && (
                                <div className="mt-8 border-t pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <LinkIcon className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm font-bold text-gray-900">연결된 템플릿 ({linkedTemplates.length})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {linkedTemplates.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleUnlinkAllTemplates}
                                                    className="text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                >
                                                    전체 해제
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setIsTemplateSelectorOpen(true)}
                                                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                                            >
                                                + 템플릿 연결
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                                        {isLoadingTemplates ? (
                                            <div className="text-center py-4 text-xs text-gray-400">로딩 중...</div>
                                        ) : linkedTemplates.length === 0 ? (
                                            <div className="text-center py-4 text-xs text-gray-400">연결된 템플릿이 없습니다.</div>
                                        ) : (
                                            linkedTemplates.map(t => (
                                                <div key={t.id} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 text-sm">
                                                    <span className="truncate flex-1 pr-2">{t.name || t.title}</span>
                                                    <button
                                                        onClick={() => openUnlinkAlert(t.id)}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                        title="연결 해제"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                form="categoryForm"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                저장
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selector Modal */}
            <TemplateSelectorModal
                isOpen={isTemplateSelectorOpen}
                onClose={() => setIsTemplateSelectorOpen(false)}
                onSelect={handleLinkTemplate}
                categoryName={editingCategory?.name}
            />

            {/* Unlink Confirmation Alert */}
            <AlertDialog open={isUnlinkAlertOpen} onOpenChange={setIsUnlinkAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>연결을 해제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            템플릿은 삭제되지 않고, 이 카테고리와의 연결만 해제됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUnlinkTemplateId(null)}>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={executeUnlinkTemplate} className="bg-red-600 hover:bg-red-700">
                            해제
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
