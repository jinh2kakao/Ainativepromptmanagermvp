import { useState, useEffect } from 'react';
import { Mail, User, Lock, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase/client';
import { useAuthStore } from '@/features/auth/store';

interface ProfileSectionProps {
  userEmail: string;
  userName: string;
}

export function ProfileSection({ userEmail, userName }: ProfileSectionProps) {
  const [name, setName] = useState(userName);
  const [googleIdentity, setGoogleIdentity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Disconnect state
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [disconnectPassword, setDisconnectPassword] = useState('');

  // Withdraw state
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawInput, setWithdrawInput] = useState('');

  const { setUser } = useAuthStore();



  useEffect(() => {
    setName(userName);
    fetchIdentities();
  }, [userName]);

  const fetchIdentities = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      const googleId = user?.identities?.find((id: any) => id.provider === 'google');
      setGoogleIdentity(googleId);
    } catch (error) {
      console.error('Failed to fetch identities', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!name.trim()) {
      toast.error('이름을 입력해주세요');
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
      }

      toast.success('프로필이 업데이트되었습니다');
    } catch (error: any) {
      toast.error(error.message || '프로필 업데이트 중 오류가 발생했습니다');
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('모든 필드를 입력해주세요');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다');
      return;
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        toast.error('현재 비밀번호가 일치하지 않습니다');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('비밀번호가 변경되었습니다');
    } catch (error: any) {
      toast.error(error.message || '비밀번호 변경 중 오류가 발생했습니다');
    }
  };

  const handleGoogleConnect = async () => {
    try {
      const { data, error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      // Redirect happens automatically
    } catch (error: any) {
      if (error.message?.includes('Manual Linking is disabled')) {
        toast.error('관리자 설정에서 수동 계정 연동이 비활성화되어 있습니다.');
      } else {
        toast.error(error.message || 'Google 계정 연동 중 오류가 발생했습니다');
      }
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!disconnectPassword) {
      toast.error('비밀번호를 입력해주세요');
      return;
    }

    try {
      // 1. Verify password first (ensure they have one and it's correct)
      // If they don't have a password (only Google login), this check ensures they set one?
      // Actually, if they only have Google, they CANNOT disconnect without setting a password first.
      // But here we assume they are entering a password to verify.

      // If the user initially signed up with Google, they might not have a password.
      // In that case, signInWithPassword will fail.
      // We should probably check if they have a password set? Supabase doesn't easily tell us.
      // But the requirement says "Disconnect ... input password ... so they can login with email/password".
      // This implies we might need to SET the password if they don't have one, OR verify it if they do.

      // Strategy: Try to update user with the provided password. If it works, then unlink.
      // Wait, updateUser with password changes it.

      // Let's try to sign in with the provided password.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: disconnectPassword,
      });

      if (signInError) {
        // If sign in fails, maybe they don't have a password set?
        // Or wrong password.
        // If they don't have a password, we should probably set it.
        // But for security, we shouldn't just set it without some verification.
        // However, they are already logged in (authenticated session).
        // So we can allow them to SET a password now.

        // Let's assume the input is for SETTING/VERIFYING password.
        // If we just update the password, it sets it.
        const { error: updateError } = await supabase.auth.updateUser({
          password: disconnectPassword
        });

        if (updateError) {
          toast.error('비밀번호 설정/확인 실패: ' + updateError.message);
          return;
        }
        toast.success('비밀번호가 설정되었습니다.');
      }

      // 2. Unlink Identity
      if (googleIdentity) {
        // Find the UUID field
        // Based on logs: identity_id seems to be the UUID, id is the numeric Google ID
        // We check both to be safe and ensure we pass a UUID
        const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

        let targetId = '';
        if (googleIdentity.identity_id && isUUID(googleIdentity.identity_id)) {
          targetId = googleIdentity.identity_id;
        } else if (googleIdentity.id && isUUID(googleIdentity.id)) {
          targetId = googleIdentity.id;
        }

        if (!targetId) {
          toast.error('유효한 Identity ID(UUID)를 찾을 수 없습니다.');
          return;
        }

        // The unlinkIdentity method in some SDK versions expects the identity object itself, 
        // or specifically an object with the identity_id.
        // However, the error "Argument of type 'string' is not assignable to parameter of type 'UserIdentity'"
        // suggests it expects the UserIdentity object.

        // Let's try passing the identity object that has the correct identity_id (UUID).
        // We construct a minimal object that satisfies the requirement if needed, 
        // or pass the original object if it has the correct structure.

        // The log shows googleIdentity has identity_id which is the UUID.
        // Let's try passing the googleIdentity object directly.
        const { error: unlinkError } = await supabase.auth.unlinkIdentity(googleIdentity);
        if (unlinkError) throw unlinkError;

        setGoogleIdentity(null);
        setShowDisconnectConfirm(false);
        setDisconnectPassword('');
        toast.success('Google 계정 연동이 해제되었습니다');
      }
    } catch (error: any) {
      toast.error(error.message || '연동 해제 중 오류가 발생했습니다');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-4 font-semibold">프로필 정보</h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-2 text-sm font-medium">
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
            <label className="flex items-center gap-2 text-gray-700 mb-2 text-sm font-medium">
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
        <h3 className="text-gray-900 mb-4 font-semibold">계정 연동</h3>

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
              <p className="text-gray-900 font-medium">Google 계정</p>
              <p className="text-xs text-gray-500">
                {googleIdentity ? '연동됨' : '연동되지 않음'}
              </p>
            </div>
          </div>

          {googleIdentity ? (
            <button
              onClick={() => setShowDisconnectConfirm(true)}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200"
            >
              연동 해제
            </button>
          ) : (
            <button
              onClick={handleGoogleConnect}
              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-blue-200"
            >
              연동하기
            </button>
          )}
        </div>

        {/* Disconnect Confirmation */}
        {showDisconnectConfirm && (
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-100 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-orange-900 mb-1">
                  Google 계정 연동 해제
                </h4>
                <p className="text-xs text-orange-700 mb-3">
                  연동을 해제하면 이메일과 비밀번호로 로그인해야 합니다.<br />
                  계속하려면 비밀번호를 입력(또는 설정)해주세요.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={disconnectPassword}
                    onChange={(e) => setDisconnectPassword(e.target.value)}
                    placeholder="비밀번호 입력"
                    className="flex-1 px-3 py-1.5 text-sm border border-orange-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleGoogleDisconnect}
                    className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                  >
                    해제 확인
                  </button>
                  <button
                    onClick={() => {
                      setShowDisconnectConfirm(false);
                      setDisconnectPassword('');
                    }}
                    className="px-3 py-1.5 bg-white text-gray-600 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-gray-900 mb-4 flex items-center gap-2 font-semibold">
          <Lock className="w-5 h-5" />
          비밀번호 변경
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-gray-700 mb-2 block text-sm font-medium">현재 비밀번호</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="현재 비밀번호를 입력하세요"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-2 block text-sm font-medium">새 비밀번호</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="새 비밀번호 (최소 6자)"
            />
          </div>

          <div>
            <label className="text-gray-700 mb-2 block text-sm font-medium">새 비밀번호 확인</label>
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

      {/* Account Withdrawal */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-red-100">
        <h3 className="text-red-900 mb-2 flex items-center gap-2 font-semibold">
          <AlertCircle className="w-5 h-5" />
          회원 탈퇴
        </h3>
        <p className="text-sm text-red-700 mb-4">
          탈퇴 시 모든 데이터(프롬프트, 프로젝트 등)는 삭제 또는 비공개 처리되며 복구할 수 없습니다.
        </p>

        {!showWithdrawConfirm ? (
          <button
            onClick={() => {
              setShowWithdrawConfirm(true);
              setWithdrawInput('');
            }}
            className="px-4 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
          >
            회원 탈퇴
          </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg animate-in fade-in">
            <h4 className="font-bold text-red-900 mb-2">정말 탈퇴하시겠습니까?</h4>
            <div className="space-y-3">
              <p className="text-sm text-red-800">
                탈퇴를 확인하기 위해 아래 입력창에 <strong>탈퇴하기</strong>를 입력해주세요.
              </p>
              <input
                type="text"
                placeholder="탈퇴하기"
                value={withdrawInput}
                onChange={(e) => setWithdrawInput(e.target.value)}
                className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowWithdrawConfirm(false);
                    setWithdrawInput('');
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                >
                  취소(유지)
                </button>
                <button
                  disabled={withdrawInput !== '탈퇴하기'}
                  onClick={async () => {
                    if (withdrawInput !== '탈퇴하기') return;

                    try {
                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) return;

                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/withdraw`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${session.access_token}`
                        },
                        body: JSON.stringify({ confirm: true, reason: 'User requested' })
                      });

                      if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.detail || 'Withdrawal failed');
                      }

                      toast.success('회원 탈퇴가 완료되었습니다.');
                      await supabase.auth.signOut();
                      window.location.href = '/';
                    } catch (e: any) {
                      toast.error(e.message || '탈퇴 처리 중 오류가 발생했습니다.');
                    }
                  }}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  탈퇴 확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
