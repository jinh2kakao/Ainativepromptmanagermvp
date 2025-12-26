'use client';

import { useState, useEffect } from 'react';
import { fetchAdminInquiries } from '@/features/community/api';
import { Inquiry, InquiryStatus } from '@/types';
import { MessageSquare, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function QnAManagementPage() {
    const router = useRouter();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<InquiryStatus | 'ALL'>('ALL');

    const loadInquiries = async (status?: InquiryStatus | 'ALL') => {
        try {
            setIsLoading(true);
            // If ALL, pass undefined to fetch all
            const statusParam = status === 'ALL' ? undefined : (status as string);
            const data = await fetchAdminInquiries(statusParam);
            setInquiries(data);
        } catch (error) {
            toast.error('문의 목록을 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadInquiries(activeTab === 'ALL' ? undefined : activeTab);
    }, [activeTab]);

    const tabs: { label: string, value: InquiryStatus | 'ALL' }[] = [
        { label: '전체', value: 'ALL' },
        { label: '답변대기', value: 'PENDING' },
        { label: '답변완료', value: 'ANSWERED' },
        { label: '종료됨', value: 'CLOSED' },
    ];

    const getStatusBadge = (status: InquiryStatus) => {
        switch (status) {
            case 'PENDING':
                return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium">대기중</span>;
            case 'ANSWERED':
                return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">답변완료</span>;
            case 'CLOSED':
                return <span className="bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium">종료</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6" />
                        1:1 문의 관리
                    </h2>
                    <p className="text-gray-500">사용자 문의(CS)를 관리하고 답변합니다.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveTab(tab.value)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.value
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-medium text-gray-500 w-24">상태</th>
                            <th className="px-6 py-4 font-medium text-gray-500 w-32">카테고리</th>
                            <th className="px-6 py-4 font-medium text-gray-500">제목</th>
                            <th className="px-6 py-4 font-medium text-gray-500 w-48">사용자</th>
                            <th className="px-6 py-4 font-medium text-gray-500 w-32">등록일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">로딩 중...</td></tr>
                        ) : inquiries.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">문의 내역이 없습니다.</td></tr>
                        ) : (
                            inquiries.map((inquiry) => (
                                <tr
                                    key={inquiry.id}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => router.push(`/admin/qna/detail?id=${inquiry.id}`)}
                                >
                                    <td className="px-6 py-4">
                                        {getStatusBadge(inquiry.status)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{inquiry.category || '-'}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{inquiry.title}</div>
                                        <div className="text-gray-500 truncate max-w-sm">{inquiry.content}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="font-medium text-sm text-gray-900">{inquiry.user_email}</div>
                                        {inquiry.user_name && <div className="text-xs text-gray-500">{inquiry.user_name}</div>}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {format(new Date(inquiry.updated_at), 'yyyy-MM-dd')}
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
