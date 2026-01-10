import React, { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Lock, CheckCircle, Star, Sparkles, Layout, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { SentenceChallenge, SentencePart } from '@/lib/constants/vocabData';
import {
    VocabWord,
    VOCAB_A1,
    VOCAB_A2,
    VOCAB_B1,
    VOCAB_B2,
    VOCAB_C1,
    VOCAB_C2
} from '@/lib/constants/cefrVocabData';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CEFR_LEVEL_DATA, CEFRLevelData, CEFRLesson } from '../../../lib/constants/cefrLessons';
import { TOEIC_DATA } from '../../../lib/constants/toeicData';
import { TOPIC_DATA } from '../../../lib/constants/topicVocabData';
import FlashcardSet from '../FlashcardSet';
import ListeningPractice from '../ListeningPractice';
import { useUserProgress } from '../../../hooks/useUserProgress';
import MiniQuiz from '../MiniQuiz';
import LessonProgressMap, { LessonStep } from '../LessonProgressMap';
import { CEFRBadge } from '../../cefr/CEFRBadge';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { GRAMMAR_SENTENCES_A1, GRAMMAR_SENTENCES_A2, GRAMMAR_SENTENCES_B1, GRAMMAR_SENTENCES_B2, GRAMMAR_SENTENCES_C1, GRAMMAR_SENTENCES_C2, GrammarSentence } from '@/lib/constants/grammarSentences';

const LEVEL_GRAMMAR_MAP: Record<string, GrammarSentence[]> = {
    'A1': GRAMMAR_SENTENCES_A1,
    'A2': GRAMMAR_SENTENCES_A2,
    'B1': GRAMMAR_SENTENCES_B1,
    'B2': GRAMMAR_SENTENCES_B2,
    'C1': GRAMMAR_SENTENCES_C1,
    'C2': GRAMMAR_SENTENCES_C2
};

