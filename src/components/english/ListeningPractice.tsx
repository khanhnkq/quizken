import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Volume2,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Heart,
    Flame,
    Trophy,
    RotateCcw,
    Headphones,
    Keyboard,
    HelpCircle,
    XCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/hooks/use-toast';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { VocabWord } from '@/lib/constants/cefrVocabData';

interface ListeningPracticeProps {
    words: VocabWord[];
    onComplete?: () => void;
    onClose?: () => void;
    level?: string;
}

const ListeningPractice: React.FC<ListeningPracticeProps> = ({
    words,
    onComplete,
    onClose,
    level = 'A1'
}) => {
    const { t } = useTranslation();
    // Game state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hearts, setHearts] = useState(3);
    const [streak, setStreak] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Dictation state
    const [userInput, setUserInput] = useState('');
    const [showHint, setShowHint] = useState(false);
    const [checkStatus, setCheckStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
    const [shuffledWords, setShuffledWords] = useState<VocabWord[]>([]);

    // Refs
    const inputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Initial shuffle
    useEffect(() => {
        const shuffled = [...words].sort(() => 0.5 - Math.random()).slice(0, 10);
        setShuffledWords(shuffled);
    }, [words]);

    const currentWord = shuffledWords[currentIndex];

    // Auto-focus input and play sound on word change
    useEffect(() => {
        if (currentWord && !isFinished) {
            setUserInput('');
            setCheckStatus('idle');
            setShowHint(false);

            // Short delay to allow transition
            const timer = setTimeout(() => {
                inputRef.current?.focus();
                playWord();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [currentIndex, currentWord, isFinished]);

    // Text-to-Speech
    const speak = useCallback((text: string, lang: string = 'en-US') => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.8; // Hơi chậm một chút để dễ nghe
            utterance.pitch = 1;

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const playWord = () => {
        if (currentWord) {
            speak(currentWord.word);
            // Pulse animation
            gsap.fromTo(cardRef.current, { scale: 1 }, { scale: 1.02, duration: 0.1, yoyo: true, repeat: 1 });
        }
    };

    const handleCheck = () => {
        if (!processInput(userInput) || checkStatus === 'correct') return;

        const correctWord = processInput(currentWord.word);
        const userWord = processInput(userInput);

        if (userWord === correctWord) {
            // CORRECT
            setCheckStatus('correct');
            setStreak(prev => prev + 1);

            // Celebration
            if (streak > 0 && streak % 3 === 2) {
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            }

            // Sound effect (optional) maybe just UI feedback
            toast({ title: t('englishHub.listening.toast.correct'), description: t('englishHub.listening.toast.correctDesc'), variant: "success", duration: 1000 });

        } else {
            // INCORRECT
            setCheckStatus('incorrect');
            setHearts(prev => Math.max(0, prev - 1));
            setStreak(0);

            // Shake animation
            gsap.to(cardRef.current, { x: 10, yoyo: true, repeat: 5, duration: 0.1 });

            // Auto show hint if wrong
            if (hearts <= 1) setShowHint(true);
        }
    };

    const handleNext = () => {
        if (currentIndex < shuffledWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            // Animation out
            gsap.fromTo(cardRef.current,
                { opacity: 0, x: 50 },
                { opacity: 1, x: 0, duration: 0.3 }
            );
        } else {
            setIsFinished(true);
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
        }
    };

    const handleGiveUp = () => {
        setCheckStatus('incorrect');
        setHearts(prev => Math.max(0, prev - 1));
        setStreak(0);
        setUserInput(currentWord.word); // Show answer
        setShowHint(true);
    };

    const processInput = (s: string) => s.trim().toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

    // Key press handler
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            if (checkStatus === 'correct') {
                handleNext();
            } else if (checkStatus === 'incorrect' && userInput.toLowerCase() === currentWord.word.toLowerCase()) {
                // If incorrectly answered but now showing correct answer (gave up), move next
                handleNext();
            } else {
                handleCheck();
            }
        }
    };

    // Theme helpers
    const getTheme = () => {
        const themes: Record<string, any> = {
            'A1': { gradient: 'from-green-50 to-emerald-50', accent: 'bg-green-500', text: 'text-green-600', border: 'border-green-200' },
            'A2': { gradient: 'from-lime-50 to-green-50', accent: 'bg-lime-500', text: 'text-lime-600', border: 'border-lime-200' },
            'B1': { gradient: 'from-amber-50 to-yellow-50', accent: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200' },
            'B2': { gradient: 'from-orange-50 to-amber-50', accent: 'bg-orange-500', text: 'text-orange-600', border: 'border-orange-200' },
            'C1': { gradient: 'from-red-50 to-orange-50', accent: 'bg-red-500', text: 'text-red-600', border: 'border-red-200' },
            'C2': { gradient: 'from-rose-50 to-red-50', accent: 'bg-rose-500', text: 'text-rose-600', border: 'border-rose-200' },
        };
        return themes[level] || themes['A1'];
    };
    const theme = getTheme();

    // Reset/Restart function
    const handleRestart = () => {
        const shuffled = [...words].sort(() => 0.5 - Math.random()).slice(0, 10);
        setShuffledWords(shuffled);
        setCurrentIndex(0);
        setHearts(3);
        setStreak(0);
        setIsFinished(false);
        setUserInput('');
        setShowHint(false);
        setCheckStatus('idle');
    };

    // Game Over Screen - When all hearts are lost
    if (hearts <= 0) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-red-100 text-center max-w-md w-full relative">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-inner">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-2">{t('englishHub.listening.gameOver.title')}</h3>
                    <p className="text-slate-500 font-medium mb-6">{t('englishHub.listening.gameOver.description')}</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="text-2xl font-black text-slate-500">{currentIndex}/{shuffledWords.length}</div>
                            <div className="text-xs font-bold text-slate-300 uppercase">{t('englishHub.listening.gameOver.progress')}</div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <div className="text-2xl font-black text-orange-500">{streak}</div>
                            <div className="text-xs font-bold text-orange-300 uppercase">{t('englishHub.listening.gameOver.bestStreak')}</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                        >
                            {t('englishHub.listening.gameOver.exit')}
                        </button>
                        <button
                            onClick={handleRestart}
                            className="flex-[2] px-8 py-4 bg-orange-500 text-white rounded-2xl font-black shadow-[0_4px_0_0_#c2410c] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-6 h-6" />
                            {t('englishHub.listening.gameOver.retry')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-white/95 backdrop-blur-md animate-in fade-in zoom-in duration-300">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-slate-100 text-center max-w-md w-full relative">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce shadow-inner">
                        <Trophy className="w-12 h-12 text-yellow-500" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-800 mb-2">{t('englishHub.listening.complete.title')}</h3>
                    <p className="text-slate-500 font-medium mb-8">{t('englishHub.listening.complete.description')}</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                            <div className="text-2xl font-black text-orange-500">{streak}</div>
                            <div className="text-xs font-bold text-orange-300 uppercase">{t('englishHub.listening.complete.bestStreak')}</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                            <div className="text-2xl font-black text-red-500">{hearts}</div>
                            <div className="text-xs font-bold text-red-300 uppercase">{t('englishHub.listening.complete.heartsLeft')}</div>
                        </div>
                    </div>

                    <button
                        onClick={onComplete}
                        className="w-full px-8 py-4 bg-green-500 text-white rounded-2xl font-black shadow-[0_4px_0_0_#16a34a] hover:brightness-110 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-6 h-6" />
                        {t('englishHub.listening.complete.backToLesson')}
                    </button>
                </div>
            </div>
        );
    }

    if (!currentWord) return null;

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-start pt-24 md:pt-0 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }} />

            {/* Floating Back Button */}
            <button
                onClick={onClose}
                className="absolute top-16 left-4 md:top-8 md:left-8 z-50 p-3 bg-white/60 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/80 transition-all border border-white/50"
            >
                <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>

            {/* Top Bar */}
            <div className="w-full max-w-md flex items-center justify-between mb-4 relative z-10 px-4 md:mt-28">
                {/* Spacer for symmetry */}
                <div className="w-12"></div>

                {/* Progress Bar */}
                <div className="flex-1 mx-4 h-5 bg-white rounded-full overflow-hidden shadow-inner p-1 border border-white/50">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.accent} shadow-sm`}
                        style={{ width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` }}
                    />
                </div>

                {/* Status: Hearts & Streak */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-white p-2 rounded-2xl border border-white/50 shadow-sm">
                        {[1, 2, 3].map(i => (
                            <Heart
                                key={i}
                                className={`w-5 h-5 transition-all ${i <= hearts ? 'fill-red-500 text-red-500' : 'fill-slate-200 text-slate-200'}`}
                            />
                        ))}
                    </div>
                    {streak > 1 && (
                        <div className="flex items-center gap-1 px-3 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-2xl font-black shadow-lg animate-bounce">
                            <Flame className="w-4 h-4 fill-white" />
                            <span className="text-sm">x{streak}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full flex flex-col items-center justify-center p-4 relative z-10">
                <div
                    ref={cardRef}
                    className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-2xl p-6 md:p-10 border-4 border-white relative"
                >
                    {/* Topic Badge */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-full shadow-lg border-2 border-slate-100 flex items-center gap-2">
                        <Headphones className={`w-5 h-5 ${theme.text}`} />
                        <span className="font-bold text-slate-600 uppercase tracking-wider text-sm">{t('englishHub.listening.title')}</span>
                    </div>

                    {/* Word Sound Control */}
                    <div className="flex flex-col items-center gap-6 mb-8 mt-4">
                        <button
                            onClick={playWord}
                            className={`
                                w-24 h-24 rounded-full flex items-center justify-center
                                ${theme.accent} text-white shadow-[0_8px_0_0_rgba(0,0,0,0.15)]
                                hover:translate-y-[-2px] hover:shadow-[0_10px_0_0_rgba(0,0,0,0.15)]
                                active:translate-y-[2px] active:shadow-[0_4px_0_0_rgba(0,0,0,0.15)]
                                transition-all duration-150 group
                            `}
                        >
                            <Volume2 className={`w-12 h-12 ${isSpeaking ? 'animate-pulse' : 'group-hover:scale-110'} transition-transform`} />
                        </button>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-wide">{t('englishHub.listening.tapToReplay')}</p>
                    </div>

                    {/* Hint / Meaning Display */}
                    {(showHint || checkStatus !== 'idle') && (
                        <div className="mb-6 p-4 bg-slate-50 rounded-2xl text-center animate-in fade-in slide-in-from-top-2 border border-slate-100">
                            <p className="text-slate-500 font-medium mb-1">{t('englishHub.listening.meaningLabel')}</p>
                            <p className="text-xl font-bold text-slate-800">{currentWord.definition_vi}</p>
                            {checkStatus === 'incorrect' && (
                                <p className="mt-2 text-rose-500 font-bold text-sm">{t('englishHub.listening.correctAnswer')} {currentWord.word}</p>
                            )}
                        </div>
                    )}

                    {/* Input Field */}
                    <div className="relative mb-8">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => {
                                setUserInput(e.target.value);
                                if (checkStatus !== 'idle') setCheckStatus('idle'); // Reset status on edit
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder={t('englishHub.listening.inputPlaceholder')}
                            className={`
                                w-full bg-slate-100 text-center text-2xl md:text-3xl font-bold py-4 px-6 rounded-2xl
                                border-4 outline-none transition-all placeholder:text-slate-300 placeholder:font-bold
                                ${checkStatus === 'correct' ? 'border-green-400 bg-green-50 text-green-700' :
                                    checkStatus === 'incorrect' ? 'border-red-400 bg-red-50 text-red-700' :
                                        'border-slate-200 focus:border-blue-400 focus:bg-white'}
                            `}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            disabled={checkStatus === 'correct'}
                        />
                        {checkStatus === 'correct' && (
                            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 w-8 h-8 animate-in zoom-in spin-in-90" />
                        )}
                        {checkStatus === 'incorrect' && (
                            <XCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 w-8 h-8 animate-in zoom-in" />
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        {checkStatus === 'idle' ? (
                            <>
                                <button
                                    onClick={handleGiveUp}
                                    className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 bg-slate-100/50 hover:bg-slate-100 rounded-2xl transition-colors"
                                >
                                    {t('englishHub.listening.giveUp')}
                                </button>
                                <button
                                    onClick={handleCheck}
                                    disabled={!userInput.trim()}
                                    className={`
                                        flex-[2] py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)]
                                        active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2
                                        ${!userInput.trim() ? 'bg-slate-300 cursor-not-allowed shadow-none' : `${theme.accent} hover:brightness-110`}
                                    `}
                                >
                                    {t('englishHub.listening.check')}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={handleNext}
                                className={`
                                    w-full py-4 rounded-2xl font-black text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)]
                                    active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2
                                    ${checkStatus === 'correct' ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-500 hover:bg-slate-600'}
                                `}
                            >
                                {currentIndex < shuffledWords.length - 1 ? t('englishHub.listening.next') : t('englishHub.listening.finish')}
                                <ArrowRight className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* Keyboard Hint */}
            <div className="hidden md:flex justify-center pb-6 text-slate-500 font-bold text-sm opacity-60">
                <span className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4" /> {t('englishHub.listening.keyboardHint')}
                </span>
            </div>
        </div>
    );
};

export default ListeningPractice;
