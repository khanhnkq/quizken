import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, CheckCircle, Star, Sparkles, Layout, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CEFR_LEVEL_DATA, CEFRLevelData, CEFRLesson } from '../../../lib/constants/cefrLessons';
import { TOEIC_DATA } from '../../../lib/constants/toeicData';
import FlashcardSet from '../FlashcardSet';
import SentenceBuilder from '../SentenceBuilder';
import { useUserProgress } from '../../../hooks/useUserProgress';
import MiniQuiz from '../MiniQuiz';
import LessonProgressMap, { LessonStep } from '../LessonProgressMap';
import { CEFRBadge } from '../../cefr/CEFRBadge';

// Helper to get theme colors for CEFR levels
const getLevelTheme = (level: string) => {
    const colorMap: Record<string, any> = {
        'A1': { bg: 'bg-green-50', text: 'text-green-600', accent: 'bg-green-500', border: 'border-green-100', light: 'bg-green-100' },
        'A2': { bg: 'bg-lime-50', text: 'text-lime-600', accent: 'bg-lime-500', border: 'border-lime-100', light: 'bg-lime-100' },
        'B1': { bg: 'bg-amber-50', text: 'text-amber-600', accent: 'bg-amber-500', border: 'border-amber-100', light: 'bg-amber-100' },
        'B2': { bg: 'bg-orange-50', text: 'text-orange-600', accent: 'bg-orange-500', border: 'border-orange-100', light: 'bg-orange-100' },
        'C1': { bg: 'bg-red-50', text: 'text-red-600', accent: 'bg-red-500', border: 'border-red-100', light: 'bg-red-100' },
        'C2': { bg: 'bg-rose-50', text: 'text-rose-600', accent: 'bg-rose-500', border: 'border-rose-100', light: 'bg-rose-100' },
    };
    return colorMap[level] || colorMap['A1'];
};

