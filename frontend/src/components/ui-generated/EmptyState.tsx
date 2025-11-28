import { Sparkles, Plus } from 'lucide-react';

interface EmptyStateProps {
    onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px] md:min-h-[500px] py-8">
            <div className="text-center max-w-md mx-auto px-4 md:px-6">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-4 md:mb-6">
                    <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
                </div>

                {/* Text */}
                <h2 className="text-gray-900 mb-2 md:mb-3 text-lg md:text-xl lg:text-2xl">프롬프트 라이브러리를 시작하세요</h2>
                <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">
                    AI 프롬프트를 체계적으로 관리하고, 변수를 활용해 재사용 가능한 템플릿으로 만들어보세요.
                </p>

                {/* CTA Button */}
                <button
                    onClick={onCreateClick}
                    className="inline-flex items-center gap-2 px-5 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base min-h-[48px]"
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    첫 프롬프트 만들기
                </button>

                {/* Quick Tips */}
                <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-left">
                    <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-2 md:gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm md:text-base">📝</span>
                            </div>
                            <div>
                                <h4 className="text-sm text-gray-900 mb-1">일반 모드</h4>
                                <p className="text-xs text-gray-600">자유롭게 프롬프트를 작성하고 변수를 추가하세요</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 md:p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-start gap-2 md:gap-3">
                            <div className="w-7 h-7 md:w-8 md:h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-sm md:text-base">🤖</span>
                            </div>
                            <div>
                                <h4 className="text-sm text-gray-900 mb-1">어시스턴스 모드</h4>
                                <p className="text-xs text-gray-600">P.A.I.R 프레임워크로 구조화된 프롬프트 생성</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
