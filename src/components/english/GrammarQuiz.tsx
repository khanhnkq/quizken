import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Heart, Lightbulb, X, Brain } from 'lucide-react';
import { GrammarLesson, GrammarExercise } from '../../lib/constants/grammarLessons';
import { GRAMMAR_QUIZ_DATA } from '@/lib/constants/grammarQuizData';
import { toast } from '@/hooks/use-toast';
import confetti from 'canvas-confetti';

interface CategoryTheme {
    id: string;
    color: string;
    bg: string;
    text: string;
    border: string;
}

interface GrammarQuizProps {
    lesson: GrammarLesson;
    theme?: CategoryTheme;
    onComplete: (score: number) => void;
    onClose: () => void;
    isCompleted?: boolean;
    initialScore?: number;
}

const GrammarQuiz: React.FC<GrammarQuizProps> = ({ lesson, theme, onComplete, onClose, isCompleted = false, initialScore = 0 }) => {
    const { i18n } = useTranslation();
    const isVietnamese = i18n.language === 'vi';

    const [exercises, setExercises] = useState<GrammarExercise[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hearts, setHearts] = useState(3);
    const [score, setScore] = useState(0);
    const [checkStatus, setCheckStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [showHint, setShowHint] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    // Initialize exercises
    useEffect(() => {
        // Try to get specific exercises for this lesson from quiz data
        const specificExercises = GRAMMAR_QUIZ_DATA[lesson.id];

        let pool: GrammarExercise[] = [];

        if (specificExercises && specificExercises.length > 0) {
            // Convert QuizQuestion to GrammarExercise structure
            pool = specificExercises.map(q => ({
                id: q.id,
                type: q.type,
                question: q.question,
                answer: q.answer,
                options: q.options,
                explanation: q.explanation
            }));
        } else if (lesson.exercises.length > 0) {
            pool = [...lesson.exercises];
        }

        if (pool.length > 0) {
            // Shuffle and take up to 15 exercises (or all if less)
            const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 15);
            setExercises(shuffled);
        }
    }, [lesson]);

    const currentExercise = exercises[currentIndex];

    const checkAnswer = (answerValue?: string) => {
        if (!currentExercise) return;

        const answer = (answerValue || (currentExercise.type === 'choose' ? selectedOption : userAnswer)).trim().toLowerCase();
        const correct = currentExercise.answer.toLowerCase();

        if (answer === correct) {
            setCheckStatus('correct');
            setScore(prev => prev + 1);

            // Confetti Effect
            confetti({
                particleCount: 50,
                spread: 70,
                origin: { y: 0.7 },
                colors: ['#4ADE80', '#22C55E', '#FFD700']
            });

            // Auto Next
            setTimeout(() => {
                handleNext();
            }, 1000);

        } else {
            setCheckStatus('incorrect');
            setHearts(prev => prev - 1);
            setShowHint(true);
        }
    };

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
        checkAnswer(option);
    };

    const handleRestart = () => {
        // Re-fetch pool to ensure we use specific data if available
        const specificExercises = GRAMMAR_QUIZ_DATA[lesson.id];
        let pool: GrammarExercise[] = [];

        if (specificExercises && specificExercises.length > 0) {
            pool = specificExercises.map(q => ({
                id: q.id,
                type: q.type,
                question: q.question,
                answer: q.answer,
                options: q.options,
                explanation: q.explanation
            }));
        } else if (lesson.exercises.length > 0) {
            pool = [...lesson.exercises];
        }

        if (pool.length > 0) {
            const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 15);
            setExercises(shuffled);
        }

        setCurrentIndex(0);
        setUserAnswer('');
        setSelectedOption(null);
        setHearts(3);
        setScore(0);
        setCheckStatus('idle');
        setShowHint(false);
        setIsFinished(false);
    };

    const handleNext = () => {
        if (currentIndex < exercises.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserAnswer('');
            setSelectedOption(null);
            setCheckStatus('idle');
            setShowHint(false);
        } else {
            setIsFinished(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (checkStatus === 'idle' && (userAnswer.trim() || selectedOption)) {
                checkAnswer();
            } else if (checkStatus !== 'idle') {
                handleNext();
            }
        }
    };

    // COMPLETED STATE VIEW (like MiniQuiz)
    if (isCompleted && !isRetrying) {
        const gradientBg = theme?.color ? `from-${theme.color.split(' ')[0].replace('from-', '')}-50 to-${theme.color.split(' ')[1]?.replace('to-', '') || 'indigo'}-50` : 'from-indigo-50 to-purple-50';

        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-indigo-50 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 opacity-40"
                    style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                </div>
                <div className={`absolute top-1/2 left-1/4 w-96 h-96 ${theme?.bg || 'bg-indigo-300'} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none`}></div>
                <div className={`absolute top-0 right-1/4 w-96 h-96 ${theme?.bg || 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none`}></div>

                <div className="max-w-md w-full bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl border-4 border-white/50 overflow-hidden relative flex flex-col p-8 text-center">
                    <div className="mb-6 flex justify-center">
                        <div className={`p-6 rounded-full ${theme?.bg || 'bg-indigo-100'} ${theme?.text || 'text-indigo-600'} ring-8 ring-white/50`}>
                            <Trophy className="w-16 h-16" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-2">
                        {isVietnamese ? 'Đã hoàn thành!' : 'Quiz Completed!'}
                    </h2>
                    <p className="text-slate-500 font-medium mb-8">
                        {isVietnamese ? 'Bạn đã làm bài quiz này rồi.' : 'You have already mastered this quiz.'}
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                        <div className="text-sm uppercase tracking-widest text-slate-400 font-bold mb-1">
                            {isVietnamese ? 'Điểm số' : 'Your Score'}
                        </div>
                        <div className={`text-5xl font-black ${theme?.text || 'text-indigo-600'}`}>{initialScore}%</div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onClose}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 bg-gradient-to-r ${theme?.color || 'from-indigo-500 to-purple-500'} hover:brightness-110`}
                        >
                            {isVietnamese ? 'Tiếp tục học' : 'Continue Learning'}
                        </button>
                        <button
                            onClick={() => {
                                setIsRetrying(true);
                                setCurrentIndex(0);
                                setUserAnswer('');
                                setSelectedOption(null);
                                setHearts(3);
                                setScore(0);
                                setCheckStatus('idle');
                                setShowHint(false);
                                setIsFinished(false);
                            }}
                            className={`w-full py-4 rounded-xl font-bold ${theme?.text || 'text-indigo-600'} bg-white border-2 ${theme?.border || 'border-indigo-100'} hover:bg-slate-50 transition-colors uppercase tracking-wider text-sm`}
                        >
                            {isVietnamese ? 'Luyện tập lại' : 'Practice Again'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Game Over
    if (hearts <= 0) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
                <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-red-100 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">
                        {isVietnamese ? 'Hết trái tim!' : 'Out of hearts!'}
                    </h3>
                    <p className="text-slate-500 mb-6">
                        {isVietnamese ? 'Hãy ôn lại lý thuyết và thử lại nhé!' : 'Review the lesson and try again!'}
                    </p>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">
                            {isVietnamese ? 'Thoát' : 'Exit'}
                        </button>
                        <button
                            onClick={handleRestart}
                            className="flex-[2] py-3 bg-orange-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            {isVietnamese ? 'Làm lại' : 'Try Again'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Finished
    if (isFinished) {
        const percentage = Math.round((score / exercises.length) * 100);
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-green-100 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <Trophy className="w-10 h-10 text-yellow-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">
                        {isVietnamese ? 'Hoàn thành!' : 'Complete!'}
                    </h3>
                    <p className="text-slate-500 mb-4">
                        {isVietnamese ? `Bạn đạt ${percentage}% chính xác` : `You scored ${percentage}%`}
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-green-50 p-3 rounded-xl">
                            <div className="text-2xl font-black text-green-600">{score}/{exercises.length}</div>
                            <div className="text-xs text-green-400">{isVietnamese ? 'Câu đúng' : 'Correct'}</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-xl">
                            <div className="text-2xl font-black text-red-500">{hearts}/3</div>
                            <div className="text-xs text-red-400">{isVietnamese ? 'Tim còn lại' : 'Hearts left'}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => onComplete(Math.max(0, percentage))}
                        className="w-full py-4 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-5 h-5" />
                        {isVietnamese ? 'Hoàn thành bài học' : 'Complete Lesson'}
                    </button>
                </div>
            </div>
        );
    }

    if (!currentExercise || exercises.length === 0) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
                <p className="text-slate-500">No exercises available</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 pb-24 bg-slate-50 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${theme ? theme.color : 'from-indigo-50 to-purple-50'} opacity-10 pointer-events-none`} />
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* Derived Blob Colors */}
            <div className={`absolute top-1/2 left-1/4 w-96 h-96 ${theme ? theme.text.replace('text-', 'bg-').replace('600', '300') : 'bg-indigo-300'} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none`}></div>
            <div className={`absolute top-0 right-1/4 w-96 h-96 ${theme ? theme.text.replace('text-', 'bg-').replace('600', '200') : 'bg-purple-300'} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none`}></div>

            {/* Mascot Floating */}
            <div className="absolute top-20 md:top-[12%] flex flex-col items-center gap-2 animate-float pointer-events-none z-10 transition-all duration-500">
                <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-slate-100 rotate-[-5deg]">
                    <Brain className={`w-12 h-12 ${theme?.text || 'text-indigo-500'}`} />
                </div>
            </div>

            {/* Header (Back Button) */}
            <button onClick={onClose} className="absolute top-4 left-4 z-50 p-3 bg-white/40 backdrop-blur-md hover:bg-white/60 text-slate-700 rounded-full shadow-lg border border-white/50 transition-all hover:scale-105 active:scale-95">
                <X className="w-6 h-6" />
            </button>

            {/* Main Card */}
            <div className="relative z-20 w-full max-w-2xl bg-white/95 backdrop-blur-sm rounded-[2.5rem] shadow-2xl p-6 md:p-8 border-4 border-white/50 flex flex-col max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {isVietnamese ? 'Tiến độ' : 'Progress'}
                        </span>
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={`h-full ${theme ? theme.bg.replace('bg-', 'bg-').replace('50', '500') : 'bg-indigo-500'} rounded-full transition-all duration-500`}
                                    style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
                                />
                            </div>
                            <span className={`font-black text-sm ${theme?.text}`}>
                                {currentIndex + 1}/{exercises.length}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100">
                        {[...Array(3)].map((_, i) => (
                            <Heart key={i} className={`w-5 h-5 transition-colors ${i < hearts ? 'fill-red-500 text-red-500' : 'fill-slate-200 text-slate-200'}`} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    {/* Question Type Badge */}
                    <div className="self-center inline-block px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-xs font-black uppercase tracking-wider mb-6">
                        {currentExercise.type === 'fill-blank' ? (isVietnamese ? 'Điền từ' : 'Fill in the blank') :
                            currentExercise.type === 'choose' ? (isVietnamese ? 'Chọn đáp án' : 'Multiple Choice') :
                                currentExercise.type === 'transform' ? (isVietnamese ? 'Biến đổi câu' : 'Sentence Transformation') :
                                    (isVietnamese ? 'Ghép câu' : 'Combine Sentences')}
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-slate-800 text-center mb-8 leading-tight">
                        {currentExercise.question}
                    </h2>

                    {/* Options / Input */}
                    {currentExercise.type === 'choose' && currentExercise.options ? (
                        <div className="grid grid-cols-1 gap-3 mb-6">
                            {currentExercise.options.map((option, i) => {
                                const isSelected = selectedOption === option;
                                // Determine Styling State
                                let stateStyle = 'bg-white border-slate-200 text-slate-600 shadow-[0_4px_0_0_#cbd5e1] hover:border-indigo-300 hover:text-indigo-600 hover:-translate-y-1';
                                let badgeStyle = 'bg-slate-100 text-slate-400';

                                if (isSelected) {
                                    if (checkStatus === 'correct') {
                                        stateStyle = 'bg-green-100 border-green-500 text-green-700 shadow-[0_4px_0_0_#22c55e]';
                                        badgeStyle = 'bg-green-500 text-white';
                                    } else if (checkStatus === 'incorrect') {
                                        stateStyle = option === currentExercise.answer
                                            ? 'bg-green-100 border-green-500 text-green-700 shadow-[0_4px_0_0_#22c55e]' // Show correct if wrong
                                            : 'bg-red-100 border-red-500 text-red-700 shadow-[0_4px_0_0_#ef4444]';
                                        badgeStyle = option === currentExercise.answer ? 'bg-green-500 text-white' : 'bg-red-500 text-white';
                                    } else {
                                        stateStyle = 'bg-indigo-100 border-indigo-500 text-indigo-700 shadow-[0_4px_0_0_#6366f1]';
                                        badgeStyle = 'bg-indigo-500 text-white';
                                    }
                                } else if (checkStatus !== 'idle' && option === currentExercise.answer) {
                                    // Reveal correct answer if user missed it
                                    stateStyle = 'bg-green-50 border-green-300 text-green-700 opacity-70';
                                    badgeStyle = 'bg-green-200 text-green-700';
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => checkStatus === 'idle' && handleOptionClick(option)}
                                        disabled={checkStatus !== 'idle'}
                                        className={`w-full p-4 rounded-2xl font-bold text-lg text-left border-2 transition-all active:scale-[0.99] flex items-center gap-4 group ${stateStyle}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black transition-colors ${badgeStyle}`}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <span className="flex-1">{option}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mb-6">
                            <input
                                type="text"
                                value={userAnswer}
                                onChange={(e) => checkStatus === 'idle' && setUserAnswer(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isVietnamese ? 'Nhập câu trả lời...' : 'Type your answer...'}
                                disabled={checkStatus !== 'idle'}
                                className={`w-full p-5 rounded-2xl text-xl font-bold border-2 outline-none shadow-sm transition-all text-center
                                    ${checkStatus === 'correct' ? 'bg-green-50 border-green-400 text-green-700' :
                                        checkStatus === 'incorrect' ? 'bg-red-50 border-red-400 text-red-700' :
                                            'bg-slate-50 border-slate-200 focus:border-indigo-400 focus:bg-white focus:shadow-md'
                                    }`}
                            />
                        </div>
                    )}

                    {/* Hint */}
                    {showHint && checkStatus === 'incorrect' && (
                        <div className="mb-6 p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                            <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                <Lightbulb className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">
                                    {isVietnamese ? 'Đáp án đúng' : 'Correct Answer'}
                                </div>
                                <p className="text-amber-900 font-bold text-lg">{currentExercise.answer}</p>
                            </div>
                        </div>
                    )}

                    {/* Check Button */}
                    <div className="mt-auto">
                        {/* Check Button */}
                        <div className="mt-auto">
                            {(currentExercise.type !== 'choose' || checkStatus === 'incorrect') && (
                                <button
                                    onClick={() => checkStatus === 'idle' ? checkAnswer() : handleNext()}
                                    disabled={checkStatus === 'idle' && !userAnswer.trim() && !selectedOption}
                                    className={`w-full py-4 rounded-2xl font-black text-xl shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2
                                    ${checkStatus === 'idle'
                                            ? (userAnswer.trim() || selectedOption)
                                                ? 'bg-indigo-500 text-white shadow-indigo-700 hover:brightness-110'
                                                : 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed shadow-none'
                                            : checkStatus === 'correct'
                                                ? 'bg-green-500 text-white shadow-green-700'
                                                : 'bg-slate-700 text-white shadow-slate-900'
                                        }`}
                                >
                                    {checkStatus === 'idle' ? (isVietnamese ? 'Kiểm tra' : 'Check Answer') : (
                                        <>
                                            {currentIndex < exercises.length - 1 ? (isVietnamese ? 'Tiếp tục' : 'Continue') : (isVietnamese ? 'Hoàn thành' : 'Finish')}
                                            <ArrowRight className="w-6 h-6" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrammarQuiz;
