import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, PenTool, CheckCircle, Lock, ChevronRight, Sparkles, Play, Puzzle, Trophy, Clock, Blocks, Zap, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { GRAMMAR_LESSONS, getGrammarByCategory, GrammarLesson } from '@/lib/constants/grammarLessons';
import GrammarLessonView from '../GrammarLessonView';
import GrammarQuiz from '../GrammarQuiz';
import SentenceBuilder from '../SentenceBuilder';
import { SentenceChallenge, SentencePart } from '@/lib/constants/vocabData';
import { GRAMMAR_SENTENCE_DATA, SentenceData } from '@/lib/constants/grammarSentenceData';
import LessonProgressMap from '../LessonProgressMap';
import { HelpCircle } from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';

type LearningStep = 'list' | 'learn' | 'practice' | 'sentence' | 'complete';

// Generate sentence challenges from grammar sentences
const generateChallenges = (sentences: SentenceData[], topic: string): SentenceChallenge[] => {
    // Take all sentences (fixed order: easy -> hard)
    return sentences.map((s, index) => {
        const cleanSentence = s.sentence.replace(/[.,!?;:'"()]/g, "");
        const words = cleanSentence.split(/\s+/);

        const parts: SentencePart[] = words.map((word, i) => ({
            id: `p-${index}-${i}`,
            text: word,
            type: 'M' as const
        }));

        return {
            id: `challenge-${index}`,
            topic: topic,
            fullSentence: s.sentence,
            translation: s.translation,
            parts: parts,
            correctOrder: parts.map(p => p.id)
        };
    });
};

const Phase2View: React.FC = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const isVietnamese = i18n.language === 'vi';

    const [currentStep, setCurrentStep] = useState<LearningStep>('list');
    const [selectedLesson, setSelectedLesson] = useState<GrammarLesson | null>(null);
    const { completedLessons, completeLesson, getLessonScore } = useUserProgress();
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [learnedLessons, setLearnedLessons] = useState<Set<string>>(new Set());

    // Get specific challenges for the selected lesson
    const sentenceChallenges = useMemo(() => {
        if (!selectedLesson) return [];

        // Get generic sentences as fallback if specific ones missing
        const specificSentences = GRAMMAR_SENTENCE_DATA[selectedLesson.id];

        if (specificSentences && specificSentences.length > 0) {
            return generateChallenges(specificSentences, isVietnamese ? selectedLesson.titleVi : selectedLesson.title);
        }

        return [];
    }, [selectedLesson, isVietnamese]);

    const categories = [
        { id: 'tenses', name: t('englishHub.phase2.categories.tenses'), icon: Clock, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
        { id: 'structures', name: t('englishHub.phase2.categories.structures'), icon: Blocks, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
        { id: 'verbs', name: t('englishHub.phase2.categories.verbs'), icon: Zap, color: 'from-orange-500 to-red-500', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
        { id: 'others', name: t('englishHub.phase2.categories.others'), icon: LayoutGrid, color: 'from-teal-500 to-green-500', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' },
    ];

    const [activeCategory, setActiveCategory] = useState<string>('tenses');

    // Filter lessons by active category
    const filteredLessons = useMemo(() => {
        return getGrammarByCategory(activeCategory as any);
    }, [activeCategory]);

    const handleSelectLesson = (lesson: GrammarLesson, mode: 'learn' | 'practice' | 'sentence') => {
        setSelectedLesson(lesson);
        setCurrentStep(mode);
    };

    // After theory → go to quiz
    const handleLearnComplete = () => {
        if (selectedLesson) {
            setLearnedLessons(prev => new Set([...prev, selectedLesson.id]));
            setCurrentStep('practice');
        }
    };

    // After quiz → go to sentence building
    const handlePracticeComplete = (score: number) => {
        setQuizScore(score);
        setCurrentStep('sentence');
    };

    // After sentence building → mark as completed
    const handleSentenceComplete = (score: number) => {
        if (selectedLesson) {
            const finalScore = Math.round(((quizScore || 0) + score) / 2);
            completeLesson(selectedLesson.id, finalScore);
        }
        setCurrentStep('list');
        setSelectedLesson(null);
        setQuizScore(null);
    };

    const handleCloseLesson = () => {
        setCurrentStep('list');
        setSelectedLesson(null);
    };

    const getLevelBadgeColor = (level: string) => {
        switch (level) {
            case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
            case 'lower-intermediate': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'upper-intermediate': return 'bg-orange-100 text-orange-700 border-orange-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // Active View: Lesson Content
    if (selectedLesson) {
        const activeCategoryData = categories.find(c => c.id === activeCategory);

        // Progress Map Logic
        const stepOrder = ['learn', 'practice', 'sentence'];

        const isLessonGlobalComplete = completedLessons.includes(selectedLesson.id);

        // Calculate completed steps based on persisted state
        // If lesson is globally complete, mark ALL steps as complete
        const completedSteps: string[] = isLessonGlobalComplete
            ? ['learn', 'practice', 'sentence']
            : [];

        if (!isLessonGlobalComplete) {
            // learn is done if in learnedLessons set
            if (learnedLessons.has(selectedLesson.id)) {
                completedSteps.push('learn');
            }

            // practice is done if we have a quiz score OR we are currently past it
            if (quizScore !== null || currentStep === 'sentence' || currentStep === 'complete') {
                completedSteps.push('practice');
                if (!completedSteps.includes('learn')) completedSteps.push('learn');
            }

            // sentence is done only if complete
            if (currentStep === 'complete') {
                completedSteps.push('sentence');
                if (!completedSteps.includes('practice')) completedSteps.push('practice');
                if (!completedSteps.includes('learn')) completedSteps.push('learn');
            }
        }

        const stepsDef = [
            { id: 'learn', label: t('englishHub.phase2.steps.theory'), icon: BookOpen },
            { id: 'practice', label: t('englishHub.phase2.steps.quiz'), icon: HelpCircle },
            { id: 'sentence', label: t('englishHub.phase2.steps.builder'), icon: Blocks },
        ];

        return (
            <>
                {/* Navigation Map - Floating on top */}
                <LessonProgressMap
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onNavigate={(step) => {
                        // Only allow navigation logic if needed (e.g. check if locked)
                        // For now simplified
                        if (step === 'learn' || step === 'practice' || step === 'sentence') {
                            setCurrentStep(step as LearningStep);
                        }
                    }}
                    topic={isVietnamese ? selectedLesson.titleVi : selectedLesson.title}
                    steps={stepsDef}
                />

                {currentStep === 'learn' && (
                    <GrammarLessonView
                        lesson={selectedLesson}
                        theme={activeCategoryData}
                        onComplete={handleLearnComplete}
                        onClose={handleCloseLesson}
                    />
                )}

                {currentStep === 'practice' && (
                    <GrammarQuiz
                        lesson={selectedLesson}
                        theme={activeCategoryData}
                        onComplete={handlePracticeComplete}
                        onClose={handleCloseLesson}
                        isCompleted={isLessonGlobalComplete}
                        initialScore={getLessonScore(selectedLesson.id)}
                    />
                )}

                {currentStep === 'sentence' && (
                    <SentenceBuilder
                        challenges={sentenceChallenges}
                        topic={isVietnamese ? selectedLesson.titleVi : selectedLesson.title}
                        theme={activeCategoryData}
                        onComplete={handleSentenceComplete}
                        onClose={handleCloseLesson}
                    />
                )}

                {currentStep === 'complete' && (
                    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 space-y-6 bg-slate-50`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${activeCategoryData?.color || 'from-indigo-50 to-purple-50'} opacity-10 pointer-events-none`} />
                        {/* Background Decoration */}
                        <div className="absolute inset-0 opacity-40 pointer-events-none"
                            style={{
                                backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
                                backgroundSize: '24px 24px'
                            }}
                        />

                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="w-32 h-32 rounded-full bg-yellow-100 text-yellow-500 flex items-center justify-center shadow-xl z-10"
                        >
                            <Trophy className="w-16 h-16" />
                        </motion.div>
                        <h2 className="text-3xl font-black text-slate-800 z-10">
                            {isVietnamese ? 'Hoàn thành bài học!' : 'Lesson Completed!'}
                        </h2>
                        <div className="flex gap-4 z-10">
                            <button onClick={handleCloseLesson} className="px-8 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300">
                                {isVietnamese ? 'Về danh sách' : 'Back to List'}
                            </button>
                        </div>
                    </div>
                )}
            </>
        );
    }

    // Main View: Category Selection & List
    return (
        <div className="h-screen bg-slate-50 relative overflow-hidden flex flex-col">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            />
            {/* Animated Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>

            {/* Floating Icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <BookOpen className="absolute top-[12%] left-[10%] w-8 h-8 text-blue-200 opacity-40 animate-bounce" style={{ animationDuration: '3s' }} />
                <Blocks className="absolute top-[20%] right-[15%] w-6 h-6 text-purple-300 opacity-50 animate-pulse" style={{ animationDuration: '2.5s' }} />
                <Sparkles className="absolute bottom-[35%] left-[8%] w-7 h-7 text-indigo-200 opacity-40 animate-bounce" style={{ animationDuration: '4s' }} />
                <Clock className="absolute bottom-[25%] right-[12%] w-6 h-6 text-blue-200 opacity-40 animate-pulse" style={{ animationDuration: '3.5s' }} />
                <Zap className="absolute top-[45%] left-[5%] w-5 h-5 text-orange-200 opacity-30 animate-bounce" style={{ animationDuration: '5s' }} />
                <LayoutGrid className="absolute top-[8%] right-[20%] w-5 h-5 text-teal-200 opacity-35 animate-pulse" style={{ animationDuration: '2s' }} />
            </div>

            {/* Header */}
            <div className="flex-none z-20 relative w-full max-w-4xl mx-auto px-4 pt-4 pb-0">
                <div className="text-center relative mb-6">
                    <button
                        onClick={() => navigate('/english')}
                        className="absolute left-0 top-0 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-800 border border-slate-100 z-50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="animate-fade-in flex flex-col items-center">
                        <span className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-1">Phase 2</span>
                        <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm mb-4">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative inline-block">
                                {t('englishHub.phase2.header')}
                            </span>
                        </h1>

                        {/* Category Tabs */}
                        <div className="inline-flex flex-wrap justify-center items-center p-1 rounded-full bg-slate-200/50 backdrop-blur-sm border border-slate-200 mb-6">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2
                                        ${activeCategory === cat.id
                                            ? `bg-white ${cat.text} shadow-sm`
                                            : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    <span><cat.icon className="w-4 h-4" /></span>
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lesson List - Scrollable (Phase 1 Detailed List Style) */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 relative z-10 custom-scrollbar">
                <div className="max-w-xl mx-auto relative pt-8 pb-20">
                    {/* Vertical Connecting Line - Phase 1 Style */}
                    <div className="absolute left-[2.25rem] top-8 bottom-0 w-1 bg-slate-200 rounded-full" />

                    <div className="space-y-10 relative">
                        {filteredLessons.map((lesson, index) => {
                            const activeCategoryData = categories.find(c => c.id === activeCategory);
                            const isCompleted = completedLessons.includes(lesson.id);

                            // Theme Mapping
                            const theme = {
                                bg: activeCategoryData?.bg || 'bg-slate-100',
                                text: activeCategoryData?.text || 'text-slate-500',
                                border: activeCategoryData?.border || 'border-slate-100',
                                hoverText: 'text-indigo-600' // Or derive from category
                            };

                            return (
                                <motion.div
                                    key={lesson.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative pl-20"
                                    onClick={() => handleSelectLesson(lesson, 'learn')}
                                >
                                    {/* Connector Node - Phase 1 Style (Absolute, 4.5rem) */}
                                    <div className={`
                                        absolute left-0 top-1/2 -translate-y-1/2 w-[4.5rem] h-[4.5rem] rounded-full border-4 border-slate-50 shadow-lg z-10 flex items-center justify-center font-black text-xl transition-all duration-500
                                        ${isCompleted
                                            ? 'bg-green-400 text-white scale-110 shadow-green-200'
                                            : `${theme.bg} ${theme.text} scale-100 group-hover:scale-110`}
                                    `}>
                                        {isCompleted ? <CheckCircle className="w-8 h-8" /> : (index + 1)}
                                    </div>

                                    {/* Lesson Card - Phase 1 Style */}
                                    <div className={`
                                        w-full group text-left relative overflow-hidden transition-all duration-300
                                        bg-white rounded-[2.5rem] p-6 shadow-md hover:shadow-xl border-b-4
                                        ${isCompleted ? 'border-green-100' : `${theme.border} hover:-translate-y-1 hover:border-b-8`}
                                        cursor-pointer
                                    `}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className={`text-xl font-bold text-slate-800 group-hover:${theme.hoverText} transition-colors line-clamp-2`}>
                                                {isVietnamese ? lesson.titleVi : lesson.title}
                                            </h4>
                                        </div>

                                        {/* Tags - Phase 1 Style */}
                                        <div className="flex flex-wrap gap-2">
                                            {lesson.sections.slice(0, 3).map((section, idx) => (
                                                <span key={idx} className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium border border-slate-100">
                                                    {isVietnamese ? section.headingVi : section.heading}
                                                </span>
                                            ))}
                                            {lesson.sections.length > 3 && (
                                                <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-400 text-xs font-medium">
                                                    +{lesson.sections.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        {/* Progress Bar - Phase 1 Style (Absolute Bottom) */}
                                        {isCompleted && (
                                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-green-500"></div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Phase2View;
