
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
    Cell
} from 'recharts';
import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface EvaluationResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    evaluation: any | null; // Nullable when loading
    score: number;
    isLoading?: boolean;
}

export function EvaluationResultModal({
    isOpen,
    onClose,
    evaluation,
    score,
    isLoading = false
}: EvaluationResultModalProps) {
    // Helper to safely access data or default
    const breakdown = evaluation?.breakdown || {};
    const suggestions = evaluation?.improvement_suggestions || [];
    const safetyStatus = evaluation?.safety_status || 'UNKNOWN';

    // Prepare data for chart (with defaults if empty)
    const data = [
        {
            subject: '구조 (Structure)',
            A: breakdown.structure?.score || 0,
            fullMark: 100,
        },
        {
            subject: '명확성 (Clarity)',
            A: breakdown.clarity?.score || 0,
            fullMark: 100,
        },
        {
            subject: '기법 (Technique)',
            A: breakdown.technique?.score || 0,
            fullMark: 100,
        },
        {
            subject: '효율성 (Efficiency)',
            A: breakdown.efficiency?.score || 0,
            fullMark: 100,
        },
    ];

    const getScoreColor = (s: number) => {
        if (s >= 80) return '#22c55e'; // Green
        if (s >= 50) return '#eab308'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw]">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">프롬프트 설계 평가 결과</DialogTitle>
                        <div className="flex items-center gap-2">
                            {isLoading ? (
                                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                            ) : (
                                safetyStatus === 'SAFE' ? (
                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                        <CheckCircle2 className="w-3 h-3" /> Safe
                                    </span>
                                ) : safetyStatus === 'UNSAFE' ? (
                                    <span className="flex items-center gap-1 text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded-full border border-red-200">
                                        <AlertTriangle className="w-3 h-3" /> Unsafe
                                    </span>
                                ) : null
                            )}
                        </div>
                    </div>
                    <DialogDescription>
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                AI가 프롬프트를 정밀 분석 중입니다...
                            </span>
                        ) : (
                            <>APEF v2.0 기준에 따른 상세 분석 결과입니다. 현재 점수는 <span className="font-bold text-primary text-lg">{score}점</span>입니다.</>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-8">
                    {/* Chart Section */}
                    <div className="flex flex-col md:flex-row gap-8 items-start justify-center">
                        <div className="w-full md:w-1/2 h-[400px] flex items-center justify-center">
                            {isLoading ? (
                                <div className="w-[300px] h-[300px] rounded-full bg-gray-100 animate-pulse flex items-center justify-center">
                                    <div className="w-[200px] h-[200px] rounded-full bg-gray-200 animate-ping opacity-20" />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 14, fontWeight: 600 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                        <Radar
                                            name="Score"
                                            dataKey="A"
                                            stroke="#8884d8"
                                            fill="#8884d8"
                                            fillOpacity={0.6}
                                        />
                                        <RechartsTooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Detailed Metrics */}
                        <div className="w-full md:w-1/2 grid grid-cols-1 gap-6">
                            {isLoading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="flex flex-col gap-2">
                                        <div className="flex justify-between">
                                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3">
                                            <div className="h-3 bg-gray-200 rounded-full w-2/3 animate-pulse" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                data.map((item) => (
                                    <div key={item.subject} className="flex flex-col gap-2">
                                        <div className="flex justify-between text-base">
                                            <span className="font-medium text-gray-700">{item.subject}</span>
                                            <span className="font-bold text-lg" style={{ color: getScoreColor(item.A) }}>{item.A}/100</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-3">
                                            <div
                                                className="h-3 rounded-full transition-all duration-500 shadow-sm"
                                                style={{ width: `${item.A}%`, backgroundColor: getScoreColor(item.A) }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Detailed Breakdown Text */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isLoading ? (
                            <>
                                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 space-y-4">
                                    <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 space-y-4">
                                    <div className="h-6 w-32 bg-blue-100 rounded animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-full bg-blue-100 rounded animate-pulse" />
                                        <div className="h-4 w-5/6 bg-blue-100 rounded animate-pulse" />
                                        <div className="h-4 w-4/6 bg-blue-100 rounded animate-pulse" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-yellow-500" /> 주요 발견 사항</h4>
                                    <ul className="text-sm space-y-2 text-gray-600">
                                        {breakdown.structure?.missing_elements?.length > 0 && (
                                            <li><span className="font-medium text-red-500">누락된 구조:</span> {breakdown.structure.missing_elements.join(', ')}</li>
                                        )}
                                        {breakdown.clarity?.ambiguity_warnings?.length > 0 && (
                                            <li><span className="font-medium text-orange-500">모호한 표현:</span> {breakdown.clarity.ambiguity_warnings.join(', ')}</li>
                                        )}
                                        {breakdown.efficiency?.comment && (
                                            <li><span className="font-medium text-blue-500">효율성:</span> {breakdown.efficiency.comment}</li>
                                        )}
                                    </ul>
                                </div>

                                {/* Improvement Suggestions */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <h4 className="font-semibold mb-2 text-blue-800">개선 제안</h4>
                                    <ul className="text-sm space-y-2 text-blue-700 list-disc list-inside">
                                        {suggestions.map((s: string, idx: number) => (
                                            <li key={idx}>{s}</li>
                                        ))}
                                        {suggestions.length === 0 && <li>특별한 개선 사항이 없습니다.</li>}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={onClose}>닫기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
