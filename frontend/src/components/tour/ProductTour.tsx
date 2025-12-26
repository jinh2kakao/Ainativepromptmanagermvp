'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Check, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/features/auth/store';

export interface Step {
    targetId: string;
    title: string;
    description: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

export const creationSteps: Step[] = [
    {
        targetId: 'tour-header-title',
        title: '환영합니다!',
        description: 'AI 프롬프트 매니저에 오신 것을 환영합니다.\n게스트 모드로 바로 프롬프트를 작성해보세요.',
        position: 'bottom'
    },
    {
        targetId: 'tour-category-select',
        title: '직무 선택',
        description: '가장 먼저 직무 카테고리를 선택해주세요.\n직무에 맞는 최적의 프롬프트 템플릿을 제공해드립니다.',
        position: 'bottom'
    },
    {
        targetId: 'tour-mode-switch',
        title: '모드 전환',
        description: '자유롭게 작성하는 \'일반 모드\'와\n구조화된 \'어시스턴스 모드\'를 선택할 수 있습니다.',
        position: 'top'
    },
    {
        targetId: 'tour-input-area',
        title: '프롬프트 작성',
        description: '이곳에 내용을 입력하거나 템플릿을 채워넣으세요.\n{{변수}}를 사용하여 재사용 가능한 프롬프트를 만들 수 있습니다.',
        position: 'top'
    },
    {
        targetId: 'tour-save-button',
        title: '생성 완료',
        description: '작성이 끝나면 이 버튼을 눌러주세요.\n멋진 프롬프트가 생성됩니다!',
        position: 'top'
    }
];

interface ProductTourProps {
    steps?: Step[];
    storageKey?: string;
    onFinish?: () => void;
}

export function ProductTour({
    steps = creationSteps,
    storageKey = 'hasSeenGuestTour',
    onFinish
}: ProductTourProps) {
    const { user } = useAuthStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [rect, setRect] = useState<DOMRect | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        // Check if logic should run
        const hasSeen = localStorage.getItem(storageKey);

        // Show if user is guest (user === null) or just for testing purposes if wanted
        // Strict logic: !user && !hasSeen
        if (!user && !hasSeen) {
            // Delay slightly to ensure modal animation finishes or page transition settles
            const timer = setTimeout(() => setIsVisible(true), 800);
            return () => clearTimeout(timer);
        }
    }, [user, mounted, storageKey]);

    useEffect(() => {
        if (!isVisible) return;

        const updateRect = () => {
            const step = steps[currentStep];
            if (!step) return;

            const el = document.getElementById(step.targetId);
            if (el) {
                const r = el.getBoundingClientRect();
                // Ensure we have a valid rect (sometimes 0 if hidden)
                if (r.width > 0 && r.height > 0) {
                    setRect(r);
                }
            }
        };

        // Initial update
        updateRect();

        // Polling for robust element finding (in case of dynamic rendering)
        const interval = setInterval(updateRect, 500);

        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect, true);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect, true);
        };
    }, [currentStep, isVisible, steps]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishTour();
        }
    };

    const finishTour = () => {
        setIsVisible(false);
        localStorage.setItem(storageKey, 'true');
        if (onFinish) onFinish();
    };

    const skipTour = () => {
        finishTour();
    };

    // Auto-scroll to target on step change
    useEffect(() => {
        if (!isVisible || !mounted) return;
        const step = steps[currentStep];
        if (!step) return;

        const el = document.getElementById(step.targetId);
        if (el) {
            // Smooth scroll to element
            el.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center'
            });
        }
    }, [currentStep, isVisible, mounted, steps]); // triggers when step changes

    if (!isVisible || !mounted) return null;
    if (!steps[currentStep]) return null;

    // Calculate Popover Position with Boundary Detection
    const getPopoverStyles = () => {
        // Mobile Layout (Bottom Sheet) - Fixed at bottom
        // Increased breakpoint slightly to cover large phones/small tablets
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

        if (isMobile) {
            return {
                top: 'auto',
                bottom: 24,
                left: 16,
                right: 16,
                width: 'auto',
                maxWidth: '400px',
                margin: '0 auto', // Centers if max-width is hit
                transform: 'none', // Remove transform to prevent jitter
                position: 'fixed' as any
            };
        }

        // Desktop Layout - Popover
        if (!rect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

        const POPOVER_WIDTH = 320;
        const POPOVER_HEIGHT = 200; // Approx height for calculation
        const GAP = 12;
        const VIEWPORT_PADDING = 16;

        const step = steps[currentStep];

        // Helper to check if position is within viewport
        const checkBoundary = (top: number, left: number) => {
            return (
                top >= VIEWPORT_PADDING &&
                top + POPOVER_HEIGHT <= window.innerHeight - VIEWPORT_PADDING &&
                left >= VIEWPORT_PADDING &&
                left + POPOVER_WIDTH <= window.innerWidth - VIEWPORT_PADDING
            );
        };

        // Positions to try in order of preference: requested -> opposite -> alternate axis
        const getPosition = (pos: string) => {
            let top = 0;
            let left = 0;
            let transform = '';

            switch (pos) {
                case 'top':
                    top = rect.top - GAP; // Anchor: Top Center of Target
                    left = rect.left + rect.width / 2;
                    transform = 'translate(-50%, -100%)';
                    break;
                case 'bottom':
                    top = rect.bottom + GAP;
                    left = rect.left + rect.width / 2;
                    transform = 'translate(-50%, 0)';
                    break;
                case 'left':
                    top = rect.top + rect.height / 2;
                    left = rect.left - GAP;
                    transform = 'translate(-100%, -50%)';
                    break;
                case 'right':
                    top = rect.top + rect.height / 2;
                    left = rect.right + GAP;
                    transform = 'translate(0, -50%)';
                    break;
            }
            return { top, left, transform, pos };
        };

        let calculated = getPosition(step.position);

        // Simple flip logic if Primary position is definitely off-screen
        // Note: Exact checking with transforms is complex, so we check edge cases

        // 1. Check Top Edge (for 'top' position)
        if (step.position === 'top' && rect.top < POPOVER_HEIGHT + GAP + VIEWPORT_PADDING) {
            calculated = getPosition('bottom');
        }
        // 2. Check Bottom Edge (for 'bottom' position)
        else if (step.position === 'bottom' && rect.bottom + POPOVER_HEIGHT + GAP + VIEWPORT_PADDING > window.innerHeight) {
            calculated = getPosition('top');
        }
        // 3. Check Left Edge (for 'left' position)
        else if (step.position === 'left' && rect.left < POPOVER_WIDTH + GAP + VIEWPORT_PADDING) {
            calculated = getPosition('right');
        }
        // 4. Check Right Edge (for 'right' position)
        else if (step.position === 'right' && rect.right + POPOVER_WIDTH + GAP + VIEWPORT_PADDING > window.innerWidth) {
            calculated = getPosition('left');
        }

        // Horizontal Clamping for Top/Bottom positions
        if (calculated.pos === 'top' || calculated.pos === 'bottom') {
            const halfWidth = POPOVER_WIDTH / 2;
            // If goes off left
            if (calculated.left - halfWidth < VIEWPORT_PADDING) {
                calculated.left = VIEWPORT_PADDING + halfWidth;
            }
            // If goes off right
            else if (calculated.left + halfWidth > window.innerWidth - VIEWPORT_PADDING) {
                calculated.left = window.innerWidth - VIEWPORT_PADDING - halfWidth;
            }
        }

        return {
            top: calculated.top,
            left: calculated.left,
            transform: calculated.transform
        };
    };

    const popoverStyle = getPopoverStyles();

    return createPortal(
        <div className="fixed inset-0 z-[100] pointer-events-auto font-sans">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* SVG Mask for Spotlight */}
                        <svg className="w-full h-full pointer-events-none">
                            <defs>
                                <mask id="tour-mask">
                                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                    {rect && (
                                        <motion.rect
                                            layoutId="spotlight"
                                            initial={false}
                                            animate={{
                                                x: rect.left - 4,
                                                y: rect.top - 4,
                                                width: rect.width + 8,
                                                height: rect.height + 8,
                                                rx: 8 // rounded corners
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            fill="black"
                                        />
                                    )}
                                </mask>
                            </defs>
                            <rect
                                x="0"
                                y="0"
                                width="100%"
                                height="100%"
                                fill="rgba(0,0,0,0.6)" // Dim background
                                mask="url(#tour-mask)"
                            />
                        </svg>

                        {/* Popover Card */}
                        {rect && (
                            <motion.div
                                layoutId="tour-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1, ...popoverStyle }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                className="absolute w-[320px] bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto ring-1 ring-black/5"
                                style={{ ...popoverStyle, transform: popoverStyle.transform || 'translate(0,0)' }} // Override default transform handling
                            >
                                {/* Card Header Gradient */}
                                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                                                {currentStep + 1}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 leading-none">
                                                {steps[currentStep].title}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={skipTour}
                                            className="text-gray-400 hover:text-gray-600 transition-colors"
                                            aria-label="Skip tour"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line mb-6">
                                        {steps[currentStep].description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1">
                                            {steps.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-200'}`}
                                                />
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleNext}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg transition-all shadow-lg hover:shadow-xl active:scale-95"
                                        >
                                            {currentStep === steps.length - 1 ? (
                                                <>
                                                    시작하기 <Sparkles size={14} />
                                                </>
                                            ) : (
                                                <>
                                                    다음 <ChevronRight size={14} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Target Highlight Ring (Optional, creates a pulsing effect on the target) */}
                        {rect && (
                            <motion.div
                                layoutId="target-ring"
                                initial={false}
                                animate={{
                                    top: rect.top - 4,
                                    left: rect.left - 4,
                                    width: rect.width + 8,
                                    height: rect.height + 8,
                                }}
                                className="absolute border-2 border-blue-500/50 rounded-lg pointer-events-none"
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <div className="absolute inset-0 rounded-lg animate-ping border border-blue-400/30 opacity-75" />
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>,
        document.body
    );
}
