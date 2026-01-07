'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/axios';
import { Plus, Edit2, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { AiAgent } from '@/types';
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

interface PromptTemplate {
    id: string;
    category_id: string;
    mode: 'simple' | 'assistance';
    content: string;
    is_default: boolean;
    name: string;
    description?: string;
    applicable_agents?: string[];
    preview_image_url?: string;
}

interface Category {
    id: string;
    name: string;
    parent_id?: string | null;
}

// Structured Template Types
interface TemplateItem {
    label: string;
    value: string;
}

interface TemplateGroup {
    groupName: string;
    items: TemplateItem[];
}

export default function TemplateManagementPage() {
    const [templates, setTemplates] = useState<PromptTemplate[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [availableAgents, setAvailableAgents] = useState<AiAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 20;

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterParentId, setFilterParentId] = useState('');
    const [filterChildId, setFilterChildId] = useState('');
    const [filterMode, setFilterMode] = useState('');
    const [filterHasImage, setFilterHasImage] = useState('');
    const [filterUncategorized, setFilterUncategorized] = useState(false);

    // Delete Alert State
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);

    // Score state
    const [scores, setScores] = useState<Record<string, number>>({});

    // Derived lists for filter dropdowns
    const rootCategories = categories.filter(c => !c.parent_id);
    const subCategories = filterParentId
        ? categories.filter(c => c.parent_id === filterParentId)
        : [];

    const [formParentId, setFormParentId] = useState('');

    // Structured Content State
    const [groups, setGroups] = useState<TemplateGroup[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        mode: 'simple',
        content: '',
        is_default: false,
        applicable_agents: [] as string[],
        preview_image_url: ''
    });

    const fetchCategories = async () => {
        try {
            const res = await api.get('/api/admin/categories');
            setCategories(res.data);
        } catch (error) {
            toast.error('카테고리 로딩 실패');
        }
    };

    const fetchAgents = async () => {
        try {
            const res = await api.get('/api/admin/agents');
            setAvailableAgents(res.data);
        } catch (error) {
            console.error("Failed to fetch agents", error);
        }
    };

    const loadTemplates = async (reset = false) => {
        try {
            setIsLoading(true);
            const currentPage = reset ? 0 : page;
            const skip = currentPage * LIMIT;

            // Determine category ID to send
            const targetCategoryId = filterChildId || filterParentId || '';

            const params = {
                skip,
                limit: LIMIT,
                category_id: targetCategoryId || undefined,
                mode: filterMode || undefined,
                search: searchTerm || undefined,
                hasImage: filterHasImage === '' ? undefined : filterHasImage === 'true',
                uncategorized: filterUncategorized ? true : undefined
            };

            const res = await api.get('/api/admin/templates', { params });
            const newTemplates: PromptTemplate[] = res.data;

            if (reset) {
                setTemplates(newTemplates);
                setPage(1);
            } else {
                setTemplates(prev => [...prev, ...newTemplates]);
                setPage(prev => prev + 1);
            }

            // Fetch scores for these templates
            if (newTemplates.length > 0) {
                try {
                    const ids = newTemplates.map(t => t.id).join(',');
                    const scoreRes = await api.get(`/api/crucible/scores/${ids}`);
                    setScores(prev => ({ ...prev, ...scoreRes.data }));
                } catch (e) {
                    console.error("Failed to fetch scores", e);
                }
            }

            setHasMore(newTemplates.length === LIMIT);

        } catch (error) {
            toast.error('데이터를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchAgents();
    }, []);

    // Debounce search and reload on filter change
    useEffect(() => {
        const timer = setTimeout(() => {
            loadTemplates(true);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, filterParentId, filterChildId, filterMode, filterHasImage, filterUncategorized]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let finalContent = formData.content;

            // If assistance mode, serialize groups to JSON
            if (formData.mode === 'assistance') {
                finalContent = JSON.stringify(groups);
            }

            const payload = {
                ...formData,
                content: finalContent
            };

            if (editingTemplate) {
                await api.put(`/api/admin/templates/${editingTemplate.id}`, payload);
                toast.success('템플릿이 수정되었습니다.');
            } else {
                await api.post('/api/admin/templates', payload);
                toast.success('템플릿이 추가되었습니다.');
            }

            setIsModalOpen(false);
            loadTemplates(true); // Reload list
            resetForm();
        } catch (error) {
            toast.error('작업 실패. 입력을 확인해주세요.');
        }
    };

    const openDeleteAlert = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingTemplateId(id);
        setIsDeleteAlertOpen(true);
    };

    const executeDelete = async () => {
        if (!deletingTemplateId) return;

        try {
            await api.delete(`/api/admin/templates/${deletingTemplateId}`);
            toast.success('템플릿이 삭제되었습니다.');
            loadTemplates(true); // Reload list
        } catch (error) {
            toast.error('삭제 실패');
        } finally {
            setIsDeleteAlertOpen(false);
            setDeletingTemplateId(null);
        }
    };

    const openModal = (template?: PromptTemplate) => {
        if (template) {
            setEditingTemplate(template);

            // Determine parent category for form
            const cat = categories.find(c => c.id === template.category_id);
            if (cat && cat.parent_id) {
                setFormParentId(cat.parent_id);
            } else {
                setFormParentId('');
            }

            setFormData({
                name: template.name || '',
                description: template.description || '',
                category_id: template.category_id || '',
                mode: template.mode as any,
                content: template.content,
                is_default: template.is_default,
                applicable_agents: template.applicable_agents || [],
                preview_image_url: template.preview_image_url || ''
            });

            // ... [existing parsing logic] ...
            if (template.mode === 'assistance') {
                try {
                    const parsed = JSON.parse(template.content);
                    if (Array.isArray(parsed)) {
                        setGroups(parsed);
                    } else {
                        setGroups([]);
                    }
                } catch (e) {
                    setGroups([]);
                }
            } else {
                setGroups([]);
            }
        } else {
            setEditingTemplate(null);
            setFormParentId('');
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category_id: '',
            mode: 'simple',
            content: '',
            is_default: false,
            applicable_agents: [],
            preview_image_url: ''
        });
        setGroups([]);
        setFormParentId('');
    };

    // Group Management Handlers
    const addGroup = () => {
        setGroups([...groups, { groupName: '', items: [] }]);
    };

    const removeGroup = (index: number) => {
        const newGroups = [...groups];
        newGroups.splice(index, 1);
        setGroups(newGroups);
    };

    const updateGroupName = (index: number, name: string) => {
        const newGroups = [...groups];
        newGroups[index].groupName = name;
        setGroups(newGroups);
    };

    const addItem = (groupIndex: number) => {
        const newGroups = [...groups];
        newGroups[groupIndex].items.push({ label: '', value: '' });
        setGroups(newGroups);
    };

    const removeItem = (groupIndex: number, itemIndex: number) => {
        const newGroups = [...groups];
        newGroups[groupIndex].items.splice(itemIndex, 1);
        setGroups(newGroups);
    };

    const updateItem = (groupIndex: number, itemIndex: number, field: 'label' | 'value', value: string) => {
        const newGroups = [...groups];
        newGroups[groupIndex].items[itemIndex][field] = value;
        setGroups(newGroups);
    };

    const getCategoryName = (id: string) => {
        return categories.find(c => c.id === id)?.name || 'Unknown';
    };

    // Helper to get category hierarchy name
    const getFullCategoryName = (id: string) => {
        const cat = categories.find(c => c.id === id);
        if (!cat) return 'Unknown';
        if (cat.parent_id) {
            const parent = categories.find(c => c.id === cat.parent_id);
            return parent ? `${parent.name} > ${cat.name}` : cat.name;
        }
        return cat.name;
    };

    // Helper to get Score Badge
    const getScoreBadge = (id: string) => {
        const score = scores[id];
        if (score === undefined) return <span className="text-gray-400 text-xs">-</span>;

        let colorClass = "bg-green-100 text-green-800";
        if (score < 50) colorClass = "bg-red-100 text-red-800";
        else if (score < 70) colorClass = "bg-yellow-100 text-yellow-800";

        return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
                {score}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">템플릿 관리</h2>
                    <p className="text-gray-500">카테고리별 예시 프롬프트를 관리합니다.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        placeholder="검색 (내용)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Parent Category Filter */}
                    <select
                        value={filterParentId}
                        onChange={(e) => {
                            setFilterParentId(e.target.value);
                            setFilterChildId(''); // Reset child filter when parent changes
                        }}
                        disabled={filterUncategorized}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        <option value="">대분류 전체</option>
                        {rootCategories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {/* Child Category Filter - Only show if parent is selected */}
                    {filterParentId && (
                        <select
                            value={filterChildId}
                            onChange={(e) => setFilterChildId(e.target.value)}
                            disabled={filterUncategorized}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                        >
                            <option value="">소분류 전체</option>
                            {subCategories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    )}

                    <select
                        value={filterMode}
                        onChange={(e) => setFilterMode(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">모든 모드</option>
                        <option value="simple">Simple</option>
                        <option value="assistance">Assistance</option>
                    </select>
                    <select
                        value={filterHasImage}
                        onChange={(e) => setFilterHasImage(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="">이미지 전체</option>
                        <option value="true">이미지 있음</option>
                        <option value="false">이미지 없음</option>
                    </select>


                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-white">
                        <input
                            type="checkbox"
                            id="uncategorized"
                            checked={filterUncategorized}
                            onChange={(e) => {
                                setFilterUncategorized(e.target.checked);
                                if (e.target.checked) {
                                    setFilterParentId('');
                                    setFilterChildId('');
                                }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="uncategorized" className="text-sm text-gray-700 whitespace-nowrap cursor-pointer">
                            미분류만 보기
                        </label>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        템플릿 추가
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">카테고리</th>
                                <th className="px-6 py-4 font-medium text-gray-500">템플릿명</th>
                                <th className="px-6 py-4 font-medium text-gray-500">모드</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Score</th>
                                <th className="px-6 py-4 font-medium text-gray-500">내용</th>
                                <th className="px-6 py-4 font-medium text-gray-500">기본값 여부</th>
                                <th className="px-6 py-4 font-medium text-gray-500 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading && templates.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        로딩 중...
                                    </td>
                                </tr>
                            ) : templates.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        등록된 템플릿이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                templates.map((template) => (
                                    <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {getFullCategoryName(template.category_id)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">
                                            {template.name || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${template.mode === 'assistance'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {template.mode === 'assistance' ? 'Assistance' : 'Simple'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getScoreBadge(template.id)}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                            <div className="flex flex-col">
                                                <span>{template.description || '-'}</span>
                                                <span className="text-xs text-gray-400 truncate">{template.content}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {template.is_default ? 'Yes' : 'No'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(template)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => openDeleteAlert(template.id, e)}
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
                {/* Load More Button */}
                {hasMore && (
                    <div className="p-4 border-t border-gray-100 text-center">
                        <button
                            onClick={() => loadTemplates(false)}
                            disabled={isLoading}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        >
                            {isLoading ? '로딩 중...' : '더 보기'}
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {editingTemplate ? '템플릿 수정' : '새 템플릿 추가'}
                                </h3>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">템플릿명</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="템플릿 이름을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">설명 (Description)</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="템플릿에 대한 설명을 입력하세요"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                </div>

                                {/* Category Selection (2-depth) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">대분류</label>
                                        <select
                                            value={formParentId}
                                            onChange={(e) => {
                                                setFormParentId(e.target.value);
                                                setFormData(prev => ({ ...prev, category_id: '' })); // Reset sub-category
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="">대분류 선택</option>
                                            {rootCategories.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">소분류</label>
                                        <select
                                            value={formData.category_id}
                                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                            disabled={!formParentId}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            <option value="">소분류 선택</option>
                                            {categories.filter(c => c.parent_id === formParentId).map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">모드</label>
                                        <select
                                            value={formData.mode}
                                            onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        >
                                            <option value="simple">Simple</option>
                                            <option value="assistance">Assistance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">미리보기 이미지 URL</label>
                                        <input
                                            type="text"
                                            value={formData.preview_image_url || ''}
                                            onChange={(e) => setFormData({ ...formData, preview_image_url: e.target.value })}
                                            placeholder="https://example.com/image.png"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Preview Image Check */}
                                {formData.preview_image_url && (
                                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-200">
                                        <img
                                            src={formData.preview_image_url}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image+URL';
                                            }}
                                        />
                                    </div>
                                )}

                                {formData.mode === 'simple' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                            rows={8}
                                            placeholder="템플릿 내용을 입력하세요."
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-medium text-gray-700">템플릿 구조 (Groups & Items)</label>
                                            <button
                                                type="button"
                                                onClick={addGroup}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> 그룹 추가
                                            </button>
                                        </div>
                                        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
                                            {groups.length === 0 && (
                                                <p className="text-sm text-gray-500 text-center py-4">그룹을 추가하여 템플릿을 구성하세요.</p>
                                            )}
                                            {groups.map((group, gIndex) => (
                                                <div key={gIndex} className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="그룹명 (예: Persona)"
                                                            value={group.groupName}
                                                            onChange={(e) => updateGroupName(gIndex, e.target.value)}
                                                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeGroup(gIndex)}
                                                            className="text-red-500 hover:text-red-600 p-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="pl-4 space-y-2">
                                                        {group.items.map((item, iIndex) => (
                                                            <div key={iIndex} className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="항목명 (Label)"
                                                                    value={item.label}
                                                                    onChange={(e) => updateItem(gIndex, iIndex, 'label', e.target.value)}
                                                                    className="w-1/3 px-2 py-1 border border-gray-300 rounded text-sm"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="기본값 (Value)"
                                                                    value={item.value}
                                                                    onChange={(e) => updateItem(gIndex, iIndex, 'value', e.target.value)}
                                                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItem(gIndex, iIndex)}
                                                                    className="text-gray-400 hover:text-red-500"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => addItem(gIndex)}
                                                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                                                        >
                                                            <Plus className="w-3 h-3" /> 항목 추가
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Applicable Agents */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">적용 가능한 AI 에이전트</label>
                                    <div className="flex flex-wrap gap-2">
                                        {availableAgents.filter(a => a.is_active).map((agent) => {
                                            const isSelected = formData.applicable_agents?.includes(agent.id);
                                            return (
                                                <button
                                                    key={agent.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = formData.applicable_agents || [];
                                                        let updated;
                                                        if (current.includes(agent.id)) {
                                                            updated = current.filter(a => a !== agent.id);
                                                        } else {
                                                            updated = [...current, agent.id];
                                                        }
                                                        setFormData(prev => ({ ...prev, applicable_agents: updated }));
                                                    }}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isSelected
                                                        ? 'bg-blue-100 text-blue-800 border-blue-200 border'
                                                        : 'bg-gray-100 text-gray-600 border-gray-200 border hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {agent.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        checked={formData.is_default}
                                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="is_default" className="text-sm text-gray-700">이 카테고리의 기본 템플릿으로 설정</label>
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

                )
            }

            {/* Delete Confirmation Alert */}
            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>정말로 삭제하시겠습니까?</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 작업은 되돌릴 수 없습니다. 템플릿이 영구적으로 삭제됩니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingTemplateId(null)}>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={executeDelete} className="bg-red-600 hover:bg-red-700">
                            삭제
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
