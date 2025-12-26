'use client';

import { FileText, Search } from 'lucide-react';

export default function InvoiceManagementPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">인보이스 관리</h2>
                    <p className="text-gray-500">발행된 인보이스를 조회하고 관리합니다. (추후 연동 예정)</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="인보이스 검색..."
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                            disabled
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">인보이스 시스템 연동 준비 중</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    현재 인보이스 시스템이 연동되지 않았습니다. 추후 결제 시스템 연동 시 자동으로 인보이스가 생성되고 이곳에서 관리할 수 있습니다.
                </p>
            </div>
        </div>
    );
}
