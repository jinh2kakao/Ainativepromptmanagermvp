'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { fetchInquiry, fetchInquiryComments, createComment, updateInquiryStatus } from '@/features/community/api';
import { Inquiry, InquiryComment, InquiryStatus } from '@/types';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

function QnADetailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inquiryId = searchParams.get('id');

    const [inquiry, setInquiry] = useState<Inquiry | null>(null);
    const [comments, setComments] = useState<InquiryComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!inquiryId) return;
        loadData();
    }, [inquiryId]);

    // Scroll to bottom when comments change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const loadData = async () => {
        if (!inquiryId) return;
        try {
            setIsLoading(true);
            const [inqData, commentsData] = await Promise.all([
                fetchInquiry(inquiryId),
                fetchInquiryComments(inquiryId)
            ]);
            setInquiry(inqData);
            setComments(commentsData);
        } catch (error) {
            toast.error('문의 정보를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !inquiryId) return;

        try {
            setIsSubmitting(true);
            await createComment(inquiryId, replyContent);
            setReplyContent('');
            toast.success('답변이 등록되었습니다.');
            // Reload comments and inquiry (status might change)
            loadData();
        } catch (error) {
            toast.error('답변 등록 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (status: InquiryStatus) => {
        if (!inquiryId) return;
        try {
            await updateInquiryStatus(inquiryId, status);
            toast.success(`상태가 ${status}(으)로 변경되었습니다.`);
            loadData();
        } catch (error) {
            toast.error('상태 변경 실패');
        }
    };

    if (!inquiryId) return <div className="p-8 text-center text-gray-500">잘못된 접근입니다.</div>;
    if (isLoading) return <div className="p-8 text-center text-gray-500">로딩 중...</div>;
    if (!inquiry) return <div className="p-8 text-center text-gray-500">문의를 찾을 수 없습니다.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                    목록으로 돌아가기
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => handleStatusChange('PENDING')}
                        className={`px-3 py-1.5 rounded text-sm font-medium border ${inquiry.status === 'PENDING' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        대기중
                    </button>
                    <button
                        onClick={() => handleStatusChange('ANSWERED')}
                        className={`px-3 py-1.5 rounded text-sm font-medium border ${inquiry.status === 'ANSWERED' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        답변완료
                    </button>
                    <button
                        onClick={() => handleStatusChange('CLOSED')}
                        className={`px-3 py-1.5 rounded text-sm font-medium border ${inquiry.status === 'CLOSED' ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        종료
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content (Chat/Thread) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Inquiry Detail */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{inquiry.category}</span>
                            <span>•</span>
                            <span>{format(new Date(inquiry.created_at), 'yyyy.MM.dd HH:mm')}</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 mb-4">{inquiry.title}</h1>
                        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                            {inquiry.content}
                        </div>
                    </div>

                    {/* Comments Timeline */}
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className={`flex ${comment.is_staff_reply ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                                    max-w-[80%] rounded-xl p-4 shadow-sm border
                                    ${comment.is_staff_reply
                                        ? 'bg-blue-50 border-blue-100 rounded-tr-none'
                                        : 'bg-white border-gray-200 rounded-tl-none'}
                                `}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold ${comment.is_staff_reply ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {comment.is_staff_reply ? '관리자 답변' : '사용자 댓글'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {format(new Date(comment.created_at), 'MM.dd HH:mm')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {comment.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky bottom-4">
                        <form onSubmit={handleReply}>
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="답변을 입력하세요..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                                required
                            />
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-xs text-gray-500">
                                    답변 등록 시 상태가 '답변완료'로 자동 변경됩니다.
                                </span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !replyContent.trim()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    답변 등록
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar (User Info) */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">사용자 정보</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">이메일</label>
                                <div className="text-sm text-gray-900 font-medium break-all">{inquiry.user_email || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">이름</label>
                                <div className="text-sm text-gray-900">{inquiry.user_name || '-'}</div>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <a
                                    href={`/admin/users?search=${inquiry.user_email}`}
                                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    사용자 상세 정보 보기
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function QnADetailPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">로딩 중...</div>}>
            <QnADetailContent />
        </Suspense>
    );
}
