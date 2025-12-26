
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/axios';
import { RefreshCw, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Optimization {
    id: string;
    template_id: string;
    original_content: string;
    optimized_content: string;
    details: any;
    created_at: string;
    template_status: string;
    initial_score: number;
}

export default function OptimizationDashboard() {
    const [optimizations, setOptimizations] = useState<Optimization[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOptimizations = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/api/crucible/optimizations');
            setOptimizations(res.data);
        } catch (error) {
            toast.error('Failed to load optimizations');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOptimizations();

        let channel: any;

        // Dynamic import to avoid SSR issues if client.ts uses browser globals
        import('@/utils/supabase/client').then(({ supabase }) => {
            channel = supabase
                .channel('optimizations-change')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'prompt_ops',
                        table: 'optimizations',
                    },
                    (payload: any) => {
                        console.log('New optimization received!', payload);
                        toast.success('Gemini가 프롬프트를 튜닝했습니다! 🚀');
                        fetchOptimizations();
                    }
                )
                .subscribe();
        });

        return () => {
            if (channel) import('@/utils/supabase/client').then(({ supabase }) => supabase.removeChannel(channel));
        };
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">최적화 현황 (Project Crucible)</h2>
                    <p className="text-gray-500">자동 최적화된 템플릿 이력을 실시간으로 모니터링합니다.</p>
                </div>
                <button
                    onClick={fetchOptimizations}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    새로고침
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">Status</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Initial Score</th>
                                <th className="px-6 py-4 font-medium text-gray-500 w-1/3">Original</th>
                                <th className="px-6 py-4 font-medium text-gray-500 w-1/3">Optimized</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Reasoning</th>
                                <th className="px-6 py-4 font-medium text-gray-500">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {optimizations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        최적화 이력이 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                optimizations.map((opt) => (
                                    <tr key={opt.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${opt.template_status === 'APPROVED'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {opt.template_status === 'APPROVED' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                {opt.template_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-red-600">
                                            {opt.initial_score}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs truncate text-gray-500" title={opt.original_content}>
                                                {opt.original_content}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs truncate text-gray-900 font-medium" title={opt.optimized_content}>
                                                {opt.optimized_content}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500 max-w-xs">
                                            {opt.details?.reasoning || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">
                                            {new Date(opt.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
