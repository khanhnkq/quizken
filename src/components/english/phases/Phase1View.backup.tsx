import React, { useState } from 'react';
import { ArrowLeft, Book, Lock, CheckCircle, Star, Sparkles, Map, GraduationCap, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TOPICS, VOCAB_DATA, SENTENCE_CHALLENGES } from '../../../lib/constants/vocabData';
import FlashcardSet from '../FlashcardSet';
import SentenceBuilder from '../SentenceBuilder';
import { useUserProgress } from '../../../hooks/useUserProgress';
import MiniQuiz from '../MiniQuiz';
import { gsap } from 'gsap';
import LessonProgressMap, { LessonStep } from '../LessonProgressMap';

// Helper to get playful theme colors (Consistent with FlashcardSet)
const getTheme = (topic: string) => {
    switch (topic) {
        case 'Academic': return {
            bg: 'bg-indigo-50', text: 'text-indigo-600', accent: 'bg-indigo-500',
            shadow: 'shadow-indigo-200', border: 'border-indigo-100', light: 'bg-indigo-100'
        };
        case 'Science': return {
            bg: 'bg-cyan-50', text: 'text-cyan-600', accent: 'bg-cyan-500',
            shadow: 'shadow-cyan-200', border: 'border-cyan-100', light: 'bg-cyan-100'
        };
        case 'Business': return {
            bg: 'bg-emerald-50', text: 'text-emerald-600', accent: 'bg-emerald-500',
            shadow: 'shadow-emerald-200', border: 'border-emerald-100', light: 'bg-emerald-100'
        };
        case 'Society': return {
            bg: 'bg-orange-50', text: 'text-orange-600', accent: 'bg-orange-500',
            shadow: 'shadow-orange-200', border: 'border-orange-100', light: 'bg-orange-100'
        };
        case 'Environment': return {
            bg: 'bg-green-50', text: 'text-green-600', accent: 'bg-green-500',
            shadow: 'shadow-green-200', border: 'border-green-100', light: 'bg-green-100'
        };
        default: return { // Advanced or others
            bg: 'bg-violet-50', text: 'text-violet-600', accent: 'bg-violet-500',
            shadow: 'shadow-violet-200', border: 'border-violet-100', light: 'bg-violet-100'
        };
    }
};

