import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { AuthLeftPanel } from './AuthLeftPanel';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';

interface AuthPageProps {
  onAuthSuccess: () => void;
  onSignUp: (email: string, password: string) => Promise<void>;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  mode: 'login' | 'signup';
  onSwitchToLogin: () => void;
  onSwitchToSignUp: () => void;
}

export function AuthPage({
  onAuthSuccess,
  onSignUp,
  onEmailLogin,
  onGoogleLogin,
  mode,
  onSwitchToLogin,
  onSwitchToSignUp
}: AuthPageProps) {

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Brand & Features (Hidden on Mobile) */}
      <AuthLeftPanel />

      {/* Right Panel - Auth Forms */}
      <div className="w-full md:w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-white relative flex-1">
        {/* Mobile/Tablet Logo */}
        <div className="lg:hidden absolute top-4 left-4 right-4 z-10 max-w-[200px]">
          <Image
            src="/logo-auth.png"
            alt="Promit Logo"
            width={120}
            height={40}
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
                  onSwitchToSignUp={onSwitchToSignUp}
                  onLoginSuccess={onAuthSuccess}
                  onLogin={onEmailLogin}
                  onGoogleLogin={onGoogleLogin}
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
                  onSwitchToLogin={onSwitchToLogin}
                  onSignUpSuccess={onAuthSuccess}
                  onSignUp={onSignUp}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
