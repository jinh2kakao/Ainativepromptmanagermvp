'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/axios';
import { FolderTree, Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
    id: string;
    parent_id: string | null;
    name: string;
    value: string;
    order: number;
    config_json?: any;
    children?: Category[];
}

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        value: '',
        parent_id: '',
        order: 0,
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

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/admin/categories');
            const rawCategories = response.data;
            setCategories(rawCategories);
        } catch (error) {
            toast.error('카테고리 목록을 불러오는데 실패했습니다.');
        } finally {
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

        // If searching, we might want to show flat list or still try to build tree?
        // If we filter, the tree structure might be broken (missing parents).
        // So if searching, let's show flat list. If not, show tree.

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

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                value: category.value,
                parent_id: category.parent_id || '',
                order: category.order,
                config_json: JSON.stringify(category.config_json || {}, null, 2)
            });
        } else {
            setEditingCategory(null);
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
                    <p className="text-gray-500">직무 분류 체계를 관리합니다.</p>
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
                                <th className="px-6 py-4 font-medium text-gray-500">ID</th>
                                <th className="px-6 py-4 font-medium text-gray-500">이름 (Label)</th>
                                <th className="px-6 py-4 font-medium text-gray-500">값 (Value)</th>
                                <th className="px-6 py-4 font-medium text-gray-500">상위 카테고리 ID</th>
                                <th className="px-6 py-4 font-medium text-gray-500">순서</th>
                                <th className="px-6 py-4 font-medium text-gray-500 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        로딩 중...
                                    </td>
                                </tr>
                            ) : flatCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        등록된 카테고리가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                flatCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {category.id}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            <div style={{ paddingLeft: `${category.depth * 20}px` }} className="flex items-center gap-2">
                                                {category.depth > 0 && <div className="w-2 h-2 border-l border-b border-gray-300 -mt-1" />}
                                                {category.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {category.value}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                                            {category.parent_id || '-'}
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
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">설정 (JSON)</label>
                                <textarea
                                    value={formData.config_json}
                                    onChange={(e) => setFormData({ ...formData, config_json: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                                    rows={5}
                                />
                                <p className="text-xs text-gray-500 mt-1">Assistance Mode의 입력 필드 설정을 JSON으로 입력하세요.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    저장
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
