import React from 'react';
import { BookOpen, HelpCircle, Headphones, CheckCircle, Lock } from 'lucide-react';

export type LessonStep = 'learn' | 'quiz' | 'listening';

interface LessonProgressMapProps {
    currentStep: LessonStep;
    completedSteps: LessonStep[];
    onNavigate: (step: LessonStep) => void;
    topic: string;
}

const STEPS: { id: LessonStep; label: string; icon: React.FC<any> }[] = [
    { id: 'learn', label: 'Vocabulary', icon: BookOpen },
    { id: 'quiz', label: 'Mini Quiz', icon: HelpCircle },
    { id: 'listening', label: 'Listening', icon: Headphones },
];

const LessonProgressMap: React.FC<LessonProgressMapProps> = ({ currentStep, completedSteps, onNavigate, topic }) => {

    // Helper colors based on topic (simplified version)
    // Could pass full theme or just use generic distinct colors
    const activeColor = "text-blue-600 bg-blue-50 border-blue-200";
    const completedColor = "text-green-600 bg-green-50 border-green-200";
    const lockedColor = "text-gray-400 bg-gray-100 border-gray-100";

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-white/90 backdrop-blur-md px-2 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-0 transition-all duration-300 animate-in slide-in-from-top-4">

            {STEPS.map((step, idx) => {
                const isCurrent = currentStep === step.id;
                const isCompleted = completedSteps.includes(step.id);
                // ... (logic remains same)

                // Unlock logic:
                // 1. First step is always unlocked
                // 2. Completed steps are unlocked
                // 3. Current step is unlocked
                // 4. Step is unlocked if the PREVIOUS step is completed
                const prevStep = STEPS[idx - 1];
                const isPrevCompleted = !prevStep || completedSteps.includes(prevStep.id);

                const isUnlocked = isCurrent || isCompleted || isPrevCompleted;
                const isLocked = !isUnlocked;

                // Allow navigation if unlocked
                const clickable = isUnlocked;

                const Icon = step.icon;

                return (
                    <div key={step.id} className="flex items-center">
                        <button
                            disabled={!clickable}
                            onClick={() => clickable && onNavigate(step.id)}
                            className={`
                                relative flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300
                                ${isCurrent ? `${activeColor} ring-4 ring-blue-100 shadow-md scale-105` :
                                    isCompleted ? `${completedColor} hover:bg-green-100` :
                                        isUnlocked ? "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 shadow-sm cursor-pointer" :
                                            `${lockedColor} opacity-60 grayscale cursor-not-allowed`}
                            `}
                        >
                            {isCompleted && !isCurrent ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <Icon className={`w-5 h-5 ${isCurrent ? 'animate-pulse' : ''}`} />
                            )}

                            <span className={`text-sm font-bold hidden sm:block ${isCurrent ? 'block' : ''}`}>
                                {step.label}
                            </span>

                            {isLocked && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-gray-400" />}
                        </button>

                        {/* Connector Line */}
                        {idx < STEPS.length - 1 && (
                            <div className={`w-4 sm:w-8 h-1 mx-2 sm:mx-4 rounded-full transition-colors duration-500 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default LessonProgressMap;
