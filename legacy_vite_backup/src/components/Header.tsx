import { useState, useRef, useEffect } from 'react';
import { List, LayoutGrid, User, LogOut, Settings } from 'lucide-react';
import { ViewMode, UserType } from '../types';
import logoImage from 'figma:asset/0f7c59f317008526d70ca4e2dd331616b44b0927.png';

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  userType: UserType;
  onSignUp: () => void;
  onOpenSettings: () => void;
  onOpenPricing?: () => void;
  promptCount: number;
  quotaLimit: number;
}

export function Header({ viewMode, onViewModeChange, userType, onSignUp, onOpenSettings, onOpenPricing, promptCount, quotaLimit }: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-6 h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <img 
              src={logoImage} 
              alt="Promit Logo" 
              className="h-5 md:h-6 lg:h-7 w-auto object-contain"
            />
            <div className="min-w-0 hidden xl:block">
              <p className="text-xs text-gray-500">AI Native Workflow</p>
            </div>
          </div>
          
          {/* View Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 md:p-1 rounded-lg shadow-inner">
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md flex items-center gap-1.5 md:gap-2 transition-all duration-200 min-h-[36px] md:min-h-0 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <List className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden md:inline text-sm">List</span>
            </button>
            <button
              onClick={() => onViewModeChange('kanban')}
              className={`px-2 md:px-4 py-1.5 md:py-2 rounded-md flex items-center gap-1.5 md:gap-2 transition-all duration-200 min-h-[36px] md:min-h-0 ${
                viewMode === 'kanban'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden md:inline text-sm">Kanban</span>
            </button>
          </div>
          
          {/* User Status */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            {/* Quota Display - Only on Desktop */}
            <div className="text-right hidden lg:block">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{promptCount}</span> / {quotaLimit === Infinity ? '∞' : quotaLimit}
              </p>
              <p className="text-xs text-gray-500 capitalize">{userType}</p>
            </div>

            {/* Upgrade Button for Free Users */}
            {userType === 'free' && onOpenPricing && (
              <button
                onClick={onOpenPricing}
                className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-1.5 md:gap-2 shadow-md hover:shadow-lg text-sm min-h-[40px] md:min-h-0"
              >
                <span className="hidden sm:inline">Pro 업그레이드</span>
                <span className="sm:hidden">Pro</span>
              </button>
            )}
            
            {userType === 'guest' ? (
              <button
                onClick={onSignUp}
                className="px-3 md:px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-1.5 md:gap-2 shadow-md hover:shadow-lg text-sm min-h-[40px] md:min-h-0"
              >
                <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Join</span>
              </button>
            ) : (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <User className="w-5 h-5" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm text-gray-900">홍길동</p>
                      <p className="text-xs text-gray-500">user@example.com</p>
                      <p className="text-xs text-blue-600 mt-1 capitalize">{userType} Plan</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenSettings();
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">설정</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSignUp();
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-red-600 border-t border-gray-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">로그아웃</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
