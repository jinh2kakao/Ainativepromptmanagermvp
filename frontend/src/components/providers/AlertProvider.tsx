'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertDialog } from '@/components/ui-generated/AlertDialog';

interface AlertContextType {
    alert: (message: string, title?: string) => Promise<void>;
    confirm: (message: string, title?: string, options?: { confirmText?: string; cancelText?: string; variant?: 'default' | 'destructive' }) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<{
        title: string;
        description: string;
        isConfirm: boolean;
        confirmText: string;
        cancelText: string;
        variant: 'default' | 'destructive';
        resolve: (value: any) => void;
    } | null>(null);

    const alert = useCallback((message: string, title: string = '알림') => {
        return new Promise<void>((resolve) => {
            setConfig({
                title,
                description: message,
                isConfirm: false,
                confirmText: '확인',
                cancelText: '',
                variant: 'default',
                resolve: () => {
                    setIsOpen(false);
                    resolve();
                },
            });
            setIsOpen(true);
        });
    }, []);

    const confirm = useCallback((
        message: string,
        title: string = '확인',
        options?: { confirmText?: string; cancelText?: string; variant?: 'default' | 'destructive' }
    ) => {
        return new Promise<boolean>((resolve) => {
            setConfig({
                title,
                description: message,
                isConfirm: true,
                confirmText: options?.confirmText || '확인',
                cancelText: options?.cancelText || '취소',
                variant: options?.variant || 'default',
                resolve: (result: boolean) => {
                    setIsOpen(false);
                    resolve(result);
                },
            });
            setIsOpen(true);
        });
    }, []);

    const handleConfirm = () => {
        if (config) {
            config.resolve(true); // For confirm: true, For alert: void (ignored)
        }
    };

    const handleCancel = () => {
        if (config) {
            config.resolve(false);
        }
    };

    return (
        <AlertContext.Provider value={{ alert, confirm }}>
            {children}
            {config && (
                <AlertDialog
                    open={isOpen}
                    onOpenChange={(open) => {
                        if (!open) handleCancel();
                    }}
                    title={config.title}
                    description={config.description}
                    isConfirm={config.isConfirm}
                    confirmText={config.confirmText}
                    cancelText={config.cancelText}
                    variant={config.variant}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}