const generateChallenges = (level: string): SentenceChallenge[] => {
    let sourceSentences: GrammarSentence[] = LEVEL_GRAMMAR_MAP[level] || [];

    // For TOEIC or unknown levels: Mix 2 sentences from each CEFR level
    if (sourceSentences.length === 0) {
        const allLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
        sourceSentences = allLevels.flatMap(lvl => {
            const levelSentences = LEVEL_GRAMMAR_MAP[lvl] || [];
            const shuffled = [...levelSentences].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 2); // Pick 2 from each level
        });
    }

    // Shuffle and pick 10
    const shuffled = [...sourceSentences].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);

    return selected.map((s, index) => {
        const cleanSentence = s.sentence.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");
        const words = cleanSentence.split(/\s+/);

        // Chunk long sentences if needed (simple logic)
        const chunkedWords = words.length > 8 ?
            [...words.slice(0, 7), words.slice(7).join(" ")] : words;

        const parts: SentencePart[] = chunkedWords.map((word, i) => ({
            id: `p-${index}-${i}`,
            text: word,
            type: 'M'
        }));

        const correctOrder = parts.map(p => p.id);

        return {
            id: `challenge-${index}`,
            topic: 'Grammar Practice',
            fullSentence: s.sentence,
            translation: s.translation,
            parts: parts,
            correctOrder: correctOrder
        };
    });
};





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
    const [showListening, setShowListening] = useState(false);
    const [expandedLevel, setExpandedLevel] = useState<CEFRLevelData | null>(null);
    const [completedSteps, setCompletedSteps] = useState<LessonStep[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 6;

    // transform generateChallenges to be stable


    // Effect to sync persistent progress when selectedLesson changes
    React.useEffect(() => {
        if (selectedLesson) {
            const baseKey = selectedLesson.id;
            const steps: LessonStep[] = [];

            // If the main lesson is marked as completed (legacy or summary), unlock everything
            const isMainCompleted = isLessonCompleted(baseKey);

            if (isMainCompleted) {
                // If main lesson is done, we assume all steps are done/unlocked
                steps.push('learn', 'quiz', 'listening');
            } else {
                if (isLessonCompleted(`${baseKey}-learn`)) steps.push('learn');
                if (isLessonCompleted(`${baseKey}-quiz`)) steps.push('quiz');
                if (isLessonCompleted(`${baseKey}-listening`)) steps.push('listening');
            }

            setCompletedSteps(steps);

            // Determine where to start based on progress
            // If main is completed, we default to showing nothing active (learn view) but fully unlocked map
            if (isMainCompleted) {
                setShowQuiz(false); setShowListening(false);
            } else if (!steps.includes('learn')) {
                setShowQuiz(false); setShowListening(false);
            } else if (!steps.includes('quiz')) {
                setShowQuiz(true); setShowListening(false);
            } else if (!steps.includes('listening')) {
                setShowQuiz(false); setShowListening(true);
            }
        } else {
            setCompletedSteps([]);
        }
    }, [selectedLesson, isLessonCompleted]);

    // Determine current step based on state
    const currentStep: LessonStep = showListening ? 'listening' : showQuiz ? 'quiz' : 'learn';

    // transform generateChallenges to be stable
    const practiceChallenges = React.useMemo(() => {
        if (selectedLesson && currentStep === 'listening') {
            return generateChallenges(selectedLesson.level);
        }
        return [];
    }, [selectedLesson?.id, currentStep]);

    const handleNavigate = (step: LessonStep) => {
        if (step === 'learn') {
            setShowQuiz(false);
            setShowListening(false);
        } else if (step === 'quiz') {
            setShowQuiz(true);
            setShowListening(false);
        } else if (step === 'listening') {
            setShowQuiz(false);
            setShowListening(true);
        }
    };

    const [activeTab, setActiveTab] = useState<'cefr' | 'toeic' | 'topic'>('cefr');

    // Reset to page 1 when tab changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

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

    // Adapter for Topic Data to match CEFRLevelData structure
    const topicLevels: CEFRLevelData[] = React.useMemo(() => {
        return TOPIC_DATA.map((topic: any) => {
            // Debug data mapping
            if (topic.id === 'chu-de-cong-nghe-2' || topic.words[0]?.meaning) {
                console.log('Mapping Topic:', topic.title, 'Word 0 Meaning:', topic.words[0]?.meaning);
            }
            return {
                level: topic.id,
                levelName: topic.title,
                color: topic.color || 'blue',
                totalLessons: 1,
                totalWords: topic.words.length,
                lessons: [{
                    id: topic.id,
                    title: topic.title,
                    level: topic.id,
                    words: topic.words.map((w: any) => ({
                        id: w.id || w.word,
                        word: w.word,
                        pos: w.word_type,
                        phonetic: w.pronunciation,
                        definition_vi: w.meaning,
                        definition_en: w.meaning, // Use Vietnamese meaning as definition for Quiz
                        example_en: w.example,
                        example_vi: '',
                        type: 'vocabulary',
                        level: 'TOPIC',
                    })),
                    type: 'vocabulary',
                    lessonNumber: 1,
                    totalWords: topic.words.length
                }]
            };
        });
    }, []);

    const activeLevels = activeTab === 'cefr' ? CEFR_LEVEL_DATA : activeTab === 'toeic' ? toeicLevels : topicLevels;

    // Pagination Logic
    const totalPages = Math.ceil(activeLevels.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedLevels = activeLevels.slice(startIndex, startIndex + ITEMS_PER_PAGE);

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
                            onClose={() => { setSelectedLesson(null); setShowQuiz(false); setShowListening(false); }}
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
                            onClose={() => { setSelectedLesson(null); setShowQuiz(false); setShowListening(false); }}
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
                                setShowListening(true);
                                setShowQuiz(false);
                            }}
                        />
                    )}

                    {currentStep === 'listening' && (
                        <ListeningPractice
                            words={selectedLesson.words}
                            level={selectedLesson.level}
                            onComplete={() => {
                                setCompletedSteps(prev => [...new Set([...prev, 'listening'])] as LessonStep[]);
                                const stepKey = `${baseKey}-listening`;

                                // Mark listening step and main lesson as completed
                                completeLesson([stepKey, baseKey]);

                                toast({
                                    title: "Luyện Nghe Hoàn Thành!",
                                    description: "Bạn đã hoàn thành phần luyện nghe!",
                                    variant: "success"
                                });

                                setSelectedLesson(null);
                                setCompletedSteps([]);
                                setShowListening(false);
                            }}
                            onClose={() => { setSelectedLesson(null); setCompletedSteps([]); setShowListening(false); }}
                        />
                    )}
                </div>
            </div >
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
            <div className="flex-none z-20 relative w-full max-w-4xl mx-auto px-4 pt-2 pb-0">
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
                            <div className="inline-flex items-center p-1 rounded-full bg-slate-200/50 backdrop-blur-sm border border-slate-200 mb-2">
                                <button
                                    onClick={() => setActiveTab('cefr')}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-bold transition-all
                                        ${activeTab === 'cefr' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    {t('englishHub.phase1.tabs.cefr')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('toeic')}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-bold transition-all
                                        ${activeTab === 'toeic' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    {t('englishHub.phase1.tabs.toeic')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('topic')}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-bold transition-all
                                        ${activeTab === 'topic' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                                    `}
                                >
                                    {t('englishHub.phase1.tabs.topic')}
                                </button>
                            </div>



                            <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-slate-900 drop-shadow-sm mb-2">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative inline-block">
                                    {activeTab === 'cefr' ? t('englishHub.phase1.headers.cefr') : activeTab === 'toeic' ? t('englishHub.phase1.headers.toeic') : t('englishHub.phase1.headers.topic')}
                                </span>
                            </h1>

                            {/* Select Dropdown for Page Levels */}
                            <div className="relative w-full max-w-sm mx-auto mb-2">
                                <Select onValueChange={(value) => {
                                    const selected = activeLevels.find(l => l.level === value);
                                    if (selected) setExpandedLevel(selected);
                                }}>
                                    <SelectTrigger className="w-full h-14 pl-6 pr-4 rounded-[2rem] border-2 border-white bg-white/60 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300 shadow-sm font-bold text-slate-700 backdrop-blur-md group">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <SelectValue placeholder={t('englishHub.phase1.common.selectLevel')} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px] rounded-2xl border-white shadow-xl bg-white/90 backdrop-blur-xl p-1 w-[var(--radix-select-trigger-width)]">
                                        {activeLevels.map((level, idx) => {
                                            const theme = getTheme(level.level, idx);
                                            return (
                                                <SelectItem
                                                    key={level.level}
                                                    value={level.level}
                                                    className="font-bold cursor-pointer py-3 px-4 rounded-xl focus:bg-slate-50 focus:text-blue-600 transition-colors mb-1"
                                                >
                                                    <div className="flex items-center gap-3 w-full">
                                                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${theme.accent}`} />
                                                        <span className={`min-w-[40px] ${theme.text} opacity-80`}>
                                                            {activeTab === 'cefr' ? level.level : `#${idx + 1}`}
                                                        </span>
                                                        <span className="text-slate-700 truncate flex-1 text-left">{level.levelName}</span>
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>
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
                                {expandedLevel.totalLessons} {t('englishHub.phase1.common.lessons')} · {expandedLevel.totalWords} {t('englishHub.phase1.words')}
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
                <div className="max-w-4xl mx-auto p-4 pb-24 min-h-full">



                    {!expandedLevel ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                                {paginatedLevels.map((levelData, index) => {
                                    const globalIndex = startIndex + index;
                                    const theme = getTheme(levelData.level, globalIndex);

                                    // Levels unlock if ALL lessons in prev level done OR prev level skipped
                                    // FOR TOEIC: We might want them all unlocked? Or sequential? 
                                    // Let's keep sequential for now for gamification, but maybe allow random access?
                                    // User request didn't specify, but "Test Out" implies sequential.
                                    // Let's assume sequential for TOEIC too for consistency.

                                    const prevLevel = globalIndex > 0 ? activeLevels[globalIndex - 1] : null;
                                    const isPrevCompleted = prevLevel && prevLevel.lessons.every(l => isLessonCompleted(l.id));
                                    const isPrevSkipped = prevLevel && isLevelSkipped(prevLevel.level);

                                    // For CEFR: Sequential locking.
                                    // For TOEIC: Always unlocked (User Requested).
                                    let locked = false;
                                    if (activeTab === 'cefr') {
                                        locked = globalIndex > 0 && activeLevels[globalIndex - 1].lessons.length > 0 &&
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
                                                w-20 h-20 rounded-3xl mb-3 overflow-hidden relative flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300
                                                ${theme.bg} shadow-sm bg-opacity-50
                                            `}>
                                                    {/* Large Typography Badge */}
                                                    <div className={`
                                                    font-black ${theme.text} drop-shadow-sm
                                                    ${activeTab === 'cefr' ? 'text-3xl' : 'text-xl p-2 leading-tight'}
                                                `}>
                                                        {activeTab === 'cefr' ? levelData.level : (globalIndex + 1)}
                                                    </div>

                                                    {/* Lock Overlay */}
                                                    {locked && (
                                                        <div className="absolute inset-0 bg-slate-100/50 flex items-center justify-center backdrop-blur-[2px]">
                                                            <Lock className="w-8 h-8 text-slate-400 opacity-75" />
                                                        </div>
                                                    )}

                                                    {/* Completed Checkmark */}
                                                    {(isSkipped || isPrevCompleted && globalIndex === activeLevels.length - 1) && !locked && (
                                                        <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1.5 shadow-md border-2 border-white">
                                                            <CheckCircle className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>

                                                <h3 className={`text-xl font-black mb-1 tracking-tight ${theme.text} line-clamp-2 min-h-[3.5rem] flex items-center justify-center`}>
                                                    {levelData.levelName}
                                                </h3>
                                                <div className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 text-xs font-bold mb-4 border border-slate-100">
                                                    {levelData.totalWords} {t('englishHub.phase1.words')}
                                                </div>

                                                <div className="w-full mt-auto flex gap-3">
                                                    {/* Test Out Option */}
                                                    {!locked && !isSkipped && activeTab === 'cefr' && (
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm(t('englishHub.phase1.actions.skipConfirm', { level: levelData.levelName }))) {
                                                                    skipLevel(levelData.level);
                                                                }
                                                            }}
                                                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-orange-100 text-orange-500 hover:bg-orange-200 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm border-b-4 border-orange-200"
                                                            title={t('englishHub.phase1.actions.skip')}
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
                                                        {locked ? t('englishHub.phase1.actions.locked') : isSkipped ? t('englishHub.phase1.actions.done') : t('englishHub.phase1.actions.start')}
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
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
                                                    onClick={() => {
                                                        setSelectedLesson(lesson);
                                                        // If lesson is already done or level is skipped, mark all steps as "highlighted"
                                                        if (completed || isLevelSkipped(expandedLevel.level)) {
                                                            setCompletedSteps(['learn', 'quiz', 'listening']);
                                                        } else {
                                                            setCompletedSteps([]);
                                                        }
                                                    }}
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

            {/* Fixed Pagination Controls (Outside Scroll View) */}
            {!expandedLevel && totalPages > 1 && (
                <div className="flex-none w-full py-3 bg-white/70 backdrop-blur-md border-t border-slate-100 z-30 flex justify-center">
                    <div className="flex items-center gap-2 p-1 bg-white rounded-full border border-slate-100 shadow-sm">
                        <button
                            onClick={() => { if (currentPage > 1) setCurrentPage(p => p - 1); }}
                            disabled={currentPage === 1}
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center transition-all
                                ${currentPage === 1
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                                }
                            `}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                if (
                                    totalPages > 6 &&
                                    page !== 1 &&
                                    page !== totalPages &&
                                    Math.abs(currentPage - page) > 1
                                ) {
                                    if (Math.abs(currentPage - page) === 2) {
                                        return <span key={page} className="text-slate-300 font-bold px-1 text-xs">...</span>;
                                    }
                                    return null;
                                }

                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`
                                            w-8 h-8 rounded-full font-bold text-xs transition-all
                                            ${currentPage === page
                                                ? 'bg-slate-800 text-white shadow-md scale-105'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => { if (currentPage < totalPages) setCurrentPage(p => p + 1); }}
                            disabled={currentPage === totalPages}
                            className={`
                                w-8 h-8 rounded-full flex items-center justify-center transition-all
                                ${currentPage === totalPages
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                                }
                            `}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Phase1View;
