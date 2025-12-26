'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AiAgent } from '@/types';

export default function AgentManagementPage() {
    const [agents, setAgents] = useState<AiAgent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<AiAgent | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        group: '',
        is_active: true,
        sort_order: 0
    });

    const fetchAgents = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/admin/agents');
            setAgents(res.data);
        } catch (error) {
            toast.error('에이전트 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAgent) {
                await api.put(`/api/admin/agents/${editingAgent.id}`, formData);
                toast.success('에이전트가 수정되었습니다.');
            } else {
                await api.post('/api/admin/agents', formData);
                toast.success('에이전트가 추가되었습니다.');
            }
            setIsModalOpen(false);
            fetchAgents();
            resetForm();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || '작업 실패');
        }
    };

    const handleDelete = (agent: AiAgent) => {
        toast('정말로 이 에이전트를 삭제하시겠습니까?', {
            action: {
                label: '삭제',
                onClick: () => deleteAgent(agent.id)
            },
            cancel: {
                label: '취소',
                onClick: () => { }
            }
        });
    };

    const deleteAgent = async (id: string) => {
        try {
            await api.delete(`/api/admin/agents/${id}`);
            toast.success('에이전트가 삭제되었습니다.');
            fetchAgents();
        } catch (error) {
            toast.error('삭제 실패');
        }
    };

    const openModal = (agent?: AiAgent) => {
        if (agent) {
            setEditingAgent(agent);
            setFormData({
                id: agent.id,
                name: agent.name,
                group: agent.group,
                is_active: agent.is_active,
                sort_order: agent.sort_order
            });
        } else {
            setEditingAgent(null);
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            group: '',
            is_active: true,
            sort_order: 0
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI 에이전트 관리</h2>
                    <p className="text-gray-500">시스템에서 사용할 AI 에이전트 목록을 관리합니다.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    에이전트 추가
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500">순서</th>
                            <th className="px-6 py-4 font-medium text-gray-500">그룹</th>
                            <th className="px-6 py-4 font-medium text-gray-500">ID</th>
                            <th className="px-6 py-4 font-medium text-gray-500">이름 (Label)</th>
                            <th className="px-6 py-4 font-medium text-gray-500">상태</th>
                            <th className="px-6 py-4 font-medium text-gray-500 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">로딩 중...</td></tr>
                        ) : agents.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">등록된 에이전트가 없습니다.</td></tr>
                        ) : (
                            agents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-900">{agent.sort_order}</td>
                                    <td className="px-6 py-4 text-gray-600">{agent.group}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{agent.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900">{agent.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {agent.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openModal(agent)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(agent);
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded"
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

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingAgent ? '에이전트 수정' : '새 에이전트 추가'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID (Unique)</label>
                                <input
                                    type="text"
                                    required
                                    disabled={!!editingAgent}
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                                    placeholder="e.g. gpt-4o"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">이름 (Display Name)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g. GPT-4o"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">그룹 (Category)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.group}
                                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g. Coding & Logic"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm text-gray-700">활성화</span>
                                    </label>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
