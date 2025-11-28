import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { InvoiceModal } from './InvoiceModal';

interface BillingHistoryProps {
  userType: 'guest' | 'free' | 'pro';
}

interface BillingRecord {
  id: string;
  date: string;
  plan: string;
  amount: string;
  status: 'success' | 'failed';
  invoiceNumber: string;
}

export function BillingHistory({ userType }: BillingHistoryProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<BillingRecord | null>(null);

  // Mock billing data
  const billingData: BillingRecord[] = userType === 'pro' ? [
    {
      id: '1',
      date: '2025-11-01',
      plan: 'Pro (연간)',
      amount: '$48.00',
      status: 'success',
      invoiceNumber: 'INV-2025-11-001',
    },
    {
      id: '2',
      date: '2024-11-01',
      plan: 'Pro (연간)',
      amount: '$48.00',
      status: 'success',
      invoiceNumber: 'INV-2024-11-001',
    },
    {
      id: '3',
      date: '2024-10-15',
      plan: 'Pro (월간)',
      amount: '$5.00',
      status: 'success',
      invoiceNumber: 'INV-2024-10-001',
    },
  ] : [];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-gray-900">결제 내역</h2>
          <p className="text-sm text-gray-500 mt-1">
            모든 결제 내역과 영수증을 확인하세요
          </p>
        </div>

        {billingData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">결제 내역이 없습니다</h3>
            <p className="text-sm text-gray-500">
              Pro 플랜으로 업그레이드하면 결제 내역이 표시됩니다
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      플랜
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      금액
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                      영수증
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {billingData.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            record.status === 'success'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {record.status === 'success' ? '결제 완료' : '결제 실패'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInvoice(record)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          인보이스 보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {billingData.map((record) => (
                <div key={record.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-900">{record.plan}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {record.status === 'success' ? '결제 완료' : '결제 실패'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900">{record.amount}</span>
                    <button
                      onClick={() => setSelectedInvoice(record)}
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      인보이스
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </>
  );
}
