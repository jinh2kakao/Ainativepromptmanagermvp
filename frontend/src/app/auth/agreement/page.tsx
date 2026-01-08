'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TermsCheckboxGroup } from '@/components/ui-generated/auth/TermsCheckboxGroup';
import { TermsModal } from '@/components/ui-generated/auth/TermsModal';
import { useAuthStore } from '@/features/auth/store';
import { api } from '@/utils/axios';
import { useAlert } from '@/components/providers/AlertProvider';

export default function TermsAgreementPage() {
    const router = useRouter();
    const { user, isInitialized } = useAuthStore();
    const { alert } = useAlert();

    // Terms states
    const [allChecked, setAllChecked] = useState(false);
    const [serviceTerms, setServiceTerms] = useState(false);
    const [privacyPolicy, setPrivacyPolicy] = useState(false);
    const [ageConfirm, setAgeConfirm] = useState(false);
    const [marketingConsent, setMarketingConsent] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState<'service' | 'privacy' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if all required terms are checked
    const allRequiredChecked = serviceTerms && privacyPolicy && ageConfirm;

    useEffect(() => {
        if (isInitialized && !user) {
            router.replace('/login');
        }
        if (isInitialized && user?.terms_agreed) {
            router.replace('/');
        }
    }, [user, isInitialized, router]);

    // Update all checked state
    useEffect(() => {
        setAllChecked(serviceTerms && privacyPolicy && ageConfirm && marketingConsent);
    }, [serviceTerms, privacyPolicy, ageConfirm, marketingConsent]);

    const handleAllCheckedChange = (checked: boolean) => {
        setAllChecked(checked);
        setServiceTerms(checked);
        setPrivacyPolicy(checked);
        setAgeConfirm(checked);
        setMarketingConsent(checked);
    };

    const handleSubmit = async () => {
        if (!allRequiredChecked) {
            alert('필수 약관에 모두 동의해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/api/auth/agree-terms');
            // Update local user state immediately for better UX
            // Wait, direct manipulation of store is not exposed via setSession, but we can rely on 
            // the redirect logic or force fetch user?
            // Since `useAuthStore` relies on session, and `terms_agreed` is in our `User` object (which comes from backend `/api/me`)
            // we should re-fetch the user to update the store. 
            // Actually `api.post` succeeds, we redirect. ClientLayout/AuthContainer might want to re-check.
            // A full page reload or router push is fine.

            // Let's manually update if we can, but mostly just route to home.
            window.location.href = '/';
        } catch (error) {
            console.error(error);
            alert('약관 동의 처리 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isInitialized || !user) {
        return null; // Or loading spinner
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md">
                <div className="mb-6 md:mb-8">
                    <h2 className="text-gray-900 text-2xl md:text-3xl mb-2 font-bold">약관 동의</h2>
                    <p className="text-gray-600 text-sm md:text-base">
                        서비스 이용을 위해 약관에 동의해주세요.
                    </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-5 mb-6">
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

                <button
                    onClick={handleSubmit}
                    disabled={!allRequiredChecked || isSubmitting}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow font-medium"
                >
                    {isSubmitting ? '처리 중...' : '동의하고 시작하기'}
                </button>

                {/* Terms Detail Modal */}
                {showTermsModal && (
                    <TermsModal
                        type={showTermsModal}
                        onClose={() => setShowTermsModal(null)}
                    />
                )}
            </div>
        </div>
    );
}