const Phase1View = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isLessonCompleted, completeLesson, getLessonScore, skipLevel, isLevelSkipped } = useUserProgress();
    const [selectedLesson, setSelectedLesson] = useState<CEFRLesson | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showSentenceBuilder, setShowSentenceBuilder] = useState(false);
    const [expandedLevel, setExpandedLevel] = useState<CEFRLevelData | null>(null);
    const [completedSteps, setCompletedSteps] = useState<LessonStep[]>([]);

    // Effect to sync persistent progress when selectedLesson changes
    React.useEffect(() => {
        if (selectedLesson) {
            const baseKey = selectedLesson.id;
            const steps: LessonStep[] = [];

            // If the main lesson is marked as completed (legacy or summary), unlock everything
            const isMainCompleted = isLessonCompleted(baseKey);

            if (isMainCompleted) {
                // If main lesson is done, we assume all steps are done/unlocked
                steps.push('learn', 'quiz', 'practice');
            } else {
                if (isLessonCompleted(`${baseKey}-learn`)) steps.push('learn');
                if (isLessonCompleted(`${baseKey}-quiz`)) steps.push('quiz');
                if (isLessonCompleted(`${baseKey}-practice`)) steps.push('practice');
            }

            setCompletedSteps(steps);

            // Determine where to start based on progress
            // If main is completed, we default to showing nothing active (learn view) but fully unlocked map
            if (isMainCompleted) {
                setShowQuiz(false); setShowSentenceBuilder(false);
            } else if (!steps.includes('learn')) {
                setShowQuiz(false); setShowSentenceBuilder(false);
            } else if (!steps.includes('quiz')) {
                setShowQuiz(true); setShowSentenceBuilder(false);
            } else if (!steps.includes('practice')) {
                setShowQuiz(false); setShowSentenceBuilder(true);
            }
        } else {
            setCompletedSteps([]);
        }
    }, [selectedLesson, isLessonCompleted]);

    // Determine current step based on state
    const currentStep: LessonStep = showSentenceBuilder ? 'practice' : showQuiz ? 'quiz' : 'learn';

    const handleNavigate = (step: LessonStep) => {
        if (step === 'learn') {
            setShowQuiz(false);
            setShowSentenceBuilder(false);
        } else if (step === 'quiz') {
            setShowQuiz(true);
            setShowSentenceBuilder(false);
        } else if (step === 'practice') {
            setShowQuiz(false);
            setShowSentenceBuilder(true);
        }
    };

    const [activeTab, setActiveTab] = useState<'cefr' | 'toeic'>('cefr');

    // Adapter for TOEIC Data to match CEFRLevelData structure
    const toeicLevels: CEFRLevelData[] = React.useMemo(() => {
        return TOEIC_DATA.map((topic: any, index: number) => ({
            level: topic.id,
            levelName: topic.title,
            color: 'blue', // Dummy color to satisfy type
            totalLessons: 1,
            totalWords: topic.words.length,
            lessons: [{
                id: topic.id,
                title: topic.title,
                level: topic.id,
                words: topic.words.map((w: any) => ({
                    id: w.id || w.word,
                    word: w.word,
                    pos: w.type,
                    pronunciation: w.pronunciation, // Keep original for now if needed, but standard is phonetic
                    phonetic: w.pronunciation,
                    definition_vi: w.meaning,
                    definition_en: w.definition,
                    example_en: w.example,
                    example_vi: w.example_vietnamese,
                    type: 'vocabulary',
                    level: 'TOEIC', // Placeholder
                    audio: w.audio,
                    image: w.image
                })),
                type: 'vocabulary',
                lessonNumber: 1, // Default for Topic
                totalWords: topic.words.length
            }]
        }));
    }, []);

    const activeLevels = activeTab === 'cefr' ? CEFR_LEVEL_DATA : toeicLevels;

    // Helper to get theme colors (Enhanced for TOEIC)
    const getTheme = (level: string, index: number) => {
        if (activeTab === 'cefr') return getLevelTheme(level);

        // Cyclical themes for TOEIC topics
        const themes = [
            { bg: 'bg-blue-50', text: 'text-blue-600', accent: 'bg-blue-500', border: 'border-blue-100', light: 'bg-blue-100' },
            { bg: 'bg-indigo-50', text: 'text-indigo-600', accent: 'bg-indigo-500', border: 'border-indigo-100', light: 'bg-indigo-100' },
            { bg: 'bg-violet-50', text: 'text-violet-600', accent: 'bg-violet-500', border: 'border-violet-100', light: 'bg-violet-100' },
            { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', accent: 'bg-fuchsia-500', border: 'border-fuchsia-100', light: 'bg-fuchsia-100' },
            { bg: 'bg-cyan-50', text: 'text-cyan-600', accent: 'bg-cyan-500', border: 'border-cyan-100', light: 'bg-cyan-100' },
        ];
        return themes[index % themes.length];
    };

    // If a lesson is selected, show the learning interface
    if (selectedLesson) {
        const baseKey = selectedLesson.id;
        const quizKey = `${baseKey}-quiz`;

        return (
            <div className="relative min-h-screen">
                {/* Navigation Map - Floating on top */}
                <LessonProgressMap
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onNavigate={handleNavigate}
                    topic={selectedLesson.level}
                />

                {/* Content Area */}
                <div className="relative z-0">
                    {currentStep === 'learn' && (
                        <FlashcardSet
                            words={selectedLesson.words}
                            title={selectedLesson.title}
                            onClose={() => { setSelectedLesson(null); setShowQuiz(false); setShowSentenceBuilder(false); }}
                            onComplete={() => {
                                const stepKey = `${baseKey}-learn`;
                                completeLesson(stepKey);
                                setCompletedSteps(prev => [...new Set([...prev, 'learn'])] as LessonStep[]);
                                setShowQuiz(true);
                            }}
                        />
                    )}

                    {currentStep === 'quiz' && (
                        <MiniQuiz
                            words={selectedLesson.words}
                            topic={selectedLesson.level}
                            isCompleted={isLessonCompleted(quizKey)}
                            initialScore={getLessonScore(quizKey)}
                            onClose={() => { setSelectedLesson(null); setShowQuiz(false); setShowSentenceBuilder(false); }}
                            onComplete={(score, total) => {
                                // Normalize score to 0-100 scale for storage
                                const percentage = Math.round((score / total) * 100);

                                if (isLessonCompleted(quizKey)) {
                                    toast({
                                        title: "Practice Completed!",
                                        description: `You scored ${percentage}%. Result was not saved (Practice Mode).`,
                                        variant: "info"
                                    });
                                } else {
                                    completeLesson(quizKey, percentage);
                                }

                                setCompletedSteps(prev => [...new Set([...prev, 'quiz'])] as LessonStep[]);
                                setShowSentenceBuilder(true);
                                setShowQuiz(false);
                            }}
                        />
                    )}

                    {currentStep === 'practice' && (
                        <SentenceBuilder
                            challenges={[]} // TODO: Generate CEFR-based sentence challenges
                            onComplete={() => {
                                setCompletedSteps(prev => [...new Set([...prev, 'practice'])] as LessonStep[]);
                                const stepKey = `${baseKey}-practice`;
                                completeLesson(stepKey);
                                // Also mark the main lesson as completed for the list view
                                completeLesson(baseKey);

                                setSelectedLesson(null);
                                setCompletedSteps([]);
                                setShowSentenceBuilder(false);
                            }}
                            onClose={() => { setSelectedLesson(null); setCompletedSteps([]); setShowSentenceBuilder(false); }}
                            topic={selectedLesson.level}
                        />
                    )}
                </div>
            </div>
        );
    }

    // Main View: Level Selection
    return (
        <div className="h-screen bg-slate-50 relative overflow-hidden flex flex-col">
            {/* Background Decoration */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#CBD5E1 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Soft Gradient Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>

            {/* FIXED HEADER AREA */}
            <div className="flex-none z-20 relative w-full max-w-4xl mx-auto px-4 pt-6 pb-2">
                <div className="text-center relative min-h-[60px]">
                    <button
                        onClick={() => expandedLevel ? setExpandedLevel(null) : navigate('/english')}
                        className="absolute left-0 top-0 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-800 border border-slate-100 z-50"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {!expandedLevel ? (
                        <div className="animate-fade-in flex flex-col items-center">
                            {/* Tabs */}
                            <div className="inline-flex items-center p-1 rounded-full bg-slate-200/50 backdrop-blur-sm border border-slate-200 mb-6">
                                <button
                                    onClick={() => setActiveTab('cefr')}
                                    className={`
                                        px-6 py-2 rounded-full text-sm font-bold transition-all
                                        ${activeTab === 'cefr' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    CEFR Levels
                                </button>
                                <button
                                    onClick={() => setActiveTab('toeic')}
                                    className={`
                                        px-6 py-2 rounded-full text-sm font-bold transition-all
                                        ${activeTab === 'toeic' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    TOEIC Lists
                                </button>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm text-blue-600 font-bold text-xs uppercase tracking-wider mb-2">
                                <span className="text-base">{activeTab === 'cefr' ? '🚀' : '🎯'}</span>
                                <span>{activeTab === 'cefr' ? 'Standard Curriculum' : 'Exam Preparation'}</span>
                            </div>

                            <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm mb-2">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative inline-block">
                                    {activeTab === 'cefr' ? 'CEFR Levels' : 'TOEIC Topics'}
                                </span>
                            </h1>
                        </div>
                    ) : (
                        <div className="animate-fade-in slide-in-from-top-4 duration-500">
                            <div className={`
                                inline-flex items-center justify-center p-2 px-4 rounded-[2rem] shadow-sm mb-2 bg-white/80 backdrop-blur-md border border-white/50
                                ${getTheme(expandedLevel.level, 0).text}
                            `}>
                                {activeTab === 'cefr' ?
                                    <CEFRBadge level={expandedLevel.level as any} size="md" showName /> :
                                    <span className="font-black text-xl">TOPIC</span>
                                }
                            </div>
                            <h2 className={`text-3xl font-black ${getTheme(expandedLevel.level, 0).text} mb-1 drop-shadow-sm leading-tight`}>
                                {expandedLevel.levelName}
                            </h2>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                {expandedLevel.totalLessons} Lessons · {expandedLevel.totalWords} Words
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div
                className="flex-1 overflow-y-auto w-full relative z-10 custom-scrollbar"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 40px, black calc(100% - 40px), transparent 100%)'
                }}
            >
                <div className="max-w-4xl mx-auto p-4 pb-32 min-h-full">

                    {!expandedLevel && (
                        <p className="text-center text-slate-600 font-medium max-w-lg mx-auto leading-relaxed mb-8 animate-fade-in">
                            {activeTab === 'cefr'
                                ? "Progress from Beginner (A1) to Proficient (C2) with 9,780 words"
                                : "Master 600 essential words organized by 50 common business topics"
                            }
                        </p>
                    )}

                    {!expandedLevel ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                            {activeLevels.map((levelData, index) => {
                                const theme = getTheme(levelData.level, index);

                                // Levels unlock if ALL lessons in prev level done OR prev level skipped
                                // FOR TOEIC: We might want them all unlocked? Or sequential? 
                                // Let's keep sequential for now for gamification, but maybe allow random access?
                                // User request didn't specify, but "Test Out" implies sequential.
                                // Let's assume sequential for TOEIC too for consistency.

                                const prevLevel = index > 0 ? activeLevels[index - 1] : null;
                                const isPrevCompleted = prevLevel && prevLevel.lessons.every(l => isLessonCompleted(l.id));
                                const isPrevSkipped = prevLevel && isLevelSkipped(prevLevel.level);

                                // For CEFR: Sequential locking.
                                // For TOEIC: Always unlocked (User Requested).
                                let locked = false;
                                if (activeTab === 'cefr') {
                                    locked = index > 0 && activeLevels[index - 1].lessons.length > 0 &&
                                        !isPrevCompleted && !isPrevSkipped;
                                }

                                const isSkipped = isLevelSkipped(levelData.level);

                                return (
                                    <div key={levelData.level} className="relative group">
                                        <button
                                            onClick={() => !locked && setExpandedLevel(levelData)}
                                            disabled={locked}
                                            className={`
                                                w-full h-full relative bg-white rounded-[2.5rem] p-6 transition-all duration-300
                                                flex flex-col items-center text-center
                                                ${locked
                                                    ? 'grayscale opacity-70 cursor-not-allowed border-2 border-slate-100 shadow-none'
                                                    : `border-b-[6px] hover:border-b-[8px] hover:-translate-y-1 shadow-lg hover:shadow-xl ${theme.border}`
                                                }
                                            `}
                                        >
                                            {/* Badge - Floating Effect */}
                                            <div className={`
                                                w-24 h-24 rounded-[2rem] mb-4 overflow-hidden relative flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300
                                                ${theme.bg} shadow-inner bg-opacity-50
                                            `}>
                                                {/* Large Typography Badge */}
                                                <div className={`
                                                    font-black ${theme.text} drop-shadow-sm
                                                    ${activeTab === 'cefr' ? 'text-4xl' : 'text-2xl p-2 leading-tight'}
                                                `}>
                                                    {activeTab === 'cefr' ? levelData.level : (index + 1)}
                                                </div>

                                                {/* Lock Overlay */}
                                                {locked && (
                                                    <div className="absolute inset-0 bg-slate-100/50 flex items-center justify-center backdrop-blur-[2px]">
                                                        <Lock className="w-8 h-8 text-slate-400 opacity-75" />
                                                    </div>
                                                )}

                                                {/* Completed Checkmark */}
                                                {(isSkipped || isPrevCompleted && index === activeLevels.length - 1) && !locked && (
                                                    <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1.5 shadow-md border-2 border-white">
                                                        <CheckCircle className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className={`text-xl font-black mb-1 tracking-tight ${theme.text} line-clamp-2 min-h-[3.5rem] flex items-center justify-center`}>
                                                {levelData.levelName}
                                            </h3>
                                            <div className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-xs font-bold mb-4 border border-slate-100">
                                                {levelData.totalWords} Words
                                            </div>

                                            <div className="w-full mt-auto flex gap-3">
                                                {/* Test Out Option */}
                                                {!locked && !isSkipped && activeTab === 'cefr' && (
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm(`Skip ${levelData.levelName}?`)) {
                                                                skipLevel(levelData.level);
                                                            }
                                                        }}
                                                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-orange-100 text-orange-500 hover:bg-orange-200 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm border-b-4 border-orange-200"
                                                        title="Test Out / Skip Level"
                                                    >
                                                        <Sparkles className="w-6 h-6" />
                                                    </div>
                                                )}

                                                <div className={`
                                                    flex-1 h-12 rounded-2xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                                                    ${locked
                                                        ? 'bg-slate-100 text-slate-400 border-2 border-slate-200'
                                                        : `${theme.bg} ${theme.text} hover:opacity-90 shadow-sm border-b-4 ${theme.border}`
                                                    }
                                                `}>
                                                    {locked ? 'Locked' : isSkipped ? 'Done' : 'Start'}
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // Detailed List View (Lesson Selection)
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pt-8">

                            <div className="max-w-xl mx-auto relative pb-20">
                                {/* Connecting Line */}
                                <div className="absolute left-[2.25rem] top-8 bottom-0 w-1 bg-slate-200 rounded-full" />

                                {/* Lessons */}
                                <div className="space-y-10 relative">
                                    {expandedLevel.lessons.map((lesson, index) => {
                                        const theme = getTheme(expandedLevel.level, index); // Use index for changing colors in topic view? Or just same theme
                                        const completed = isLessonCompleted(lesson.id);

                                        // Lock Logic:
                                        // 1. If Level is Skipped (Test Out): All lessons are unlocked (!locked).
                                        // 2. If Level is Normal: Lessons unlock sequentially (Lesson 2 needs Lesson 1 done).
                                        const locked = !isLevelSkipped(expandedLevel.level) && index > 0 && !isLessonCompleted(expandedLevel.lessons[index - 1].id);

                                        return (
                                            <div key={lesson.id} className="relative pl-20">
                                                {/* Connector Dot */}
                                                <div className={`
                                                    absolute left-0 top-1/2 -translate-y-1/2 w-[4.5rem] h-[4.5rem] rounded-full border-4 border-slate-50 shadow-lg z-10 flex items-center justify-center font-black text-xl transition-all duration-500
                                                    ${locked ? 'bg-gray-100 text-gray-300' : completed ? 'bg-green-400 text-white scale-110' : `${theme.bg} ${theme.text} scale-110`}
                                                `}>
                                                    {completed ? <CheckCircle className="w-8 h-8" /> : (index + 1)}
                                                </div>

                                                {/* Lesson Card */}
                                                <button
                                                    disabled={locked}
                                                    onClick={() => setSelectedLesson(lesson)}
                                                    className={`
                                                        w-full group text-left relative overflow-hidden transition-all duration-300
                                                        bg-white rounded-[2.5rem] p-6 shadow-md hover:shadow-xl border-b-4
                                                        ${locked ? 'opacity-60 grayscale border-gray-100' : `${theme.border} hover:-translate-y-1 hover:border-b-8`}
                                                    `}
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                                                            {lesson.title}
                                                        </h4>
                                                        {locked && <Lock className="w-5 h-5 text-gray-300" />}
                                                    </div>

                                                    <div className="flex-wrap gap-2 flex hidden sm:flex">
                                                        {lesson.words.slice(0, 3).map(w => (
                                                            <span key={w.id} className="px-2 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-medium">
                                                                {w.word}
                                                            </span>
                                                        ))}
                                                        {lesson.words.length > 3 && (
                                                            <span className="px-2 py-1 rounded-md bg-slate-50 text-slate-400 text-xs font-medium">
                                                                +{lesson.words.length - 3}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Progress Bar (Visual only for now) */}
                                                    {completed && (
                                                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-green-500"></div>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Phase1View;