const Phase1View = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isTopicLocked, isTopicCompleted, completeTopic } = useUserProgress();
    const [selectedPart, setSelectedPart] = useState<{ topic: string, part: number } | null>(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [showSentenceBuilder, setShowSentenceBuilder] = useState(false);
    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

    // Constants
    const WORDS_PER_PART = 10;

    // Helper: Chunk words for a topic
    const getPartsForTopic = (topic: string) => {
        const topicWords = VOCAB_DATA.filter(w => w.topic === topic);
        const parts = [];
        for (let i = 0; i < topicWords.length; i += WORDS_PER_PART) {
            parts.push(topicWords.slice(i, i + WORDS_PER_PART));
        }
        return parts;
    };

    const handleFlashcardsComplete = () => {
        // Flashcards done -> Go to Quiz
        setShowQuiz(true);
    };

    const handleQuizComplete = () => {
        if (selectedPart) {
            // Quiz done -> Complete Topic & Go to Sentence Builder
            const progressKey = `${selectedPart.topic}-${selectedPart.part + 1}`;
            completeTopic(progressKey);

            setShowQuiz(false);
            setShowSentenceBuilder(true);
        }
    };

    // --- Sub-Views (Flashcards -> Quiz -> Sentence Builder) ---
    // --- Sub-Views (Flashcards -> Quiz -> Sentence Builder) ---
    // Initialize completed steps from persistent storage
    const [completedSteps, setCompletedSteps] = useState<LessonStep[]>([]);

    // Effect to sync persistent progress when selectedPart changes
    React.useEffect(() => {
        if (selectedPart) {
            const baseKey = `${selectedPart.topic}-${selectedPart.part + 1}`;
            const steps: LessonStep[] = [];
            if (isTopicCompleted(`${baseKey}-learn`)) steps.push('learn');
            if (isTopicCompleted(`${baseKey}-quiz`)) steps.push('quiz');
            if (isTopicCompleted(`${baseKey}-practice`)) steps.push('practice');
            setCompletedSteps(steps);

            // Determine where to start based on progress
            if (!steps.includes('learn')) {
                setShowQuiz(false); setShowSentenceBuilder(false);
            } else if (!steps.includes('quiz')) {
                setShowQuiz(true); setShowSentenceBuilder(false);
            } else if (!steps.includes('practice')) {
                setShowQuiz(false); setShowSentenceBuilder(true);
            }
        } else {
            setCompletedSteps([]);
        }
    }, [selectedPart, isTopicCompleted]);

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

    if (selectedPart) {
        const parts = getPartsForTopic(selectedPart.topic);
        const words = parts[selectedPart.part];
        const baseKey = `${selectedPart.topic}-${selectedPart.part + 1}`;

        return (
            <div className="relative min-h-screen">
                {/* Navigation Map - Floating on top */}
                <LessonProgressMap
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    onNavigate={handleNavigate}
                    topic={selectedPart.topic}
                />

                {/* Content Area */}
                <div className="relative z-0">
                    {currentStep === 'learn' && (
                        <FlashcardSet
                            words={words}
                            title={`${selectedPart.topic} - Lesson ${selectedPart.part + 1}`}
                            onClose={() => { setSelectedPart(null); setShowQuiz(false); setShowSentenceBuilder(false); }}
                            onComplete={() => {
                                const stepKey = `${baseKey}-learn`;
                                completeTopic(stepKey);
                                setCompletedSteps(prev => [...new Set([...prev, 'learn'])] as LessonStep[]);
                                setShowQuiz(true);
                            }}
                        />
                    )}

                    {currentStep === 'quiz' && (
                        <MiniQuiz
                            words={words}
                            topic={selectedPart.topic}
                            onClose={() => { setSelectedPart(null); setShowQuiz(false); setShowSentenceBuilder(false); }}
                            onComplete={() => {
                                const stepKey = `${baseKey}-quiz`;
                                completeTopic(stepKey);
                                setCompletedSteps(prev => [...new Set([...prev, 'quiz'])] as LessonStep[]);
                                setShowSentenceBuilder(true);
                                setShowQuiz(false);
                            }}
                        />
                    )}

                    {currentStep === 'practice' && (
                        <SentenceBuilder
                            challenges={SENTENCE_CHALLENGES[selectedPart.topic] || []}
                            onComplete={() => {
                                setCompletedSteps(prev => [...new Set([...prev, 'practice'])] as LessonStep[]);
                                // If they finish everything, maybe close? Or just mark complete.
                                // Logic from original:
                                const stepKey = `${baseKey}-practice`;
                                completeTopic(stepKey);

                                setSelectedPart(null);
                                setCompletedSteps([]); // Reset map tracking for next view
                                setShowSentenceBuilder(false);
                            }}
                            onClose={() => { setSelectedPart(null); setCompletedSteps([]); setShowSentenceBuilder(false); }}
                            topic={selectedPart.topic}
                        />
                    )}
                </div>
            </div>
        );
    }

    // --- Main Roadmap View ---

    return (
        <div className="min-h-screen bg-slate-50 p-4 pb-32 relative overflow-hidden">
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

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Hero Header */}
                <div className="text-center z-10 mb-16 relative">
                    <button
                        onClick={() => expandedTopic ? setExpandedTopic(null) : navigate('/english')}
                        className="absolute left-0 top-0 p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all text-slate-500 hover:text-slate-800 border border-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    {!expandedTopic && (
                        <>
                            {/* Background Glows for Header */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg pointer-events-none -z-10">
                                <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl animate-blob" />
                                <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                            </div>

                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/60 shadow-sm text-blue-600 font-bold text-xs uppercase tracking-wider animate-fade-in mx-auto mb-6">
                                <span className="text-base">🚀</span>
                                <span>Phase 1: Vocabulary</span>
                            </div>

                            <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-slate-900 drop-shadow-sm mb-6">
                                Essential<br className="hidden sm:block" />{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 relative inline-block">
                                    Vocabulary Topics
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-yellow-300/80 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                                    </svg>
                                </span>
                            </h1>

                            <p className="text-lg text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
                                Pick a world to explore!
                            </p>
                        </>
                    )}
                </div>

                {/* Grid View (Topic Selection) */}
                {!expandedTopic ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TOPICS.map((topic) => {
                            const parts = getPartsForTopic(topic);
                            const theme = getTheme(topic);

                            // Check if topic is locked (based on first part)
                            const firstPartIndex = 0;
                            // Simplify locked logic for Grid: Check if previous topic is done?
                            // For simplicity, let's use the detailed logic or keep it open for exploration
                            // Or re-use the util:
                            let locked = false;
                            const topicIndex = TOPICS.indexOf(topic);
                            if (topicIndex > 0) {
                                const prevTopic = TOPICS[topicIndex - 1];
                                const prevTopicParts = Math.ceil(VOCAB_DATA.filter(w => w.topic === prevTopic).length / WORDS_PER_PART);
                                locked = !isTopicCompleted(`${prevTopic}-${prevTopicParts}`);
                            }

                            return (
                                <button
                                    key={topic}
                                    onClick={() => !locked && setExpandedTopic(topic)}
                                    disabled={locked}
                                    className={`
                                        group relative bg-white rounded-[2rem] p-4 shadow-lg hover:shadow-2xl transition-all duration-300
                                        flex flex-col items-center hover:-translate-y-2 text-center
                                        ${locked ? 'grayscale opacity-70 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {/* Image Container */}
                                    <div className={`
                                        w-full aspect-square rounded-[1.5rem] mb-4 overflow-hidden relative
                                        ${theme.bg} flex items-center justify-center
                                    `}>
                                        <img
                                            src={`/assets/topics/${topic}.png`}
                                            alt={topic}
                                            onError={(e) => {
                                                // Fallback if image fails (though we just generated them)
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                                            }}
                                            className="w-[90%] h-[90%] object-contain drop-shadow-lg transform transition-transform group-hover:scale-110 duration-500 rounded-2xl"
                                        />
                                        {/* Fallback Icon if Image hidden/loading */}
                                        <GraduationCap className={`w-12 h-12 text-black/10 absolute hidden group-hover:block`} />

                                        {/* Lock Overlay */}
                                        {locked && (
                                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                                                <div className="p-3 bg-white/90 rounded-full shadow-lg">
                                                    <Lock className="w-6 h-6 text-gray-400" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className={`text-xl font-extrabold mb-1 ${theme.text}`}>{topic}</h3>
                                    <p className="text-sm text-gray-400 font-bold mb-3">{parts.length} Levels</p>

                                    <div className={`
                                        w-full py-2 rounded-xl text-sm font-bold
                                        ${locked ? 'bg-gray-100 text-gray-400' : theme.light + ' ' + theme.text}
                                    `}>
                                        {locked ? 'Locked' : 'Explore'}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    // Detailed List View (The Playful Path)
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Title Section */}
                        <div className="text-center mb-12">
                            <div className={`
                                inline-flex items-center justify-center p-4 rounded-[2rem] shadow-lg mb-4 bg-white
                                ${getTheme(expandedTopic).text}
                            `}>
                                <img src={`/assets/topics/${expandedTopic}.png`} className="w-16 h-16 object-contain rounded-xl" />
                            </div>
                            <h2 className={`text-4xl font-black ${getTheme(expandedTopic).text} mb-2 drop-shadow-sm`}>
                                {expandedTopic} World
                            </h2>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Your Adventure Path</p>
                        </div>

                        <div className="max-w-xl mx-auto relative pb-20">
                            {/* Connecting Line */}
                            <div className="absolute left-[2.25rem] top-8 bottom-0 w-1 bg-slate-200 rounded-full" />

                            {/* Levels */}
                            <div className="space-y-10 relative">
                                {getPartsForTopic(expandedTopic).map((_, index) => {
                                    const theme = getTheme(expandedTopic);
                                    const partKey = `${expandedTopic}-${index + 1}`;
                                    const completed = isTopicCompleted(partKey);

                                    // Locked Logic
                                    let locked = true;
                                    const topicIndex = TOPICS.indexOf(expandedTopic);
                                    if (topicIndex === 0 && index === 0) locked = false;
                                    else if (index > 0) locked = !isTopicCompleted(`${expandedTopic}-${index}`);
                                    else {
                                        const prevTopic = TOPICS[topicIndex - 1];
                                        if (prevTopic) {
                                            const prevTopicParts = Math.ceil(VOCAB_DATA.filter(w => w.topic === prevTopic).length / WORDS_PER_PART);
                                            locked = !isTopicCompleted(`${prevTopic}-${prevTopicParts}`);
                                        }
                                    }

                                    return (
                                        <div key={index} className="relative pl-20">
                                            {/* Connector Dot */}
                                            <div className={`
                                                absolute left-0 top-1/2 -translate-y-1/2 w-[4.5rem] h-[4.5rem] rounded-full border-4 border-slate-50 shadow-lg z-10 flex items-center justify-center font-black text-xl transition-all duration-500
                                                ${locked ? 'bg-gray-100 text-gray-300' : completed ? 'bg-green-400 text-white scale-110' : `${theme.bg} ${theme.text} scale-110`}
                                            `}>
                                                {completed ? <CheckCircle className="w-8 h-8" /> : (index + 1)}
                                            </div>

                                            {/* Level Card */}
                                            <button
                                                disabled={locked}
                                                onClick={() => setSelectedPart({ topic: expandedTopic, part: index })}
                                                className={`
                                                    w-full group text-left relative overflow-hidden transition-all duration-300
                                                    bg-white rounded-[2.5rem] p-6 shadow-md hover:shadow-xl border-b-4
                                                    ${locked ? 'opacity-60 grayscale border-gray-100' : `${theme.border} hover:-translate-y-1 hover:border-b-8`}
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className={`text-xl font-black mb-1 ${locked ? 'text-gray-400' : 'text-gray-800'}`}>
                                                            Level {index + 1}
                                                        </h4>
                                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                            {index === 0 ? 'Start Here' :
                                                                index === 1 ? 'Moving Up' :
                                                                    index === 2 ? 'Challenge' : 'Victory'}
                                                        </span>
                                                    </div>

                                                    {!locked && (
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3].map(star => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-5 h-5 ${completed ? 'fill-yellow-400 text-yellow-400 animate-pulse' : 'text-gray-200'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Action Area */}
                                                <div className="flex items-center justify-between mt-4">
                                                    <div className="flex gap-2">
                                                        <span className={`
                                                            inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold
                                                            ${locked ? 'bg-gray-100 text-gray-400' : 'bg-orange-50 text-orange-600'}
                                                        `}>
                                                            <Layout className="w-3.5 h-3.5" /> Words
                                                        </span>
                                                        <span className={`
                                                            inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold
                                                            ${locked ? 'bg-gray-100 text-gray-400' : 'bg-purple-50 text-purple-600'}
                                                        `}>
                                                            <Sparkles className="w-3.5 h-3.5" /> Mini-Game
                                                        </span>
                                                    </div>

                                                    {locked ? (
                                                        <Lock className="w-6 h-6 text-gray-300" />
                                                    ) : (
                                                        <div className={`
                                                            px-6 py-2.5 rounded-2xl font-bold text-sm shadow-sm transition-all
                                                            ${completed ? 'bg-green-100 text-green-600' : `${theme.accent} text-white group-hover:scale-110 shadow-${theme.text.split('-')[1]}-200`}
                                                        `}>
                                                            {completed ? 'Review' : 'PLAY'}
                                                        </div>
                                                    )}
                                                </div>
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
    );
};

export default Phase1View;
