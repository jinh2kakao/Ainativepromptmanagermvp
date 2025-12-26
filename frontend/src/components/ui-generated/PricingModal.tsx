import { X, Check } from 'lucide-react';
import { useState } from 'react';

interface PricingModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export function PricingModal({ onClose, onUpgrade }: PricingModalProps) {
  const [isYearly, setIsYearly] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await Promise.resolve(onUpgrade());
    } finally {
      onClose();
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto animate-in fade-in duration-200">
      <div className="min-h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl animate-in zoom-in-95 duration-200 relative">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 md:p-8 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h2 className="text-white mb-2">무제한 프롬프트 자산을 만드세요 🚀</h2>
              <p className="text-blue-100 text-sm md:text-base">
                생산성을 극대화하고 워크플로우를 자동화하세요
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <span className={`text-sm ${!isYearly ? 'text-white' : 'text-blue-200'}`}>
                월간 결제
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? 'bg-white' : 'bg-white/30'
                  }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-transform duration-200 ${isYearly ? 'translate-x-7' : 'translate-x-0'
                    }`}
                />
              </button>
              <span className={`text-sm ${isYearly ? 'text-white' : 'text-blue-200'}`}>
                연간 결제
              </span>
              <span className={`px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs transition-opacity duration-200 ${isYearly ? 'opacity-100' : 'opacity-0'
                }`}>
                20% 할인
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Basic (Free) */}
              <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-900 font-semibold">Basic</h3>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-md text-xs">
                      무료
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">$0</span>
                    <span className="text-gray-500 text-sm">/월</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-600 text-sm">무제한 프롬프트 저장</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-600 text-sm">AI 최적화 (일 5회)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-600 text-sm">설계 평가 (일 5회)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    <span className="text-gray-600 text-sm">기본 템플릿</span>
                  </div>
                </div>

                <button
                  disabled
                  className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-400 rounded-lg text-sm cursor-not-allowed"
                >
                  현재 플랜
                </button>
              </div>

              {/* Pro */}
              <div className="border border-blue-200 rounded-xl p-6 bg-blue-50/50 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-bl-lg font-medium">
                  인기
                </div>

                <div className="mb-4">
                  <h3 className="text-gray-900 font-semibold mb-2">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      ${isYearly ? '4' : '5'}
                    </span>
                    <span className="text-gray-500 text-sm">/월</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-900 text-sm font-medium">무제한 프롬프트 저장</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-900 text-sm">AI 최적화 (일 40회)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-900 text-sm">설계 평가 (일 40회)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-900 text-sm">전문가용 템플릿</span>
                  </div>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                >
                  {isLoading ? '처리 중...' : 'Pro 시작하기'}
                </button>
              </div>

              {/* Enterprise */}
              <div className="border border-purple-200 rounded-xl p-6 bg-white flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-900 font-semibold">Enterprise</h3>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">문의</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-900 text-sm">AI 최적화 (일 80회)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-900 text-sm">설계 평가 (일 80회)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-900 text-sm font-medium">팀 생성 및 멤버 초대</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-900 text-sm">전담 매니저 지원</span>
                  </div>
                </div>

                <button
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm font-medium"
                >
                  도입 문의
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                결제는 안전하게 암호화되어 처리됩니다 🔒
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
