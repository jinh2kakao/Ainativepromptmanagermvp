'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui-generated/Sidebar';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/features/auth/store';
import { supabase } from '@/utils/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { SettingsPage } from '@/components/ui-generated/settings/SettingsPage';
import { PricingModal } from '@/components/ui-generated/PricingModal';
import { UserType } from '@/types';
import { usePrompts } from '@/features/prompts/usePromptHooks';
import { getQuotaLimit } from '@/utils/storage';
import { useUser, useUserUsage } from '@/features/auth/useUser';

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isSidebarCollapsed, toggleMobileMenu } = useUIStore();
    const { user: authUser, setSession, setInitialized } = useAuthStore();
    const queryClient = useQueryClient();

    // Global Auth Listener
    useEffect(() => {
        // Skip auth check for public routes (auth, onboarding)
        if (pathname?.startsWith('/auth') || pathname?.startsWith('/onboarding')) {
            setInitialized(true);
            return;
        }

        const initializeAuth = async () => {
            try {
                // Check active session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    // Handle invalid refresh token gracefully
                    if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
                        console.warn('ClientLayout: Session expired or invalid refresh token. Clearing session.');
                        await supabase.auth.signOut();
                        router.push('/auth');
                    } else {
                        console.error('ClientLayout: Session check error:', error.message);
                    }
                    setSession(null);
                    setInitialized(true);
                    return;
                }

                setSession(session);
                setInitialized(true);

                // Handle Guest Migration (if guest_id exists and user is logged in)
                if (session && typeof window !== 'undefined') {
                    const guestId = localStorage.getItem('guest_id');
                    if (guestId) {
                        try {
                            const { migrateGuestData } = await import('@/features/auth/api');
                            await migrateGuestData(guestId);
                            localStorage.removeItem('guest_id');
                            localStorage.removeItem('guest_id_created_at');
                            console.log('Global: Guest data migrated successfully');
                        } catch (migrationError) {
                            console.error('Global: Failed to migrate guest data:', migrationError);
                            // Clear invalid guest_id to prevent repeated errors
                            localStorage.removeItem('guest_id');
                            localStorage.removeItem('guest_id_created_at');
                        }
                    }
                }
            } catch (e) {
                console.error('ClientLayout: Auth initialization failed:', e);
                setSession(null);
                setInitialized(true);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            setSession(session);

            if (_event === 'SIGNED_OUT') {
                console.log('Global: Sign out detected, clearing and resetting query cache');
                queryClient.removeQueries();
                await queryClient.resetQueries();
            }

            // Also check migration on auth state change (e.g. login)
            if (session && typeof window !== 'undefined') {
                const guestId = localStorage.getItem('guest_id');
                if (guestId) {
                    try {
                        const { migrateGuestData } = await import('@/features/auth/api');
                        await migrateGuestData(guestId);
                        localStorage.removeItem('guest_id');
                        localStorage.removeItem('guest_id_created_at');
                        console.log('Global: Guest data migrated successfully (onAuthStateChange)');
                    } catch (error) {
                        console.error('Global: Failed to migrate guest data:', error);
                        // Prevent infinite loop of 500 errors by clearing the potentially invalid guest ID
                        localStorage.removeItem('guest_id');
                        localStorage.removeItem('guest_id_created_at');
                    }
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [setSession, setInitialized, pathname]);

    const { data: userProfile, isLoading: isUserLoading } = useUser();

    // [New] Terms Agreement Redirection
    useEffect(() => {
        // Only trigger if user is fully loaded and authenticated
        if (isUserLoading || !userProfile) return;

        // Route protection: specific check for terms agreement
        const isAgreementPage = pathname === '/auth/agreement';

        // If user hasn't agreed and is not on agreement page, redirect
        // Note: We check if `terms_agreed` is strictly false (or missing if default is false)
        // We assume backend returns `terms_agreed` field now.
        if (userProfile.terms_agreed === false && !isAgreementPage) {
            console.log("Redirecting to Terms Agreement Page...");
            router.replace('/auth/agreement');
        }
    }, [userProfile, isUserLoading, pathname, router]);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

    // Usage Stats
    const { data: usageStats } = useUserUsage();

    const userType: UserType = authUser ? 'free' : 'guest'; // TODO: Check for 'pro' status from user metadata or subscription
    const isAdmin = userProfile?.role === 'admin';

    const quotaLimit = getQuotaLimit(userType);

    // Check if we should show sidebar
    const showSidebar = !pathname?.startsWith('/auth') && !pathname?.startsWith('/admin');

    const handleAuthAction = async () => {
        if (authUser) {
            try {
                await supabase.auth.signOut();
            } catch (error) {
                console.warn('Logout failed (possibly already logged out):', error);
            } finally {
                setSession(null);
                router.push('/auth');
            }
        } else {
            router.push('/auth');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            {showSidebar && (
                <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        </button>
                        <span className="font-bold text-lg text-gray-900">Promit</span>
                    </div>
                    {/* Optional: Add mobile specific actions here */}
                </div>
            )}

            {showSidebar && (
                <Sidebar
                    userType={userType}
                    onSignUp={handleAuthAction}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onOpenPricing={() => setIsPricingModalOpen(true)}
                    usageStats={usageStats}
                    quotaLimit={quotaLimit}
                    userName={authUser?.user_metadata?.full_name || authUser?.email?.split('@')[0]}
                    userEmail={authUser?.email}
                    isAdmin={isAdmin}
                />
            )}

            <main
                id="main-content"
                className={`
            flex-1 min-w-0 transition-all duration-300 ease-in-out
            ${showSidebar ? (isSidebarCollapsed ? 'md:ml-20' : 'md:ml-[228px]') : ''}
        `}
            >
                {children}
            </main>

            {/* Global Modals */}
            {isSettingsOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-white">
                    <SettingsPage
                        onBack={() => setIsSettingsOpen(false)}
                        userEmail={authUser?.email || ''}
                        userName={authUser?.user_metadata?.full_name || ''}
                        userType={userType}
                    />
                </div>
            )}

            {isPricingModalOpen && (
                <PricingModal
                    onClose={() => setIsPricingModalOpen(false)}
                    onUpgrade={() => {
                        console.log('Upgrade clicked');
                        setIsPricingModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
