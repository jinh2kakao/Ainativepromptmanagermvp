import { useState } from 'react';
import { ArrowLeft, User, CreditCard, Receipt } from 'lucide-react';
import { ProfileSection } from './ProfileSection';
import { BillingHistory } from './BillingHistory';
import { PaymentMethods } from './PaymentMethods';

interface SettingsPageProps {
  onBack: () => void;
  userEmail: string;
  userName: string;
  userType: 'guest' | 'free' | 'pro';
}

type SettingsTab = 'profile' | 'billing' | 'payment';

export function SettingsPage({ onBack, userEmail, userName, userType }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as const, label: '프로필', icon: User },
    { id: 'billing' as const, label: '결제 내역', icon: Receipt },
    { id: 'payment' as const, label: '결제 수단', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-gray-900">설정</h1>
              <p className="text-sm text-gray-500">계정 및 결제 정보 관리</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm p-2 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Tabs */}
          <div className="lg:hidden bg-white rounded-xl shadow-sm p-1 flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {activeTab === 'profile' && (
              <ProfileSection userEmail={userEmail} userName={userName} />
            )}
            {activeTab === 'billing' && (
              <BillingHistory userType={userType} />
            )}
            {activeTab === 'payment' && (
              <PaymentMethods userType={userType} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
