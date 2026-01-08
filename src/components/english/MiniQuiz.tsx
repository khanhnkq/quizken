import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, ArrowLeft, ArrowRight, Trophy, Brain, PartyPopper } from 'lucide-react';
import { VocabWord } from '../../lib/constants/cefrVocabData';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';

interface MiniQuizProps {
    words: VocabWord[];
    topic: string; // Now accepts CEFR level like 'A1', 'B2', etc.
    onClose: () => void;
    onComplete: (score: number, total: number) => void;
    isCompleted?: boolean;
    initialScore?: number;
}

const getTheme = (level: string) => {
    switch (level) {
        case 'A1': return {
            bg: 'bg-green-50', text: 'text-green-600', accent: 'bg-green-500',
            border: 'border-green-100', hover: 'hover:bg-green-50',
            ring: 'ring-green-100', progress: 'bg-green-500', light: 'bg-green-100',
            gradient: 'from-green-50 via-white to-green-50',
            blobMain: 'bg-green-300', blobSec: 'bg-emerald-300',
            optionBase: 'shadow-[0_4px_0_0_#dcfce7]',
            optionActive: 'active:shadow-none active:translate-y-1'
        };
        case 'A2': return {
            bg: 'bg-cyan-50', text: 'text-cyan-600', accent: 'bg-cyan-500',
            border: 'border-cyan-100', hover: 'hover:bg-cyan-50',
            ring: 'ring-cyan-100', progress: 'bg-cyan-500', light: 'bg-cyan-100',
            gradient: 'from-cyan-50 via-white to-cyan-50',
            blobMain: 'bg-cyan-300', blobSec: 'bg-teal-300',
            optionBase: 'shadow-[0_4px_0_0_#cffafe]',
            optionActive: 'active:shadow-none active:translate-y-1'
        };
        case 'B1': return {
            bg: 'bg-blue-50', text: 'text-blue-600', accent: 'bg-blue-500',
            border: 'border-blue-100', hover: 'hover:bg-blue-50',
            ring: 'ring-blue-100', progress: 'bg-blue-500', light: 'bg-blue-100',
            gradient: 'from-blue-50 via-white to-blue-50',
            blobMain: 'bg-blue-300', blobSec: 'bg-indigo-300',
            optionBase: 'shadow-[0_4px_0_0_#dbeafe]',
            optionActive: 'active:shadow-none active:translate-y-1'
        };
        case 'B2': return {
            bg: 'bg-indigo-50', text: 'text-indigo-600', accent: 'bg-indigo-500',
            border: 'border-indigo-100', hover: 'hover:bg-indigo-50',
            ring: 'ring-indigo-100', progress: 'bg-indigo-500', light: 'bg-indigo-100',
            gradient: 'from-indigo-50 via-white to-indigo-50',
            blobMain: 'bg-indigo-300', blobSec: 'bg-purple-300',
            optionBase: 'shadow-[0_4px_0_0_#e2e8f0]',
            optionActive: 'active:shadow-none active:translate-y-1'
        };
        case 'C1': return {
            bg: 'bg-purple-50', text: 'text-purple-600', accent: 'bg-purple-500',
            border: 'border-purple-100', hover: 'hover:bg-purple-50',
            ring: 'ring-purple-100', progress: 'bg-purple-500', light: 'bg-purple-100',
            gradient: 'from-purple-50 via-white to-purple-50',
            blobMain: 'bg-purple-300', blobSec: 'bg-fuchsia-300',
            optionBase: 'shadow-[0_4px_0_0_#f3e8ff]',
            optionActive: 'active:shadow-none active:translate-y-1'
        };
        case 'C2': return {
            bg: 'bg-rose-50', text: 'text-rose-600', accent: 'bg-rose-500',
            border: 'border-rose-100', hover: 'hover:bg-rose-50',
            ring: 'ring-rose-100', progress: 'bg-rose-500', light: 'bg-rose-100',
            gradient: 'from-rose-50 via-white to-rose-50',
            blobMain: 'bg-rose-300', blobSec: 'bg-pink-300',
            optionBase: 'shadow-[0_4px_0_0_#ffe4e6]',
            optionActive: 'active:shadow-none active:translate-y-1'
        };
        default: return {
            bg: 'bg-violet-50', text: 'text-violet-600', accent: 'bg-violet-500',
            border: 'border-violet-100', hover: 'hover:bg-violet-50',
            ring: 'ring-violet-100', progress: 'bg-violet-500', light: 'bg-violet-100',
            gradient: 'from-violet-50 via-white to-violet-50',
            blobMain: 'bg-violet-300', blobSec: 'bg-fuchsia-300',
            optionBase: 'shadow-[0_4px_0_0_#ede9fe]',
            optionActive: 'active:shadow-none active:translate-y-1'
        };
    }
};

