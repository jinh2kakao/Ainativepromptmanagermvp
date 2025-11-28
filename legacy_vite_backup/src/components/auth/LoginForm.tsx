import { useState } from 'react';
import { Mail, Lock, Chrome } from 'lucide-react';
import { SocialLoginTermsModal } from './SocialLoginTermsModal';

interface LoginFormProps {
  onSwitchToSignUp: () => void;
  onLoginSuccess: () => void;
}

export function LoginForm({ onSwitchToSignUp, onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSocialTermsModal, setShowSocialTermsModal] = useState(false);
  
  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Mock login - replace with actual API call
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess();
    }, 1500);
  };
  
  const handleGoogleLogin = () => {
    // Mock Google OAuth - check if new user
    const isNewUser = Math.random() > 0.5; // Mock: 50% chance of new user
    
    if (isNewUser) {
      // Show terms modal for new user
      setShowSocialTermsModal(true);
    } else {
      // Existing user - login directly
      onLoginSuccess();
    }
  };
  
  const handleSocialTermsAgree = () => {
    setShowSocialTermsModal(false);
    onLoginSuccess();
  };
  
  return (
    <div className="w-full max-w-md">
      <div className="mb-6 md:mb-8">
        <h2 className="text-gray-900 text-2xl md:text-3xl mb-2">로그인</h2>
        <p className="text-gray-600 text-sm md:text-base">프롬프트 라이브러리에 접속하세요</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 md:gap-3 shadow-sm hover:shadow text-sm md:text-base min-h-[48px]"
        >
          <Chrome className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
          <span className="text-gray-700">Google로 계속하기</span>
        </button>
        
        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">또는 이메일로 시작하기</span>
          </div>
        </div>
        
        {/* Email */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            이메일
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="your@email.com"
              className={`w-full pl-9 md:pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm md:text-base min-h-[48px] ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
          )}
        </div>
        
        {/* Password */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">
            비밀번호
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              placeholder="••••••••"
              className={`w-full pl-9 md:pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all text-sm md:text-base min-h-[48px] ${
                errors.password
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
          )}
        </div>
        
        {/* Forgot Password */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            비밀번호 찾기
          </button>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow text-sm md:text-base min-h-[48px]"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              로그인 중...
            </span>
          ) : (
            '로그인'
          )}
        </button>
      </form>
      
      {/* Switch to Sign Up */}
      <div className="mt-6 md:mt-8 text-center">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <button
            onClick={onSwitchToSignUp}
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            회원가입
          </button>
        </p>
      </div>
      
      {/* Social Login Terms Modal */}
      {showSocialTermsModal && (
        <SocialLoginTermsModal
          onAgree={handleSocialTermsAgree}
          onClose={() => setShowSocialTermsModal(false)}
          userName="Google 사용자"
        />
      )}
    </div>
  );
}
