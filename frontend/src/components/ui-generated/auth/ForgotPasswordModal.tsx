import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { checkEmailExists, requestPasswordReset } from '@/features/auth/api';
import { supabase } from '@/utils/supabase/client';
import { useAlert } from '@/components/providers/AlertProvider';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const { alert } = useAlert();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Check if email exists & get provider
            const { exists, provider } = await checkEmailExists(email);

            if (!exists) {
                setError('가입되지 않은 이메일입니다.');
                setIsLoading(false);
                return;
            }

            // 2. Handle Google Provider
            if (provider === 'google') {
                await alert('구글 계정으로 가입된 이메일입니다.\n구글 로그인을 이용해주세요.');
                setIsLoading(false);
                return;
            }

            // 3. Send Reset Email (Gmail API via Backend)
            await requestPasswordReset(email);

            setIsSuccess(true);
        } catch (e: any) {
            console.error(e);
            const errorMessage = e.response?.data?.detail || e.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">비밀번호 찾기</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {isSuccess ? (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <h4 className="text-gray-900 font-medium mb-2">메일 발송 완료</h4>
                            <p className="text-gray-600 text-sm mb-6">
                                <strong>{email}</strong>으로 비밀번호 재설정 링크를 보냈습니다.<br />
                                메일함을 확인해주세요.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                닫기
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">이메일</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="example@email.com"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? '확인 중...' : '비밀번호 재설정 메일 받기'}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
