'use client';

import { useState, useEffect, Suspense } from 'react';
import { api } from '@/utils/axios';
import { Search, Filter, MoreVertical, Shield, ShieldOff, Trash2, CheckCircle, XCircle, Key, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    user_type: 'guest' | 'free' | 'pro' | 'enterprise';
    role: 'user' | 'admin';
    is_active: boolean;
    subscription_end_date?: string;
    created_at: string;
    prompt_count: number;
    project_count: number;
}

function UserManagementContent() {
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');

    // Modal States
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
    }>({ isOpen: false, title: '', message: '' });

    const [gradeModal, setGradeModal] = useState<{
        isOpen: boolean;
        userId: string;
        currentGrade: 'guest' | 'free' | 'pro' | 'enterprise';
    }>({ isOpen: false, userId: '', currentGrade: 'free' });

    const [gradeForm, setGradeForm] = useState<{
        grade: 'free' | 'pro' | 'enterprise';
        duration: '1m' | '1y' | 'manual';
        endDate: string;
    }>({ grade: 'free', duration: '1m', endDate: '' });

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const params: any = {};
            if (searchTerm) params.email = searchTerm;
            if (roleFilter !== 'all') params.role = roleFilter;

            const response = await api.get('/api/admin/users', { params });
            setUsers(response.data);
        } catch (error) {
            toast.error('사용자 목록을 불러오는데 실패했습니다.');
            console.error('Fetch users error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchTerm, roleFilter]);

    const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin') => {
        try {
            await api.patch(`/api/admin/users/${userId}/role`, null, {
                params: { role: newRole }
            });
            toast.success('사용자 권한이 변경되었습니다.');
            fetchUsers();
        } catch (error) {
            toast.error('권한 변경 실패');
        }
    };

    const handleGradeUpdate = async () => {
        try {
            const params: any = {
                user_type: gradeForm.grade
            };

            if (gradeForm.grade === 'pro' || gradeForm.grade === 'enterprise') {
                if (gradeForm.duration === 'manual') {
                    if (!gradeForm.endDate) {
                        toast.error('만료일을 선택해주세요.');
                        return;
                    }
                    params.end_date = new Date(gradeForm.endDate).toISOString();
                } else {
                    params.duration = gradeForm.duration;
                }
            }

            await api.patch(`/api/admin/users/${gradeModal.userId}/grade`, null, { params });
            toast.success('사용자 등급이 변경되었습니다.');
            fetchUsers();
            setGradeModal(prev => ({ ...prev, isOpen: false }));
        } catch (error) {
            toast.error('등급 변경 실패');
        }
    };

    const openGradeModal = (user: User) => {
        setGradeModal({
            isOpen: true,
            userId: user.id,
            currentGrade: user.user_type
        });

        // If user is already pro, try to set initial state? 
        // For now, just reset to default 1m or keep simple.
        setGradeForm({
            grade: user.user_type === 'guest' ? 'free' : user.user_type,
            duration: '1m',
            endDate: user.subscription_end_date ? new Date(user.subscription_end_date).toISOString().split('T')[0] : ''
        });
    };

    const handleDeleteUser = (userId: string) => {
        setConfirmModal({
            isOpen: true,
            title: '사용자 비활성화',
            message: '정말로 이 사용자를 비활성화 하시겠습니까?',
            onConfirm: async () => {
                try {
                    await api.delete(`/api/admin/users/${userId}`);
                    toast.success('사용자가 비활성화되었습니다.');
                    fetchUsers();
                } catch (error) {
                    toast.error('사용자 비활성화 실패');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const handleResetPassword = (userId: string) => {
        setConfirmModal({
            isOpen: true,
            title: '비밀번호 초기화',
            message: '비밀번호를 초기화하시겠습니까?',
            onConfirm: async () => {
                try {
                    const response = await api.post(`/api/admin/users/${userId}/reset-password`);
                    setAlertModal({
                        isOpen: true,
                        title: '초기화 완료',
                        message: response.data.message
                    });
                } catch (error) {
                    toast.error('비밀번호 초기화 실패');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
                    <p className="text-gray-500">전체 사용자 목록을 조회하고 관리합니다.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="이메일 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="all">모든 권한</option>
                        <option value="user">일반 사용자</option>
                        <option value="admin">관리자</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium text-gray-500">사용자 정보</th>
                                <th className="px-6 py-4 font-medium text-gray-500">등급</th>
                                <th className="px-6 py-4 font-medium text-gray-500">만료일</th>
                                <th className="px-6 py-4 font-medium text-gray-500">권한</th>
                                <th className="px-6 py-4 font-medium text-gray-500">상태</th>
                                <th className="px-6 py-4 font-medium text-gray-500 text-center">Prompts</th>
                                <th className="px-6 py-4 font-medium text-gray-500 text-center">Projects</th>
                                <th className="px-6 py-4 font-medium text-gray-500">가입일</th>
                                <th className="px-6 py-4 font-medium text-gray-500 text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        로딩 중...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name || '이름 없음'}</p>
                                                <p className="text-gray-500">{user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => openGradeModal(user)}
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition-opacity ${user.user_type === 'pro'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : user.user_type === 'enterprise'
                                                        ? 'bg-indigo-100 text-indigo-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {user.user_type.toUpperCase()}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {(user.user_type === 'pro' || user.user_type === 'enterprise') && user.subscription_end_date
                                                ? new Date(user.subscription_end_date).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                                                    <XCircle className="w-3 h-3" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                                                {user.prompt_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                                                {user.project_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.open(`/admin/prompts?owner_email=${user.email}`, '_blank')}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="작성한 프롬프트 보기"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResetPassword(user.id)}
                                                    className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                                                    title="비밀번호 초기화"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                {user.role === 'user' ? (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, 'admin')}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        title="관리자로 승격"
                                                    >
                                                        <Shield className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleRoleUpdate(user.id, 'user')}
                                                        className="p-1.5 text-blue-600 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                        title="관리자 권한 해제"
                                                    >
                                                        <ShieldOff className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="사용자 비활성화"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grade Modal */}
            {gradeModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">등급 변경</h3>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">등급 선택</label>
                                <select
                                    value={gradeForm.grade}
                                    onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value as any }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="free">Free</option>
                                    <option value="pro">Pro</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            {(gradeForm.grade === 'pro' || gradeForm.grade === 'enterprise') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">기간 선택</label>
                                    <div className="space-y-3">
                                        <select
                                            value={gradeForm.duration}
                                            onChange={(e) => setGradeForm(prev => ({ ...prev, duration: e.target.value as any }))}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="1m">1개월</option>
                                            <option value="1y">1년</option>
                                            <option value="manual">직접 입력</option>
                                        </select>

                                        {gradeForm.duration === 'manual' && (
                                            <input
                                                type="date"
                                                value={gradeForm.endDate}
                                                onChange={(e) => setGradeForm(prev => ({ ...prev, endDate: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setGradeModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleGradeUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                변경하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
                        <p className="text-gray-600 mb-6">{confirmModal.message}</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmModal.onConfirm}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            {alertModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{alertModal.title}</h3>
                        <p className="text-gray-600 mb-6">{alertModal.message}</p>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function UserManagementPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-gray-500">로딩 중...</div>}>
            <UserManagementContent />
        </Suspense>
    );
}
