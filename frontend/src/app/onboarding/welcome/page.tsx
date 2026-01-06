'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function WelcomePage() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Native Prompt Manager</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
                    AI가 내 마음을 읽은 것처럼<br />
                    <span className="text-blue-600">완벽한 프롬프트</span>를 10초 만에.
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    복잡한 프롬프트 엔지니어링 없이, 전문가 수준의 답변을 얻으세요.
                    지금 바로 나에게 딱 맞는 템플릿을 찾아드립니다.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <button
                    onClick={() => router.push('/onboarding/persona')}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5"
                >
                    무료로 체험하기
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />

                    <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/40" />
                </button>
            </motion.div>

            {/* Social Proof / Background Element could go here */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="pt-12 grid grid-cols-3 gap-8 text-gray-400 text-sm font-medium"
            >
                <div>⚡️ 10,000+ Prompts Generated</div>
                <div>👥 used by Pro Marketers</div>
                <div>🚀 90% Time Saved</div>
            </motion.div>
        </div>
    );
}
