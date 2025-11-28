'use client';

import { useState } from 'react';
import { Mail, User, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSectionProps {
    userEmail: string;
    userName: string;
}

export function ProfileSection({ userEmail, userName }: ProfileSectionProps) {
    const [name, setName] = useState(userName);
    const [googleConnected, setGoogleConnected] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleNameUpdate = () => {
        if (!name.trim()) {
            toast.error('이름을 입력해주세요');
            return;
        }
        toast.success('프로필이 업데이트되었습니다');
    };

    const handlePasswordChange = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('모든 필드를 입력해주세요');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('새 비밀번호가 일치하지 않습니다');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('비밀번호는 최소 8자 이상이어야 합니다');
            return;
        }

        // Mock password change
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('비밀번호가 변경되었습니다');
    };

    return (
        <div className="space-y-6">
            {/* Profile Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-gray-900 mb-4">프로필 정보</h2>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="flex items-center gap-2 text-gray-700 mb-2">
                            <User className="w-4 h-4" />
                            <span>이름</span>
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="이름을 입력하세요"
                            />
                            <button
                                onClick={handleNameUpdate}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">저장</span>
                            </button>
                        </div>
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                        <label className="flex items-center gap-2 text-gray-700 mb-2">
                            <Mail className="w-4 h-4" />
                            <span>이메일</span>
                        </label>
                        <input
                            type="email"
                            value={userEmail}
                            disabled
                            className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            이메일은 변경할 수 없습니다
                        </p>
                    </div>
                </div>
            </div>

            {/* Google Account Connection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-gray-900 mb-4">계정 연동</h3>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-gray-900">Google 계정</p>
                            <p className="text-xs text-gray-500">
                                {googleConnected ? '연동됨' : '연동되지 않음'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setGoogleConnected(!googleConnected);
                            toast.success(googleConnected ? 'Google 계정 연동이 해제되었습니다' : 'Google 계정이 연동되었습니다');
                        }}
                        className={`relative w-12 h-6 rounded-full transition-colors ${googleConnected ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                    >
                        <div
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${googleConnected ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Password Change */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    비밀번호 변경
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="text-gray-700 mb-2 block">현재 비밀번호</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="현재 비밀번호를 입력하세요"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 mb-2 block">새 비밀번호</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="새 비밀번호 (최소 8자)"
                        />
                    </div>

                    <div>
                        <label className="text-gray-700 mb-2 block">새 비밀번호 확인</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="새 비밀번호를 다시 입력하세요"
                        />
                    </div>

                    <button
                        onClick={handlePasswordChange}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        비밀번호 변경
                    </button>
                </div>
            </div>
        </div>
    );
}
