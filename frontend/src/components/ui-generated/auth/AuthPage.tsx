'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLeftPanel } from './AuthLeftPanel';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';


interface AuthPageProps {
    onAuthSuccess: () => void;
    onGoogleLogin: () => Promise<void>;
    onEmailLogin: (email: string, password: string) => Promise<void>;
    onSignUp: (email: string, password: string) => Promise<void>;
}

export function AuthPage({ onAuthSuccess, onGoogleLogin, onEmailLogin, onSignUp }: AuthPageProps) {
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Panel - Brand & Features (Hidden on Mobile) */}
            <AuthLeftPanel />

            {/* Right Panel - Auth Forms */}
            <div className="w-full md:w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-white relative flex-1">
                {/* Mobile/Tablet Logo */}
                <div className="lg:hidden absolute top-4 left-4 right-4 z-10 max-w-[200px]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">P</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">Promit</span>
                    </div>
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
                                    onGoogleLogin={onGoogleLogin}
                                    onEmailLogin={onEmailLogin}
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
                                    onGoogleLogin={onGoogleLogin}
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
