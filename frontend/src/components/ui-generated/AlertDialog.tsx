import React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';

interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    cancelText?: string;
    confirmText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'default' | 'destructive';
    isConfirm?: boolean; // true for confirm dialog, false for alert
}

export function AlertDialog({
    open,
    onOpenChange,
    title,
    description,
    cancelText = 'Cancel',
    confirmText = 'Confirm',
    onConfirm,
    onCancel,
    variant = 'default',
    isConfirm = true,
}: AlertDialogProps) {
    return (
        <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <AlertDialogPrimitive.Portal>
                <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
                <AlertDialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg sm:rounded-lg md:w-full">
                    <div className="flex flex-col space-y-2 text-center sm:text-left">
                        <AlertDialogPrimitive.Title className="text-lg font-semibold text-gray-900">
                            {title}
                        </AlertDialogPrimitive.Title>
                        {description && (
                            <AlertDialogPrimitive.Description className="text-sm text-gray-500">
                                {description}
                            </AlertDialogPrimitive.Description>
                        )}
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0 mt-2">
                        {isConfirm && (
                            <AlertDialogPrimitive.Cancel asChild>
                                <button
                                    onClick={onCancel}
                                    className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                            </AlertDialogPrimitive.Cancel>
                        )}
                        <AlertDialogPrimitive.Action asChild>
                            <button
                                onClick={onConfirm}
                                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variant === 'destructive'
                                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                    }`}
                            >
                                {confirmText}
                            </button>
                        </AlertDialogPrimitive.Action>
                    </div>
                </AlertDialogPrimitive.Content>
            </AlertDialogPrimitive.Portal>
        </AlertDialogPrimitive.Root>
    );
}
