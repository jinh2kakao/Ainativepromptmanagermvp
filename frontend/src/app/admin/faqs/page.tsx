'use client';

import { useState, useEffect } from 'react';
import { fetchAdminFAQs, createFAQ, updateFAQ, deleteFAQ } from '@/features/community/api';
import { FAQ } from '@/types';
import { Plus, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FAQManagementPage() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

    const [formData, setFormData] = useState({
        category: '',
        question: '',
        answer: '',
        display_order: 0
    });

    const loadFAQs = async () => {
        try {
            setIsLoading(true);
            const data = await fetchAdminFAQs();
            setFaqs(data);
        } catch (error) {
            toast.error('FAQ 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFAQs();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingFAQ) {
                await updateFAQ(editingFAQ.id, formData);
                toast.success('FAQ가 수정되었습니다.');
            } else {
                await createFAQ(formData);
                toast.success('FAQ가 추가되었습니다.');
            }
            setIsModalOpen(false);
            loadFAQs();
            resetForm();
        } catch (error) {
            toast.error('작업 실패');
        }
    };

    const handleDelete = (id: string) => {
        toast('정말로 이 FAQ를 삭제하시겠습니까?', {
            action: {
                label: '삭제',
                onClick: async () => {
                    try {
                        await deleteFAQ(id);
                        toast.success('삭제되었습니다.');
                        loadFAQs();
                    } catch (error) {
                        toast.error('삭제 실패');
                    }
                }
            },
            cancel: { label: '취소', onClick: () => { } }
        });
    };

    const openModal = (faq?: FAQ) => {
        if (faq) {
            setEditingFAQ(faq);
            setFormData({
                category: faq.category,
                question: faq.question,
                answer: faq.answer,
                display_order: faq.display_order
            });
        } else {
            setEditingFAQ(null);
            resetForm();
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            category: '',
            question: '',
            answer: '',
            display_order: 0
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HelpCircle className="w-6 h-6" />
                        FAQ 관리
                    </h2>
                    <p className="text-gray-500">자주 묻는 질문을 관리합니다.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    FAQ 추가
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 w-16">순서</th>
                            <th className="px-6 py-4 font-medium text-gray-500 w-32">카테고리</th>
                            <th className="px-6 py-4 font-medium text-gray-500">질문 / 답변</th>
                            <th className="px-6 py-4 font-medium text-gray-500 w-24 text-right">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">로딩 중...</td></tr>
                        ) : faqs.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">등록된 FAQ가 없습니다.</td></tr>
                        ) : (
                            faqs.map((faq) => (
                                <tr key={faq.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-500">{faq.display_order}</td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">{faq.category}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900 mb-1">Q. {faq.question}</div>
                                        <div className="text-gray-500 bg-gray-50 p-2 rounded text-xs whitespace-pre-wrap">A. {faq.answer}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openModal(faq)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(faq.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
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
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingFAQ ? 'FAQ 수정' : '새 FAQ 추가'}
                            </h3>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="예: 결제, 계정, 사용법"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">순서</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.display_order}
                                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">질문 (Question)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.question}
                                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="질문을 입력하세요"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">답변 (Answer)</label>
                                <textarea
                                    required
                                    value={formData.answer}
                                    onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[100px]"
                                    placeholder="답변을 입력하세요"
                                />
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
