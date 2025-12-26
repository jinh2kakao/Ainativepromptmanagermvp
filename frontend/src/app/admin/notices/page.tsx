'use client';

import { useState, useEffect } from 'react';
import { fetchAdminNotices, createNotice, updateNotice, deleteNotice } from '@/features/community/api';
import { Notice } from '@/types';
import { Plus, Edit2, Trash2, Megaphone, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function NoticeManagementPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        is_published: false,
        is_pinned: false
    });

    const loadNotices = async () => {
        try {
            setIsLoading(true);
            const data = await fetchAdminNotices();
            setNotices(data);
        } catch (error) {
            toast.error('공지사항 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadNotices();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingNotice) {
                await updateNotice(editingNotice.id, formData);
                toast.success('공지사항이 수정되었습니다.');
            } else {
                await createNotice(formData);
                toast.success('공지사항이 추가되었습니다.');
            }
            setIsModalOpen(false);
            loadNotices();
            resetForm();
        } catch (error) {
            toast.error('작업 실패');
        }
    };

    const handleDelete = (id: string) => {
        toast('정말로 이 공지사항을 삭제하시겠습니까?', {
            action: {
                label: '삭제',
                onClick: async () => {
                    try {
                        await deleteNotice(id);
                        toast.success('삭제되었습니다.');
                        loadNotices();
                    } catch (error) {
                        toast.error('삭제 실패');
                    }
                }
            },
            cancel: { label: '취소', onClick: () => { } }
        });
    };

    const openModal = (notice?: Notice) => {
        if (notice) {
            setEditingNotice(notice);
            setFormData({
                title: notice.title,
                content: notice.content,
                is_published: notice.is_published,
                is_pinned: notice.is_pinned
            });
        } else {
            setEditingNotice(null);
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: '',
            content: '',
            is_published: true,
            is_pinned: false
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Megaphone className="w-6 h-6" />
                        공지사항 관리
                    </h2>
                    <p className="text-gray-500">서비스 공지사항을 등록하고 관리합니다.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    공지사항 작성
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 w-16">상태</th>
                            <th className="px-6 py-4 font-medium text-gray-500">제목</th>
                            <th className="px-6 py-4 font-medium text-gray-500 w-32">등록일</th>
                            <th className="px-6 py-4 font-medium text-gray-500 w-24 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">로딩 중...</td></tr>
                        ) : notices.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">등록된 공지사항이 없습니다.</td></tr>
                        ) : (
                            notices.map((notice) => (
                                <tr key={notice.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {notice.is_published ? (
                                                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">게시중</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">임시저장</span>
                                            )}
                                            {notice.is_pinned && (
                                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">고정</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{notice.title}</div>
                                        <div className="text-gray-500 truncate max-w-md">{notice.content}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {format(new Date(notice.created_at), 'yyyy-MM-dd')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openModal(notice)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(notice.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
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
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="공지사항 제목"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">내용 (Markdown)</label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[200px]"
                                    placeholder="내용을 입력하세요..."
                                />
                            </div>
                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_published}
                                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">바로 게시하기</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_pinned}
                                        onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 rounded"
                                    />
                                    <span className="text-sm text-gray-700">상단 고정</span>
                                </label>
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
