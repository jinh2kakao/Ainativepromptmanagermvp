import { useState, useEffect, useRef } from 'react';
import { fetchMyInquiries, createInquiry, fetchInquiry, fetchInquiryComments, createComment } from '@/features/community/api';
import { Inquiry, InquiryComment } from '@/types';
import { MessageSquare, Plus, ArrowLeft, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export function QnAList({ userEmail }: { userEmail: string }) {
    const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(true);

    // Detail View State
    const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [comments, setComments] = useState<InquiryComment[]>([]);
    const [replyContent, setReplyContent] = useState('');
    const [messagesLoading, setMessagesLoading] = useState(false);

    // Create View State
    const [formData, setFormData] = useState({ title: '', content: '', category: '일반' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (view === 'list') {
            loadInquiries();
        }
    }, [view]);

    useEffect(() => {
        if (view === 'detail' && selectedInquiryId) {
            loadDetail(selectedInquiryId);
        }
    }, [view, selectedInquiryId]);

    useEffect(() => {
        if (view === 'detail') {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [comments, view]);

    const loadInquiries = async () => {
        try {
            setLoading(true);
            const data = await fetchMyInquiries();
            setInquiries(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadDetail = async (id: string) => {
        try {
            setMessagesLoading(true);
            const [inq, coms] = await Promise.all([
                fetchInquiry(id),
                fetchInquiryComments(id)
            ]);
            setSelectedInquiry(inq);
            setComments(coms);
        } catch (e) {
            toast.error('문의 내역을 불러오는데 실패했습니다.');
        } finally {
            setMessagesLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            await createInquiry(formData);
            toast.success('문의가 등록되었습니다.');
            setFormData({ title: '', content: '', category: '일반' });
            setView('list');
        } catch (e) {
            toast.error('문의 등록 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedInquiryId || !replyContent.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            await createComment(selectedInquiryId, replyContent);
            setReplyContent('');
            // reload comments
            const coms = await fetchInquiryComments(selectedInquiryId);
            setComments(coms);
        } catch (e) {
            toast.error('댓글 등록 실패');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING': return <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">답변대기</span>;
            case 'ANSWERED': return <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">답변완료</span>;
            case 'CLOSED': return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-xs">종료</span>;
            default: return null;
        }
    };

    if (view === 'create') {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <button onClick={() => setView('list')} className="text-gray-500 flex items-center gap-2 hover:text-gray-900">
                    <ArrowLeft className="w-4 h-4" /> 목록으로
                </button>
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h2 className="text-xl font-bold mb-6">새로운 문의 작성</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                                <option>일반</option>
                                <option>계정/결제</option>
                                <option>버그 신고</option>
                                <option>기능 제안</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="문의 제목을 입력하세요"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                            <textarea
                                required
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[200px]"
                                placeholder="문의 내용을 상세히 적어주세요"
                            />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? '등록 중...' : '문의하기'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (view === 'detail') {
        if (!selectedInquiry) return <div>Loading...</div>;
        return (
            <div className="h-[calc(100vh-200px)] flex flex-col">
                <button onClick={() => setView('list')} className="text-gray-500 flex items-center gap-2 hover:text-gray-900 mb-4 shrink-0">
                    <ArrowLeft className="w-4 h-4" /> 목록으로
                </button>

                <div className="bg-white rounded-xl border border-gray-200 flex-1 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50 shrink-0">
                        <div className="flex items-center gap-2 mb-1">
                            {getStatusBadge(selectedInquiry.status)}
                            <span className="text-xs text-gray-500">{selectedInquiry.category}</span>
                            <span className="text-xs text-gray-400">• {format(new Date(selectedInquiry.created_at), 'yyyy.MM.dd HH:mm')}</span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">{selectedInquiry.title}</h2>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                        {/* Original Question */}
                        <div className="flex justify-end">
                            <div className="bg-blue-50 text-gray-800 p-4 rounded-xl rounded-tr-none max-w-[85%]">
                                <p className="whitespace-pre-wrap text-sm">{selectedInquiry.content}</p>
                            </div>
                        </div>

                        {/* Comments */}
                        {comments.map(comment => (
                            <div key={comment.id} className={`flex ${comment.is_staff_reply ? 'justify-start' : 'justify-end'}`}>
                                <div className={`
                                    max-w-[85%] p-4 rounded-xl text-sm whitespace-pre-wrap
                                    ${comment.is_staff_reply
                                        ? 'bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200'
                                        : 'bg-blue-50 text-gray-800 rounded-tr-none'}
                                `}>
                                    {comment.is_staff_reply && <div className="text-xs font-bold text-blue-600 mb-1">고객센터</div>}
                                    {comment.content}
                                    <div className="text-[10px] text-gray-400 mt-1 text-right">
                                        {format(new Date(comment.created_at), 'MM.dd HH:mm')}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                        <form onSubmit={handleReply} className="flex gap-2">
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="추가 문의 내용을 입력하세요..."
                                disabled={selectedInquiry.status === 'CLOSED' || isSubmitting}
                            />
                            <button
                                type="submit"
                                disabled={!replyContent.trim() || selectedInquiry.status === 'CLOSED' || isSubmitting}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    1:1 문의 내역
                </h2>
                <button
                    onClick={() => setView('create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm"
                >
                    <Plus className="w-4 h-4" /> 문의하기
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">로딩 중...</div>
            ) : inquiries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">문의 내역이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {inquiries.map(inquiry => (
                        <div
                            key={inquiry.id}
                            onClick={() => { setSelectedInquiryId(inquiry.id); setView('detail'); }}
                            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {getStatusBadge(inquiry.status)}
                                    <span className="text-xs text-gray-500 font-medium">{inquiry.category}</span>
                                </div>
                                <span className="text-xs text-gray-400">{format(new Date(inquiry.created_at), 'yyyy-MM-dd')}</span>
                            </div>
                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{inquiry.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">{inquiry.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
