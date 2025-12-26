
import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface ScoreBadgeProps {
    score: number | undefined | null;
    size?: 'sm' | 'md' | 'lg';
    showTooltip?: boolean;
    loading?: boolean;
}

export function ScoreBadge({ score, size = 'md', showTooltip = true, loading = false }: ScoreBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs px-1.5 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    if (loading) {
        return (
            <span
                className={`inline-flex items-center gap-1.5 rounded-full border font-medium cursor-default bg-gray-50 text-gray-400 border-gray-200 ${sizeClasses[size]}`}
            >
                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="opacity-75 hidden sm:inline">Evaluating...</span>
            </span>
        );
    }

    if (score === undefined || score === null) return null;

    let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
    let label = 'N/A';

    if (score >= 80) {
        colorClass = 'bg-green-100 text-green-800 border-green-200';
        label = 'Good';
    } else if (score >= 50) {
        colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        label = 'Warning';
    } else {
        colorClass = 'bg-red-100 text-red-800 border-red-200';
        label = 'Bad';
    }

    const badgeObj = (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium cursor-default ${colorClass} ${sizeClasses[size]}`}
        >
            <span className="font-bold">{score}</span>
            <span className="opacity-75 hidden sm:inline">({label})</span>
        </span>
    );

    if (!showTooltip) return badgeObj;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{badgeObj}</TooltipTrigger>
                <TooltipContent>
                    <p>품질 점수: {score}점 ({label})</p>
                    <p className="text-xs text-gray-400">The Judge가 평가한 점수입니다.</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
