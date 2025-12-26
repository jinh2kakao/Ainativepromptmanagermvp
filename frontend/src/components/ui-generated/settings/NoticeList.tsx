import { useState, useEffect } from 'react';
import { fetchNotices } from '@/features/community/api';
import { Notice } from '@/types';
import { Megaphone, ChevronDown, ChevronUp, Pin } from 'lucide-react';
import { format } from 'date-fns';

export function NoticeList() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchNotices();
                setNotices(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return <div className="text-center py-8 text-gray-500">로딩 중...</div>;
    if (notices.length === 0) return <div className="text-center py-8 text-gray-500">등록된 공지사항이 없습니다.</div>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-blue-600" />
                공지사항
            </h2>
            <div className="space-y-3">
                {notices.map((notice) => (
                    <div
                        key={notice.id}
                        className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${expandedId === notice.id ? 'shadow-md ring-1 ring-blue-500/20' : 'hover:border-blue-300'}`}
                    >
                        <button
                            onClick={() => toggleExpand(notice.id)}
                            className="w-full text-left px-5 py-4 flex items-start gap-4 transition-colors"
                        >
                            <div className={`mt-0.5 ${notice.is_pinned ? 'text-blue-600' : 'text-gray-400'}`}>
                                {notice.is_pinned ? <Pin className="w-4 h-4 fill-current" /> : <Megaphone className="w-4 h-4" />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-gray-900 line-clamp-1">{notice.title}</span>
                                    {notice.is_pinned && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded font-bold">공지</span>}
                                </div>
                                <span className="text-xs text-gray-500">{format(new Date(notice.created_at), 'yyyy-MM-dd')}</span>
                            </div>
                            <div className="text-gray-400">
                                {expandedId === notice.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                        </button>

                        {expandedId === notice.id && (
                            <div className="px-5 pb-5 pt-0 pl-14">
                                <div className="prose prose-sm max-w-none text-gray-600 border-t border-gray-100 pt-3 whitespace-pre-wrap">
                                    {notice.content}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
