

export function AuthLeftPanel() {
    return (
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col justify-center px-16 py-12">
                {/* Logo */}
                <div className="mb-16">
                    <div className="mb-4 max-w-xs flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                            <span className="text-white text-2xl font-bold">P</span>
                        </div>
                        <span className="text-white text-3xl font-bold tracking-tight">Promit</span>
                    </div>
                    <p className="text-blue-200 text-lg">AI 프롬프트, 자산이 되다</p>
                </div>

                {/* Features */}
                <div className="space-y-6 max-w-md">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                            <span className="text-lg">🎯</span>
                        </div>
                        <div>
                            <h3 className="text-white mb-1">프롬프트 라이브러리</h3>
                            <p className="text-sm text-blue-200">
                                자주 사용하는 프롬프트를 템플릿화하여 재사용하세요
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                            <span className="text-lg">🤖</span>
                        </div>
                        <div>
                            <h3 className="text-white mb-1">P.A.I.R 프레임워크</h3>
                            <p className="text-sm text-blue-200">
                                전문가 수준의 프롬프트를 쉽게 작성하세요
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
                            <span className="text-lg">☁️</span>
                        </div>
                        <div>
                            <h3 className="text-white mb-1">클라우드 동기화</h3>
                            <p className="text-sm text-blue-200">
                                모든 기기에서 프롬프트를 안전하게 관리하세요
                            </p>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="mt-16 border-l-2 border-white/20 pl-4">
                    <p className="text-white/90 italic mb-3">
                        &quot;매일 사용하는 프롬프트를 관리하기 정말 편해졌어요. 어시스턴스가 특히 유용합니다!&quot;
                    </p>
                    <p className="text-sm text-blue-200">
                        — 김진현, Product Owner
                    </p>
                </div>
            </div>
        </div>
    );
}
