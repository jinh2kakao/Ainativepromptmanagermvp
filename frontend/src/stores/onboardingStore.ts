import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingState {
    step: number;
    selectedCategory: string | null;
    selectedTemplateId: string | null;
    selectedTemplate: any | null; // [NEW] Storing full template object
    selectedModel: 'gpt-4' | 'claude-3-5-sonnet' | 'gemini-1-5-pro';
    userInputs: Record<string, string>;
    generatedPrompt: string | null;

    setStep: (step: number) => void;
    setSelectedCategory: (category: string) => void;
    setSelectedTemplateId: (id: string) => void;
    setSelectedTemplate: (template: any) => void; // [NEW]
    setSelectedModel: (model: 'gpt-4' | 'claude-3-5-sonnet' | 'gemini-1-5-pro') => void;
    setUserInput: (key: string, value: string) => void;
    setGeneratedPrompt: (prompt: string) => void;
    reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            step: 1,
            selectedCategory: null,
            selectedTemplateId: null,
            selectedModel: 'gpt-4',
            userInputs: {},
            generatedPrompt: null,
            selectedTemplate: null, // [NEW]

            setStep: (step) => set({ step }),
            setSelectedCategory: (category) => set({ selectedCategory: category }),
            setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),
            setSelectedTemplate: (template) => set({ selectedTemplate: template }), // [NEW]
            setSelectedModel: (model) => set({ selectedModel: model }),
            setUserInput: (key, value) =>
                set((state) => ({
                    userInputs: { ...state.userInputs, [key]: value }
                })),
            setGeneratedPrompt: (prompt) => set({ generatedPrompt: prompt }),
            reset: () => set({
                step: 1,
                selectedCategory: null,
                selectedTemplateId: null,
                selectedTemplate: null, // [NEW]
                userInputs: {},
                generatedPrompt: null
            }),
        }),
        {
            name: 'onboarding-storage',
        }
    )
);
