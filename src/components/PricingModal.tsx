import { X, Check } from 'lucide-react';
import { useState } from 'react';

interface PricingModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export function PricingModal({ onClose, onUpgrade }: PricingModalProps) {
  const [isYearly, setIsYearly] = useState(true);

  const handleUpgrade = () => {
    onUpgrade();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-8 md:pt-12 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
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
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isYearly ? 'bg-white' : 'bg-white/30'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-transform duration-200 ${
                  isYearly ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-blue-200'}`}>
              연간 결제
            </span>
            <span className={`px-2 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs transition-opacity duration-200 ${
              isYearly ? 'opacity-100' : 'opacity-0'
            }`}>
              20% 할인
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* Basic (Free) */}
            <div className="border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-gray-900">Basic</h3>
                  <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
                    현재 이용 중
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl text-gray-900">$0</span>
                  <span className="text-gray-500 text-sm">/월</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">프롬프트 50개 저장</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">기본 P.A.I.R 프레임워크</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">변수 치환 기능</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-600 text-sm">리스트 & 칸반 뷰</span>
                </div>
              </div>

              <button
                disabled
                className="w-full px-4 py-3 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
              >
                현재 플랜
              </button>
            </div>

            {/* Pro (Upgrade) */}
            <div className="border-2 border-blue-500 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs rounded-bl-lg">
                인기
              </div>

              <div className="mb-4">
                <h3 className="text-gray-900 mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ${isYearly ? '4' : '5'}
                  </span>
                  <span className="text-gray-500 text-sm">/월</span>
                </div>
                {isYearly && (
                  <p className="text-xs text-gray-500 mt-1">
                    연 $48 청구 (월 $60 대비 $12 절약)
                  </p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900 text-sm">무제한 프롬프트 저장</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900 text-sm">고급 P.A.I.R 템플릿 (20+ 직무)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900 text-sm">클라우드 동기화</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900 text-sm">우선 고객 지원</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900 text-sm">팀 협업 기능 (향후)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-900 text-sm">프롬프트 버전 관리 (향후)</span>
                </div>
              </div>

              <button
                onClick={handleUpgrade}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Pro 시작하기
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                언제든지 취소 가능 • 환불 보장
              </p>
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
  );
}
