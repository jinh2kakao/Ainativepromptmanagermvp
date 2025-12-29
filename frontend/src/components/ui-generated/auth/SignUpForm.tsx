import { useState, useEffect } from 'react';
import { Mail, Lock, User, Check, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TermsCheckboxGroup } from './TermsCheckboxGroup';
import { TermsModal } from './TermsModal';
import { useAlert } from '@/components/providers/AlertProvider';
import { api } from '@/utils/axios';
import { checkEmailExists } from '@/features/auth/api';

interface SignUpFormProps {
  onSwitchToLogin: () => void;
  onSignUpSuccess: () => void;
  onSignUp: (email: string, password: string) => Promise<void>;
}

export function SignUpForm({ onSwitchToLogin, onSignUpSuccess, onSignUp }: SignUpFormProps) {
  const { alert } = useAlert();
  const [step, setStep] = useState<'email' | 'profile'>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timer, setTimer] = useState(180); // 3 minutes
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Terms states
  const [allChecked, setAllChecked] = useState(false);
  const [serviceTerms, setServiceTerms] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState<'service' | 'privacy' | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isCodeSent && !isVerified && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isCodeSent, isVerified, timer]);

  // Check if all required terms are checked
  const allRequiredChecked = serviceTerms && privacyPolicy && ageConfirm;

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async () => {
    if (!email) {
      setErrors({ email: '이메일을 입력해주세요' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: '올바른 이메일 형식이 아닙니다' });
      return;
    }

    setErrors({});
    setIsSendingCode(true);

    try {
      // 1. Check if email already exists
      const checkResult = await checkEmailExists(email);
      if (checkResult.exists) {
        await alert('이미 가입된 이메일입니다. 로그인할 수 있도록 이동합니다.');
        onSwitchToLogin();
        return;
      }

      await api.post('/api/verification/send-code', { email });
      setIsCodeSent(true);
      setTimer(180);
      await alert('인증번호가 이메일로 전송되었습니다.');
    } catch (e: any) {
      console.error(e);
      setErrors({ email: e.response?.data?.detail || '이메일 전송에 실패했습니다.' });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      await api.post('/api/verification/verify-code', { email, code: verificationCode });
      setIsVerified(true);
      setStep('profile');
      setErrors({});
    } catch (e: any) {
      setErrors({ code: e.response?.data?.detail || '인증번호가 일치하지 않습니다' });
    }
  };

  const validateProfile = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 8) {
      newErrors.password = '비밀번호는 8자 이상이어야 합니다';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfile()) return;

    if (!allRequiredChecked) {
      await alert('필수 약관에 모두 동의해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      await onSignUp(email, password);
      onSignUpSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 md:mb-8">
        <h2 className="text-gray-900 text-2xl md:text-3xl mb-2">회원가입</h2>
        <p className="text-gray-600 text-sm md:text-base">무료로 시작하고 프롬프트를 저장하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* Step 1: Email Verification */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              이메일
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  disabled={isVerified}
                  placeholder="your@email.com"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all disabled:bg-gray-50 disabled:text-gray-500 ${errors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : isVerified
                      ? 'border-green-300'
                      : 'border-gray-300 focus:ring-blue-500'
                    }`}
                />
                {isVerified && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                )}
              </div>
              {!isVerified && (
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={(isCodeSent && timer > 0) || isSendingCode}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingCode ? '전송 중...' : (isCodeSent ? '재전송' : '인증번호 전송')}
                </button>
              )}
            </div>
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Verification Code Input */}
          <AnimatePresence>
            {isCodeSent && !isVerified && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm text-gray-700">
                      인증번호 6자리
                    </label>
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(timer)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        if (errors.code) setErrors({ ...errors, code: undefined });
                      }}
                      placeholder="123456"
                      maxLength={6}
                      className={`flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all text-center tracking-widest ${errors.code
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length !== 6}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      확인
                    </button>
                  </div>
                  {errors.code && (
                    <p className="text-sm text-red-600">{errors.code}</p>
                  )}
                  {timer === 0 && (
                    <p className="text-sm text-red-600">인증 시간이 만료되었습니다. 재전송 버튼을 눌러주세요.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step 2: Profile Setup */}
        <AnimatePresence>
          {isVerified && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="space-y-5 overflow-hidden"
            >
              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-green-600 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    이메일 인증 완료
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  이름
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    placeholder="홍길동"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.name
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    placeholder="8자 이상"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    placeholder="비밀번호 재입력"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.confirmPassword
                      ? 'border-red-300 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                      }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-5">
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !allRequiredChecked}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    가입 중...
                  </span>
                ) : (
                  '가입 완료'
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Terms Detail Modal */}
      {showTermsModal && (
        <TermsModal
          type={showTermsModal}
          onClose={() => setShowTermsModal(null)}
        />
      )}

      {/* Switch to Login */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