const MiniQuiz: React.FC<MiniQuizProps> = ({ words, topic, onClose, onComplete, isCompleted = false, initialScore = 0 }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, { option: string, isCorrect: boolean }>>({});
    const [quizData, setQuizData] = useState<any[]>([]);
    const [isRetrying, setIsRetrying] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const questionRef = useRef<HTMLHeadingElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const mascotRef = useRef<HTMLDivElement>(null);

    const theme = getTheme(topic);

    const currentQuestion = quizData[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];
    const selectedOption = currentAnswer?.option || null;
    const score = Object.values(answers).filter(a => a.isCorrect).length;

    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { opacity: 0, scale: 0.95, y: 30 },
            { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "elastic.out(1, 0.75)" }
        );

        // Helper to check if definition is a placeholder
        const isPlaceholder = (def: string) => {
            if (!def) return true;
            return def.includes('word at A1 level') ||
                def.includes('word at A2 level') ||
                def.includes('word at B1 level') ||
                def.includes('word at B2 level') ||
                def.includes('word at C1 level') ||
                def.includes('word at C2 level');
        };

        // Filter words with real definitions only
        const validWords = words.filter(w => !isPlaceholder(w.definition_en));

        // If not enough valid words, use all words but mark placeholder ones
        const wordsToUse = validWords.length >= 4 ? validWords : words;

        const questions = wordsToUse.map((word) => {
            // Get distractors from words with real definitions
            const otherValidWords = wordsToUse.filter(w =>
                w.word !== word.word && !isPlaceholder(w.definition_en)
            );

            // If not enough valid distractors, use any other words
            const distractorPool = otherValidWords.length >= 3
                ? otherValidWords
                : wordsToUse.filter(w => w.word !== word.word);

            const distractors = distractorPool
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);

            const options = [...distractors, word].sort(() => 0.5 - Math.random());

            return {
                questionWord: word.word,
                correctMeaning: word.definition_en,
                options: options
            };
        });
        setQuizData(questions.sort(() => 0.5 - Math.random()));
    }, [words]);

    // Question Transition
    useEffect(() => {
        if ((!isCompleted || isRetrying) && quizData.length > 0) {
            setIsTransitioning(false);
            gsap.fromTo(questionRef.current,
                { opacity: 0, scale: 0.9 },
                { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" }
            );
            gsap.fromTo(optionsRef.current?.children || [],
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, delay: 0.1, ease: "back.out(1.2)" }
            );
        }
    }, [currentQuestionIndex, quizData, isCompleted, isRetrying]);

    // Mascot Reaction Logic
    useEffect(() => {
        if (selectedOption) {
            if (currentAnswer.isCorrect) {
                // Happy Jump
                gsap.fromTo(mascotRef.current,
                    { y: 0, scale: 1 },
                    { y: -20, scale: 1.1, duration: 0.3, yoyo: true, repeat: 3 }
                );
            } else {
                // Sad Shake
                gsap.fromTo(mascotRef.current,
                    { x: -5, rotation: -5 },
                    { x: 5, rotation: 5, duration: 0.1, yoyo: true, repeat: 5, clearProps: "all" }
                );
            }
        }
    }, [selectedOption, currentAnswer]);


    const handleOptionClick = (optionMeaning: string) => {
        if (selectedOption || isTransitioning) return;

        const correct = optionMeaning === currentQuestion.correctMeaning;
        setIsTransitioning(true);

        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: { option: optionMeaning, isCorrect: correct }
        }));

        if (correct) {
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.8 },
                colors: ['#4ADE80', '#22C55E', '#FFD700']
            });
        }

        setTimeout(() => {
            gsap.to(optionsRef.current, {
                opacity: 0, x: -50, duration: 0.3, ease: 'power2.in', onComplete: () => {
                    if (currentQuestionIndex < quizData.length - 1) {
                        setCurrentQuestionIndex(prev => prev + 1);
                        gsap.set(optionsRef.current, { x: 0, opacity: 1 });
                    } else {
                        // Calculate final score to pass back
                        const finalScore = Object.values({ ...answers, [currentQuestionIndex]: { isCorrect: correct } }).filter(a => a.isCorrect).length;
                        onComplete(finalScore, quizData.length);
                    }
                }
            });
        }, 1500);
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0 && !isTransitioning) {
            gsap.to(optionsRef.current, {
                opacity: 0, x: 50, duration: 0.2, onComplete: () => {
                    setCurrentQuestionIndex(prev => prev - 1);
                    gsap.set(optionsRef.current, { x: 0, opacity: 1 });
                }
            });
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quizData.length - 1 && !isTransitioning) {
            gsap.to(optionsRef.current, {
                opacity: 0, x: -50, duration: 0.2, onComplete: () => {
                    setCurrentQuestionIndex(prev => prev + 1);
                    gsap.set(optionsRef.current, { x: 0, opacity: 1 });
                }
            });
        }
    };

    if (quizData.length === 0) return null;

    // COMPLETED STATE VIEW
    if (isCompleted && !isRetrying) {
        return (
            <section className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
                <div className="absolute inset-0 opacity-40"
                    style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>
                <div className={`absolute top-1/2 left-1/4 w-96 h-96 ${theme.blobMain} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none`}></div>
                <div className={`absolute top-0 right-1/4 w-96 h-96 ${theme.blobSec} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none`}></div>

                <div ref={containerRef} className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border-4 border-white/50 overflow-hidden relative flex flex-col p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className={`p-6 rounded-full ${theme.light} ${theme.text} ring-8 ring-white/50`}>
                            <Trophy className="w-16 h-16" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-2">Quiz Completed!</h2>
                    <p className="text-slate-500 font-medium mb-8">You have already mastered this quiz.</p>

                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                        <div className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-1">Your Score</div>
                        <div className={`text-5xl font-black ${theme.text}`}>{initialScore}%</div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onClose}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 ${theme.accent} hover:brightness-110`}
                        >
                            Continue Learning
                        </button>
                        <button
                            onClick={() => {
                                setIsRetrying(true);
                                setCurrentQuestionIndex(0);
                                setAnswers({});
                            }}
                            className={`w-full py-4 rounded-xl font-bold ${theme.text} bg-white border-2 ${theme.border} hover:bg-slate-50 transition-colors uppercase tracking-wider text-sm`}
                        >
                            Practice Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>

            <div className="absolute inset-0 opacity-40"
                style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Same Background Blobs */}
            <div className={`absolute top-1/2 left-1/4 w-96 h-96 ${theme.blobMain} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none`}></div>
            <div className={`absolute top-0 right-1/4 w-96 h-96 ${theme.blobSec} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none`}></div>

            {/* Mascot / Structure Hint */}
            <div className="absolute top-20 md:top-[12%] flex flex-col items-center gap-2 animate-float pointer-events-none z-10">
                <div ref={mascotRef} className="bg-white p-4 rounded-3xl shadow-xl border-4 border-slate-100 rotate-[-5deg]">
                    <Brain className={`w-12 h-12 ${theme.text}`} />
                </div>
            </div>

            <button
                onClick={onClose}
                className="absolute top-4 left-4 md:top-8 md:left-8 z-50 p-3 bg-white/40 backdrop-blur-md hover:bg-white/60 text-slate-700 rounded-full shadow-lg border border-white/50 transition-all hover:scale-105 active:scale-95"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

            <div ref={containerRef} className="max-w-3xl w-full bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border-4 border-white/50 overflow-hidden relative flex flex-col max-h-[90vh]">

                <div className="p-6 pb-2 border-b border-slate-100/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            {/* Only show prev button if playability warrants it, though typically unused in quiz flow */}
                            {currentQuestionIndex > 0 && (
                                <button
                                    onClick={prevQuestion}
                                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}

                            {/* Next Button (Manual Navigation for review) */}
                            {currentQuestionIndex < quizData.length - 1 && selectedOption && (
                                <button
                                    onClick={nextQuestion}
                                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>

                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${theme.light} ${theme.text} font-black border border-white/50 shadow-sm`}>
                            <Trophy className="w-4 h-4 fill-current" />
                            <span className="text-base">{score}/{quizData.length}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-2 text-sm text-slate-400 font-bold uppercase tracking-wider">
                        <span>Progress</span>
                        <span>{currentQuestionIndex + 1}/{quizData.length}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden ${theme.progress} shadow-[0_2px_4px_rgba(0,0,0,0.1)]`}
                            style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-progress-indeterminate w-full h-full" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="mb-8 text-center">
                            <h3 className="text-2xl md:text-3xl font-black text-slate-800 leading-relaxed mb-2">
                                <span ref={questionRef} className="inline-block">
                                    What means <span className={`${theme.text} underline decoration-wavy decoration-4 underline-offset-4`}>{currentQuestion.questionWord}</span>?
                                </span>
                            </h3>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Choose the correct definition</p>
                        </div>

                        <div ref={optionsRef} className="grid grid-cols-1 gap-4">
                            {currentQuestion.options.map((option: VocabWord, idx: number) => {
                                let labelClass = `bg-white border-2 border-slate-200 text-slate-700 shadow-[0_4px_0_0_#e2e8f0] hover:-translate-y-1 hover:border-${theme.text.split('-')[1]}-300 hover:text-${theme.text.split('-')[1]}-600 hover:shadow-[0_6px_0_0_#e2e8f0]`;
                                let indicatorClass = "bg-slate-100 text-slate-400";
                                let indicator = String.fromCharCode(65 + idx);

                                if (selectedOption) {
                                    if (option.definition_en === currentQuestion.correctMeaning) {
                                        labelClass = "bg-green-100 border-green-500 text-green-800 shadow-[0_4px_0_0_#22c55e] translate-y-[-2px]";
                                        indicatorClass = "bg-green-500 text-white";
                                        indicator = "✓";
                                    } else if (option.definition_en === selectedOption) {
                                        labelClass = "bg-red-100 border-red-500 text-red-800 shadow-[0_4px_0_0_#ef4444] translate-y-[-2px]";
                                        indicatorClass = "bg-red-500 text-white";
                                        indicator = "✕";
                                    } else {
                                        labelClass = "bg-slate-50 border-slate-100 opacity-40 grayscale shadow-none translate-y-0";
                                    }
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionClick(option.definition_en)}
                                        disabled={!!selectedOption}
                                        className={`
                                            w-full text-left p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] 
                                            flex items-center gap-4 group relative font-bold text-lg
                                            ${labelClass}
                                        `}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${indicatorClass}`}>
                                            {indicator === "✓" ? <CheckCircle className="w-6 h-6" /> : indicator === "✕" ? <XCircle className="w-6 h-6" /> : indicator}
                                        </div>
                                        <span className="flex-1 leading-snug">
                                            {option.definition_en}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Feedback Bar */}
                <div className={`
                    border-t-4 border-slate-100 bg-white overflow-hidden transition-all duration-300 ease-in-out
                    ${selectedOption ? 'h-24 opacity-100' : 'h-0 opacity-0 border-transparent'}
                `}>
                    <div className={`
                        w-full h-full flex items-center justify-center gap-4 text-white font-black text-2xl
                        ${currentAnswer?.isCorrect ? 'bg-green-500' : 'bg-red-500'}
                    `}>
                        {currentAnswer?.isCorrect ? (
                            <>
                                <PartyPopper className="w-8 h-8 animate-bounce" />
                                <div className="flex flex-col items-start">
                                    <span>Correct!</span>
                                    <span className="text-sm font-medium opacity-90">Next question coming up...</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-8 h-8 animate-pulse" />
                                <div className="flex flex-col items-start">
                                    <span>Oops!</span>
                                    <span className="text-sm font-medium opacity-90">Don't worry, keep going!</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default MiniQuiz;
