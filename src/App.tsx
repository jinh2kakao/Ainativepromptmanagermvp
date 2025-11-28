import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Toaster, toast } from 'sonner@2.0.3';
import { Prompt, ViewMode, UserType } from './types';
import { Header } from './components/Header';
import { PromptListView } from './components/PromptListView';
import { PromptDetailPage } from './components/PromptDetailPage';
import { PromptModal } from './components/PromptModal';
import { RunModal } from './components/RunModal';
import { PricingModal } from './components/PricingModal';
import { QuotaWarning } from './components/QuotaWarning';
import { EmptyState } from './components/EmptyState';
import { AuthPage } from './components/auth/AuthPage';
import { SettingsPage } from './components/settings/SettingsPage';
import {
  loadPrompts,
  savePrompts,
  loadViewMode,
  saveViewMode,
  loadUserType,
  saveUserType,
  canCreatePrompt,
  getQuotaLimit,
  getQuotaWarning
} from './utils/storage';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [userType, setUserType] = useState<UserType>('guest');
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [runningPrompt, setRunningPrompt] = useState<Prompt | null>(null);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [currentUserId] = useState('user_guest_001'); // Mock user ID
  
  // Load data on mount and check auth status
  useEffect(() => {
    // Check if user is authenticated (in real app, check token/session)
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    
    if (authStatus) {
      setPrompts(loadPrompts());
      setViewMode(loadViewMode());
      setUserType(loadUserType());
    }
  }, []);
  
  const handleAuthSuccess = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
    setUserType('free'); // Upgrade to free tier on signup/login
    saveUserType('free');
  };
  
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    saveViewMode(mode);
  };
  
  const handleCreatePrompt = () => {
    if (!canCreatePrompt(prompts.length, userType)) {
      // Show pricing modal if limit exceeded
      setShowPricingModal(true);
      return;
    }
    setEditingPrompt(null);
    setShowPromptModal(true);
  };

  const handleUpgradeToPro = () => {
    // Mock upgrade to Pro
    setUserType('pro');
    saveUserType('pro');
    toast.success('Pro 플랜으로 업그레이드되었습니다! 🎉');
  };
  
  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setShowPromptModal(true);
  };
  
  const handleSavePrompt = (data: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    let updatedPrompts: Prompt[];
    
    if (editingPrompt) {
      // Update existing
      updatedPrompts = prompts.map((p) =>
        p.id === editingPrompt.id
          ? { ...data, id: p.id, createdAt: p.createdAt, updatedAt: now }
          : p
      );
    } else {
      // Create new
      const newPrompt: Prompt = {
        ...data,
        id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: now,
        updatedAt: now,
        isPublic: data.isPublic ?? false,
        ownerId: currentUserId
      };
      updatedPrompts = [...prompts, newPrompt];
    }
    
    setPrompts(updatedPrompts);
    savePrompts(updatedPrompts);
    setShowPromptModal(false);
    setEditingPrompt(null);
  };
  
  const handleDeletePrompt = (id: string) => {
    const updatedPrompts = prompts.filter((p) => p.id !== id);
    setPrompts(updatedPrompts);
    savePrompts(updatedPrompts);
  };
  
  const handleRunPrompt = (prompt: Prompt) => {
    setRunningPrompt(prompt);
    setShowRunModal(true);
  };
  
  const handleSignUp = () => {
    // Redirect to auth page (logout)
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPromptId(prompt.id);
  };

  const handleBackToList = () => {
    setSelectedPromptId(null);
  };

  const handleTogglePublic = (id: string, isPublic: boolean) => {
    const updatedPrompts = prompts.map((p) =>
      p.id === id ? { ...p, isPublic } : p
    );
    setPrompts(updatedPrompts);
    savePrompts(updatedPrompts);
  };
  
  const quotaLimit = getQuotaLimit(userType);
  const quotaWarning = getQuotaWarning(prompts.length, userType);
  const canCreate = canCreatePrompt(prompts.length, userType);
  
  // Find selected prompt
  const selectedPrompt = selectedPromptId 
    ? prompts.find((p) => p.id === selectedPromptId) 
    : null;
  
  // Show Auth Page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      </>
    );
  }

  // Show Settings Page
  if (showSettings) {
    return (
      <>
        <Toaster position="top-right" />
        <SettingsPage
          onBack={() => setShowSettings(false)}
          userEmail="user@example.com"
          userName="홍길동"
          userType={userType}
        />
      </>
    );
  }

  // Show Detail Page if a prompt is selected
  if (selectedPrompt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <PromptDetailPage
          prompt={selectedPrompt}
          currentUserId={currentUserId}
          onBack={handleBackToList}
          onEdit={(prompt) => {
            setEditingPrompt(prompt);
            setShowPromptModal(true);
          }}
          onDelete={handleDeletePrompt}
          onRun={handleRunPrompt}
          onTogglePublic={handleTogglePublic}
        />
        
        {/* Modals */}
        {showPromptModal && (
          <PromptModal
            prompt={editingPrompt}
            onSave={handleSavePrompt}
            onClose={() => {
              setShowPromptModal(false);
              setEditingPrompt(null);
            }}
          />
        )}
        
        {showRunModal && runningPrompt && (
          <RunModal
            prompt={runningPrompt}
            onClose={() => {
              setShowRunModal(false);
              setRunningPrompt(null);
            }}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <Header
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        userType={userType}
        onSignUp={handleSignUp}
        onOpenSettings={() => setShowSettings(true)}
        onOpenPricing={() => setShowPricingModal(true)}
        promptCount={prompts.length}
        quotaLimit={quotaLimit}
      />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Quota Warning */}
        {quotaWarning && (
          <div className="mb-4 md:mb-6">
            <QuotaWarning
              message={quotaWarning}
              severity={prompts.length >= quotaLimit ? 'error' : 'warning'}
              onSignUp={userType === 'guest' ? handleSignUp : undefined}
            />
          </div>
        )}
        
        {/* Create Button - Only show if prompts exist */}
        {prompts.length > 0 && (
          <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-gray-900 text-lg md:text-xl">My Prompts</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                <span className="font-medium">{prompts.length}</span> prompt{prompts.length === 1 ? '' : 's'} saved
              </p>
            </div>
            
            <div className="relative w-full sm:w-auto">
              <button
                onClick={handleCreatePrompt}
                disabled={!canCreate}
                className={`w-full sm:w-auto px-4 md:px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 text-sm md:text-base min-h-[44px] ${
                  canCreate
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={
                  !canCreate
                    ? 'Sign up for free to create more prompts'
                    : 'Create new prompt'
                }
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                New Prompt
              </button>
              {!canCreate && userType === 'guest' && (
                <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-full sm:w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-10 shadow-xl">
                  <p>{quotaLimit}개 프롬프트 제한에 도달했습니다.</p>
                  <button
                    onClick={handleSignUp}
                    className="mt-2 text-blue-300 hover:text-blue-200 underline"
                  >
                    무료 회원가입하여 계속하기
                  </button>
                </div>
              )}
              {!canCreate && userType === 'free' && (
                <div className="absolute top-full mt-2 left-0 sm:right-0 sm:left-auto w-full sm:w-64 bg-gray-900 text-white text-xs rounded-lg p-3 z-10 shadow-xl">
                  <p>50개 프롬프트 제한에 도달했습니다.</p>
                  <button
                    onClick={() => setShowPricingModal(true)}
                    className="mt-2 text-blue-300 hover:text-blue-200 underline"
                  >
                    Pro로 업그레이드하여 무제한 사용하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Content */}
        {prompts.length === 0 ? (
          <EmptyState onCreateClick={handleCreatePrompt} />
        ) : (
          <PromptListView
            prompts={prompts}
            viewMode={viewMode}
            onPromptClick={handlePromptClick}
            onRun={handleRunPrompt}
            onEdit={handleEditPrompt}
            onDelete={handleDeletePrompt}
          />
        )}
      </main>
      
      {/* Modals */}
      {showPromptModal && (
        <PromptModal
          prompt={editingPrompt}
          onSave={handleSavePrompt}
          onClose={() => {
            setShowPromptModal(false);
            setEditingPrompt(null);
          }}
        />
      )}
      
      {showRunModal && runningPrompt && (
        <RunModal
          prompt={runningPrompt}
          onClose={() => {
            setShowRunModal(false);
            setRunningPrompt(null);
          }}
        />
      )}

      {showPricingModal && (
        <PricingModal
          onClose={() => setShowPricingModal(false)}
          onUpgrade={handleUpgradeToPro}
        />
      )}
    </div>
  );
}
