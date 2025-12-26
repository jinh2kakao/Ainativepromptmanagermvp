'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/axios';
import { toast } from 'sonner';
import { Trash2, Search, Folder } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectAdminView {
    id: string;
    title: string;
    description: string;
    owner_email: string;
    owner_name: string;
    node_count: number;
    created_at: string;
    updated_at: string;
}

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<ProjectAdminView[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchProjects = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/api/admin/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
            toast.error('프로젝트 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('정말로 이 프로젝트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;

        try {
            await api.delete(`/api/admin/projects/${id}`);
            toast.success('프로젝트가 삭제되었습니다.');
            fetchProjects();
        } catch (error) {
            console.error('Failed to delete project', error);
            toast.error('프로젝트 삭제에 실패했습니다.');
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.owner_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">프로젝트 모니터링</h1>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="프로젝트 또는 사용자 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">프로젝트</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">소유자</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">노드 수</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">생성일</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProjects.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    프로젝트가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Folder className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{project.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                                    {project.description || '설명 없음'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{project.owner_name}</div>
                                        <div className="text-xs text-gray-500">{project.owner_email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {project.node_count} nodes
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {format(new Date(project.created_at), 'yyyy-MM-dd HH:mm')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(project.id)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="프로젝트 삭제"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
