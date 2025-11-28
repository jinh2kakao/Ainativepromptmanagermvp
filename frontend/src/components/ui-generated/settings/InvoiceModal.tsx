'use client';

import { X, Download, Printer } from 'lucide-react';

interface InvoiceModalProps {
    invoice: {
        id: string;
        date: string;
        plan: string;
        amount: string;
        status: 'success' | 'failed';
        invoiceNumber: string;
    };
    onClose: () => void;
}

export function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Mock download
        alert('PDF 다운로드가 시작됩니다 (데모용)');
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-gray-900">인보이스</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="PDF 다운로드"
                        >
                            <Download className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={handlePrint}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="인쇄"
                        >
                            <Printer className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-8 space-y-8">
                    {/* Company Info */}
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xl">✨</span>
                                </div>
                                <h3 className="text-gray-900">Prompt Manager</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                AI Native Workflow Solutions<br />
                                San Francisco, CA 94102<br />
                                support@promptmanager.ai
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm text-gray-500 mb-1">인보이스 번호</p>
                            <p className="text-gray-900">{invoice.invoiceNumber}</p>
                            <p className="text-sm text-gray-500 mt-3 mb-1">발행일</p>
                            <p className="text-gray-900">
                                {new Date(invoice.date).toLocaleDateString('ko-KR')}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500 mb-2">청구 대상</p>
                        <p className="text-gray-900">홍길동</p>
                        <p className="text-sm text-gray-600">user@example.com</p>
                    </div>

                    {/* Invoice Items */}
                    <div>
                        <table className="w-full">
                            <thead className="border-b-2 border-gray-300">
                                <tr>
                                    <th className="text-left py-3 text-gray-700">항목</th>
                                    <th className="text-right py-3 text-gray-700">금액</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="py-4">
                                        <p className="text-gray-900">{invoice.plan}</p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(invoice.date).toLocaleDateString('ko-KR')} - {
                                                invoice.plan.includes('연간')
                                                    ? new Date(new Date(invoice.date).setFullYear(new Date(invoice.date).getFullYear() + 1)).toLocaleDateString('ko-KR')
                                                    : new Date(new Date(invoice.date).setMonth(new Date(invoice.date).getMonth() + 1)).toLocaleDateString('ko-KR')
                                            }
                                        </p>
                                    </td>
                                    <td className="py-4 text-right text-gray-900">{invoice.amount}</td>
                                </tr>
                            </tbody>
                            <tfoot className="border-t-2 border-gray-300">
                                <tr>
                                    <td className="py-4 text-gray-900">총 금액</td>
                                    <td className="py-4 text-right text-gray-900">{invoice.amount}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                            <p className="text-green-900">결제 완료</p>
                            <p className="text-sm text-green-700">
                                {new Date(invoice.date).toLocaleDateString('ko-KR')}에 결제되었습니다
                            </p>
                        </div>
                        <div className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                            PAID
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="text-center text-sm text-gray-500 pt-4 border-t">
                        <p>문의사항이 있으시면 support@promptmanager.ai로 연락주세요</p>
                        <p className="mt-2">감사합니다!</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
