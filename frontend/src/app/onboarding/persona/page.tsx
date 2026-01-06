'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Code, PenTool, Briefcase, Video } from 'lucide-react';
import { useOnboardingStore } from '@/stores/onboardingStore';

const personas = [
    {
        id: 'development_engineering',
        icon: Code,
        title: '개발 / 코딩',
        description: '코드 리팩토링, 버그 수정, API 문서',
        color: 'bg-indigo-50 text-indigo-600',
        hover: 'group-hover:ring-indigo-200',
    },
    {
        id: 'marketing_growth',
        icon: PenTool,
        title: '콘텐츠 / 마케팅',
        description: '블로그, 이메일, 광고 카피, SNS',
        color: 'bg-pink-50 text-pink-600',
        hover: 'group-hover:ring-pink-200',
    },
    {
        id: 'business_sales',
        icon: Briefcase,
        title: '기획 / 비즈니스',
        description: '기획안, 비즈니스 이메일, 요약',
        color: 'bg-blue-50 text-blue-600',
        hover: 'group-hover:ring-blue-200',
    },
    {
        id: 'youtube_media',
        icon: Video,
        title: '이미지 / 동영상',
        description: '숏폼 시나리오, 유튜브 기획, 이미지 생성',
        color: 'bg-red-50 text-red-600',
        hover: 'group-hover:ring-red-200',
    },
];

export default function PersonaPage() {
    const router = useRouter();
    const { setSelectedCategory, setStep } = useOnboardingStore();

    const handleSelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setStep(3);
        router.push('/onboarding/magic');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">어떤 작업을 도와드릴까요?</h2>
                <p className="text-gray-600">가장 관련 있는 분야를 선택하면 딱 맞는 템플릿을 추천해드려요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {personas.map((persona, index) => (
                    <motion.div
                        key={persona.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <button
                            onClick={() => handleSelect(persona.id)}
                            className={`group w-full text-left p-6 rounded-2xl border-2 border-transparent bg-white shadow-sm ring-1 ring-gray-100 hover:shadow-xl transition-all duration-300 ${persona.hover} hover:border-gray-200 relative overflow-hidden`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${persona.color}`}>
                                    <persona.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {persona.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {persona.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
