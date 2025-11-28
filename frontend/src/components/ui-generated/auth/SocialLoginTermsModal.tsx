'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { TermsCheckboxGroup } from './TermsCheckboxGroup';
import { TermsModal } from './TermsModal';

interface SocialLoginTermsModalProps {
    onAgree: () => void;
    onClose: () => void;
    userName?: string;
}

export function SocialLoginTermsModal({ onAgree, onClose, userName }: SocialLoginTermsModalProps) {
    const [serviceTerms, setServiceTerms] = useState(false);
    const [privacyPolicy, setPrivacyPolicy] = useState(false);
    const [ageConfirm, setAgeConfirm] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState<'service' | 'privacy' | null>(null);

    // Check if all required terms are checked
    const allRequiredChecked = serviceTerms && privacyPolicy && ageConfirm;
    const allChecked = serviceTerms && privacyPolicy && ageConfirm && marketingConsent;

    const handleAllCheckedChange = (checked: boolean) => {
        setServiceTerms(checked);
        setPrivacyPolicy(checked);
        setAgeConfirm(checked);
        setMarketingConsent(checked);
    };

    const handleAgree = () => {
        if (!allRequiredChecked) {
            alert('필수 약관에 모두 동의해주세요.');
            return;
        }
        onAgree();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                        <div>
                            <h3 className="text-gray-900 mb-1">환영합니다! 🎉</h3>
                            {userName && (
                                <p className="text-sm text-gray-600">{userName}님</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 space-y-6">
                        <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                            서비스 이용을 위해 아래 약관에 동의해주세요.
                        </p>

                        <TermsCheckboxGroup
                            allChecked={allChecked}
                            onAllCheckedChange={handleAllCheckedChange}
                            serviceTerms={serviceTerms}
                            onServiceTermsChange={setServiceTerms}
                            privacyPolicy={privacyPolicy}
                            onPrivacyPolicyChange={setPrivacyPolicy}
                            ageConfirm={ageConfirm}
                            onAgeConfirmChange={setAgeConfirm}
                            marketingConsent={marketingConsent}
                            onMarketingConsentChange={setMarketingConsent}
                            onViewTerms={setShowTermsModal}
                        />
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                        <button
                            onClick={handleAgree}
                            disabled={!allRequiredChecked}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                        >
                            동의하고 시작하기
                        </button>
                    </div>
                </div>
            </div>

            {/* Terms Detail Modal */}
            {showTermsModal && (
                <TermsModal
                    type={showTermsModal}
                    onClose={() => setShowTermsModal(null)}
                />
            )}
        </>
    );
}
