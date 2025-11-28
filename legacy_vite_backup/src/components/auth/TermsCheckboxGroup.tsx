import { Check } from 'lucide-react';

interface TermsCheckboxGroupProps {
  allChecked: boolean;
  onAllCheckedChange: (checked: boolean) => void;
  serviceTerms: boolean;
  onServiceTermsChange: (checked: boolean) => void;
  privacyPolicy: boolean;
  onPrivacyPolicyChange: (checked: boolean) => void;
  ageConfirm: boolean;
  onAgeConfirmChange: (checked: boolean) => void;
  marketingConsent: boolean;
  onMarketingConsentChange: (checked: boolean) => void;
  onViewTerms: (type: 'service' | 'privacy') => void;
}

export function TermsCheckboxGroup({
  allChecked,
  onAllCheckedChange,
  serviceTerms,
  onServiceTermsChange,
  privacyPolicy,
  onPrivacyPolicyChange,
  ageConfirm,
  onAgeConfirmChange,
  marketingConsent,
  onMarketingConsentChange,
  onViewTerms,
}: TermsCheckboxGroupProps) {
  return (
    <div className="space-y-4">
      {/* Select All */}
      <div className="pb-4 border-b border-gray-200">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => onAllCheckedChange(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-gray-300 rounded group-hover:border-blue-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
              {allChecked && <Check className="w-3 h-3 md:w-4 md:h-4 text-white" strokeWidth={3} />}
            </div>
          </div>
          <span className="text-gray-900 select-none leading-relaxed">
            전체 동의
          </span>
        </label>
      </div>

      {/* Individual Items */}
      <div className="space-y-3 md:space-y-4">
        {/* Service Terms */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={serviceTerms}
              onChange={(e) => onServiceTermsChange(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-blue-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
              {serviceTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          </div>
          <span className="flex-1 text-gray-700 text-sm md:text-base select-none leading-relaxed">
            <span className="text-red-500">(필수)</span> 서비스 이용약관 동의
          </span>
          <button
            type="button"
            onClick={() => onViewTerms('service')}
            className="text-gray-500 text-sm underline hover:text-gray-700 transition-colors flex-shrink-0"
          >
            보기
          </button>
        </label>

        {/* Privacy Policy */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={privacyPolicy}
              onChange={(e) => onPrivacyPolicyChange(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-blue-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
              {privacyPolicy && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          </div>
          <span className="flex-1 text-gray-700 text-sm md:text-base select-none leading-relaxed">
            <span className="text-red-500">(필수)</span> 개인정보 수집 및 이용 동의
          </span>
          <button
            type="button"
            onClick={() => onViewTerms('privacy')}
            className="text-gray-500 text-sm underline hover:text-gray-700 transition-colors flex-shrink-0"
          >
            보기
          </button>
        </label>

        {/* Age Confirmation */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={ageConfirm}
              onChange={(e) => onAgeConfirmChange(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-blue-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
              {ageConfirm && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          </div>
          <span className="flex-1 text-gray-700 text-sm md:text-base select-none leading-relaxed">
            <span className="text-red-500">(필수)</span> 만 14세 이상입니다
          </span>
        </label>

        {/* Marketing Consent */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => onMarketingConsentChange(e.target.checked)}
              className="peer sr-only"
            />
            <div className="w-5 h-5 border-2 border-gray-300 rounded group-hover:border-blue-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
              {marketingConsent && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
          </div>
          <span className="flex-1 text-gray-700 text-sm md:text-base select-none leading-relaxed">
            <span className="text-gray-500">(선택)</span> 마케팅 정보 수신 동의
          </span>
        </label>
      </div>
    </div>
  );
}
