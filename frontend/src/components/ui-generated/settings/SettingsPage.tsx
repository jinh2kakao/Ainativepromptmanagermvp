import { useState } from 'react';
import { ArrowLeft, User, CreditCard, Receipt, Users, Megaphone, HelpCircle, MessageSquare } from 'lucide-react';
import { ProfileSection } from './ProfileSection';
import { BillingHistory } from './BillingHistory';
import { PaymentMethods } from './PaymentMethods';
import { TeamSettings } from './TeamSettings';
import { NoticeList } from './NoticeList';
import { FAQList } from './FAQList';
import { QnAList } from './QnAList';

interface SettingsPageProps {
  onBack: () => void;
  userEmail: string;
  userName: string;
  userType: 'guest' | 'free' | 'pro' | 'enterprise';
}

type SettingsTab = 'profile' | 'billing' | 'payment' | 'team' | 'notice' | 'faq' | 'qna';

export function SettingsPage({ onBack, userEmail, userName, userType }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as const, label: '프로필', icon: User },
    { id: 'team' as const, label: '팀 관리', icon: Users },
    { id: 'billing' as const, label: '결제 내역', icon: Receipt },
    { id: 'payment' as const, label: '결제 수단', icon: CreditCard },
    { id: 'notice' as const, label: '공지사항', icon: Megaphone },
    { id: 'faq' as const, label: '자주 묻는 질문', icon: HelpCircle },
    { id: 'qna' as const, label: '1:1 문의', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">설정</h1>
            <p className="text-sm text-gray-500">계정 및 결제 정보 관리</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              <div className="flex items-start gap-3">
                <button
                  onClick={onBack}
                  className="mt-1 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">설정</h1>
                  <p className="text-sm text-gray-500">계정 및 결제 정보 관리</p>
                </div>
              </div>
              <nav className="bg-white rounded-xl shadow-sm p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === tab.id
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
            </div>
          </aside>

          {/* Mobile Tabs */}
          <div className="lg:hidden bg-white rounded-xl shadow-sm p-1 flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${activeTab === tab.id
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
            {activeTab === 'team' && (
              <TeamSettings />
            )}
            {activeTab === 'billing' && (
              <BillingHistory userType={userType} />
            )}
            {activeTab === 'payment' && (
              <PaymentMethods userType={userType} />
            )}
            {activeTab === 'notice' && <NoticeList />}
            {activeTab === 'faq' && <FAQList />}
            {activeTab === 'qna' && <QnAList userEmail={userEmail} />}
          </main>
        </div>
      </div>
    </div>
  );
}
