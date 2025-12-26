import { useState, useEffect } from 'react';
import { fetchFAQs } from '@/features/community/api';
import { FAQ } from '@/types';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export function FAQList() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchFAQs();
                setFaqs(data);
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

    // Group by category
    const grouped = faqs.reduce((acc, faq) => {
        if (!acc[faq.category]) acc[faq.category] = [];
        acc[faq.category].push(faq);
        return acc;
    }, {} as Record<string, FAQ[]>);

    if (loading) return <div className="text-center py-8 text-gray-500">로딩 중...</div>;

    return (
        <div className="space-y-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                자주 묻는 질문
            </h2>

            {Object.entries(grouped).map(([category, items]) => (
                <div key={category} className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider px-1">{category}</h3>
                    <div className="space-y-2">
                        {items.map((faq) => (
                            <div
                                key={faq.id}
                                className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${expandedId === faq.id ? 'shadow-md ring-1 ring-blue-500/20' : 'hover:border-blue-300'}`}
                            >
                                <button
                                    onClick={() => toggleExpand(faq.id)}
                                    className="w-full text-left px-5 py-4 flex items-start gap-4 transition-colors"
                                >
                                    <span className="text-blue-600 font-bold shrink-0">Q.</span>
                                    <span className="flex-1 font-medium text-gray-900">{faq.question}</span>
                                    <div className="text-gray-400 shrink-0">
                                        {expandedId === faq.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </button>

                                {expandedId === faq.id && (
                                    <div className="px-5 pb-5 pt-0 flex gap-4">
                                        <span className="text-gray-400 font-bold shrink-0">A.</span>
                                        <div className="text-gray-600 whitespace-pre-wrap flex-1 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {faqs.length === 0 && <div className="text-center text-gray-500">등록된 FAQ가 없습니다.</div>}
        </div>
    );
}
