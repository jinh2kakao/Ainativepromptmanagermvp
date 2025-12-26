'use client';

import { Users, FileText, AlertTriangle, Activity } from 'lucide-react';

export default function AdminDashboard() {
    // Placeholder stats
    const stats = [
        { label: '총 사용자', value: '1,234', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: '총 프롬프트', value: '5,678', change: '+23%', icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: '신고된 콘텐츠', value: '12', change: '-5%', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: '활성 사용자 (DAU)', value: '456', change: '+8%', icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
                <p className="text-gray-500">서비스 현황을 한눈에 확인하세요.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity Placeholder */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">최근 활동 로그</h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <p className="text-sm text-gray-600 flex-1">
                                    <span className="font-medium text-gray-900">user_{i}</span>님이 새로운 프롬프트를 생성했습니다.
                                </p>
                                <span className="text-xs text-gray-400">10분 전</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">빠른 작업</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
                            <span className="block text-sm font-medium text-gray-900 mb-1">공지사항 작성</span>
                            <span className="block text-xs text-gray-500">전체 사용자에게 알림을 보냅니다</span>
                        </button>
                        <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
                            <span className="block text-sm font-medium text-gray-900 mb-1">카테고리 추가</span>
                            <span className="block text-xs text-gray-500">새로운 직무 분류를 등록합니다</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
