import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthLeftPanel } from './AuthLeftPanel';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import logoImage from 'figma:asset/0f7c59f317008526d70ca4e2dd331616b44b0927.png';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Brand & Features (Hidden on Mobile) */}
      <AuthLeftPanel />
      
      {/* Right Panel - Auth Forms */}
      <div className="w-full md:w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-white relative flex-1">
        {/* Mobile/Tablet Logo */}
        <div className="lg:hidden absolute top-4 left-4 right-4 z-10 max-w-[200px]">
          <img 
            src={logoImage} 
            alt="Promit Logo" 
            className="h-5 md:h-6 w-auto object-contain"
          />
        </div>
        
        <div className="w-full max-w-md mt-14 md:mt-0 px-2 md:px-0">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <LoginForm
                  onSwitchToSignUp={() => setMode('signup')}
                  onLoginSuccess={onAuthSuccess}
                />
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SignUpForm
                  onSwitchToLogin={() => setMode('login')}
                  onSignUpSuccess={onAuthSuccess}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
