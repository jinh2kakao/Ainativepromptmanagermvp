'use client';

import { useState, useEffect, Suspense } from 'react';
import { api } from '@/utils/axios';
import { Search, Eye, Trash2, ExternalLink, Lock, Globe, User } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';

interface Prompt {
    id: string;
    title: string;
    mode: 'simple' | 'assistance';
    content: string;
    category: string;
    sub_category: string;
    is_public: boolean;
    owner_id: string;
    owner_email?: string;
    created_at: string;
}

function PromptManagementContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Initialize state directly from searchParams to avoid race condition
    const [searchAuthorEmail, setSearchAuthorEmail] = useState(searchParams.get('owner_email') || '');

    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    // Sync state if URL changes (e.g. back button navigation)
    useEffect(() => {
        const emailFromUrl = searchParams.get('owner_email') || '';
        if (emailFromUrl !== searchAuthorEmail) {
            setSearchAuthorEmail(emailFromUrl);
        }
    }, [searchParams]);

    const fetchPrompts = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (searchAuthorEmail) {
                params.owner_email = searchAuthorEmail;
            }

            const response = await api.get('/api/admin/prompts', { params });
            setPrompts(response.data);
        } catch (error) {
            toast.error('프롬프트 목록을 불러오는데 실패했습니다.');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, [searchAuthorEmail]);

    const handleDeletePrompt = (promptId: string) => {
        setConfirmModal({
            isOpen: true,
            title: '프롬프트 삭제',
            message: '정말로 이 프롬프트를 삭제하시겠습니까?',
            onConfirm: async () => {
                try {
                    await api.delete(`/api/admin/prompts/${promptId}`);
                    toast.success('프롬프트가 삭제되었습니다.');
                    fetchPrompts();
                } catch (error) {
                    toast.error('프롬프트 삭제 실패');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleClearAuthorFilter = () => {
        setSearchAuthorEmail('');
        router.push('/admin/prompts');
    };

    const filteredPrompts = prompts.filter(prompt =>
        prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prompt.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">프롬프트 관리</h2>
                    <p className="text-gray-500">등록된 모든 프롬프트를 모니터링하고 관리합니다.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="작성자 이메일로 조회..."
                            value={searchAuthorEmail}
                            onChange={(e) => setSearchAuthorEmail(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                        {searchAuthorEmail && (
                            <button
                                onClick={handleClearAuthorFilter}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <span className="sr-only">Clear</span>
                                &times;
                            </button>
                        )}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="제목 또는 내용 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">프롬프트 정보</th>
                                <th className="px-6 py-4 font-medium text-gray-500">카테고리</th>
                                <th className="px-6 py-4 font-medium text-gray-500">모드</th>
                                <th className="px-6 py-4 font-medium text-gray-500">작성자 이메일</th>
                                <th className="px-6 py-4 font-medium text-gray-500">공개 여부</th>
                                <th className="px-6 py-4 font-medium text-gray-500">작성일</th>
                                <th className="px-6 py-4 font-medium text-gray-500 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        로딩 중...
                                    </td>
                                </tr>
                            ) : filteredPrompts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                filteredPrompts.map((prompt) => (
                                    <tr key={prompt.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="font-medium text-gray-900 truncate" title={prompt.title}>
                                                    {prompt.title}
                                                </p>
                                                <p className="text-gray-500 text-xs truncate">ID: {prompt.id}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-gray-600">
                                                <p>{prompt.category || '-'}</p>
                                                <p className="text-xs text-gray-400">{prompt.sub_category}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prompt.mode === 'assistance'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {prompt.mode === 'assistance' ? 'Assistance' : 'Simple'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {prompt.owner_email || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {prompt.is_public ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                                    <Globe className="w-3 h-3" />
                                                    Public
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-gray-500 text-xs">
                                                    <Lock className="w-3 h-3" />
                                                    Private
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(prompt.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.open(`/prompts/view?id=${prompt.id}`, '_blank')}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="새 탭에서 보기"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePrompt(prompt.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="삭제"
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

            {/* Confirm Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
                        <p className="text-gray-600 mb-6">{confirmModal.message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PromptManagementPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PromptManagementContent />
        </Suspense>
    );
}
