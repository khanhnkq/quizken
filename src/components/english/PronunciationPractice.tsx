import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Mic,
    Square,
    Volume2,
    ArrowRight,
    RotateCcw,
    CheckCircle,
    AlertCircle,
    Loader2,
    XCircle,
    Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '@/lib/auth';
import { VocabWord } from '@/lib/constants/cefrVocabData';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { getPronunciationFeedback, getUserGeminiKey } from '@/lib/geminiPronunciation';
import { toast } from '@/hooks/use-toast';

interface PronunciationPracticeProps {
    words: VocabWord[];
    onComplete: (score: number) => void;
    onClose: () => void;
    level?: string;
}

const getTheme = (level: string) => {
    // Reusing Phase 1 theme logic for consistency
    const themes: Record<string, string> = {
        'A1': 'from-green-50 to-emerald-50 text-green-600 bg-green-100 border-green-200',
        'A2': 'from-cyan-50 to-teal-50 text-cyan-600 bg-cyan-100 border-cyan-200',
        'B1': 'from-blue-50 to-indigo-50 text-blue-600 bg-blue-100 border-blue-200',
        'B2': 'from-indigo-50 to-violet-50 text-indigo-600 bg-indigo-100 border-indigo-200',
        'C1': 'from-purple-50 to-fuchsia-50 text-purple-600 bg-purple-100 border-purple-200',
        'C2': 'from-rose-50 to-pink-50 text-rose-600 bg-rose-100 border-rose-200',
    };
    return themes[level] || themes['A1'];
};

const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({
    words,
    onComplete,
    onClose,
    level = 'A1'
}) => {
    const { t, i18n } = useTranslation();
    const isVietnamese = i18n.language === 'vi';
    const { user } = useAuth();

    // State
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<{
        accuracy: number;
        error: string;
        tip: string;
        isCorrect: boolean;
    } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [score, setScore] = useState(0);
    const [apiKey, setApiKey] = useState<string | null>(null);

    // Hooks
    const {
        isListening,
        isSupported,
        transcript,
        error,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechRecognition('en-US');

    // Data
    const currentWord = words[currentIndex % words.length];
    const theme = getTheme(level);
    const [bgGradient, textColor, accentBg, borderColor] = theme.split(' ');

    // Init Gemini Key
    useEffect(() => {
        if (user) {
            getUserGeminiKey(user.id).then(key => setApiKey(key));
        }
    }, [user]);

    // TTS Helper
    const playAudio = () => {
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Slightly slower for practice
        window.speechSynthesis.speak(utterance);
    };

    // Log errors from speech recognition
    useEffect(() => {
        if (error) {
            console.error('[PronunciationPractice] Speech Recognition Error:', {
                word: currentWord.word,
                error: error,
                mode: isListening ? 'listening' : 'idle',
                timestamp: new Date().toISOString()
            });

            // Show toast for critical errors if needed
            if (error === 'not-allowed') {
                toast({
                    title: isVietnamese ? "Lỗi truy cập micro" : "Microphone Access Error",
                    description: isVietnamese ? "Vui lòng cấp quyền micro cho trang web." : "Please allow microphone access.",
                    variant: "destructive",
                });
            }
        }
    }, [error, currentWord.word, isVietnamese]);

    // Auto-analyze when speech stops
    useEffect(() => {
        if (transcript && !isListening && !isAnalyzing && !feedback) {
            handleAnalyze();
        }
    }, [transcript, isListening]);

    const handleAnalyze = async () => {
        if (!transcript.trim()) return;

        setIsAnalyzing(true);

        // Use Gemini if key exists, otherwise internal fallback logic inside helper
        const result = await getPronunciationFeedback(
            currentWord.word,
            transcript,
            apiKey || '', // Helper handles empty key gracefully with fallback
            isVietnamese
        );

        setFeedback(result);
        setIsAnalyzing(false);

        if (result.isCorrect) {
            setScore(prev => prev + 10);
            confetti({
                particleCount: 30,
                spread: 50,
                origin: { y: 0.7 }
            });
        }
    };

    const handleNext = () => {
        if (currentIndex >= words.length - 1) {
            setIsFinished(true);
        } else {
            setCurrentIndex(prev => prev + 1);
            setFeedback(null);
            resetTranscript();
        }
    };

    const handleRetry = () => {
        setFeedback(null);
        resetTranscript();
    };

    if (!isSupported) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Browser Not Supported</h3>
                    <p className="text-slate-500 mb-6">Your browser does not support voice recognition. Please use Chrome or Safari.</p>
                    <button onClick={onClose} className="px-6 py-2 bg-slate-100 rounded-lg font-bold">Close</button>
                </div>
            </div>
        );
    }

    if (isFinished) {
        return (
            <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 bg-gradient-to-br ${bgGradient}`}>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full animate-scale-in">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${accentBg} ring-8 ring-white shadow-lg`}>
                        <Trophy className={`w-10 h-10 ${textColor}`} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">
                        {isVietnamese ? 'Hoàn thành!' : 'Practice Complete!'}
                    </h2>
                    <p className="text-slate-500 font-medium mb-6">
                        {isVietnamese ? 'Bạn đã luyện tập rất chăm chỉ.' : 'Great effort practicing your pronunciation.'}
                    </p>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                            {isVietnamese ? 'Điểm của bạn' : 'Your Score'}
                        </div>
                        <div className={`text-4xl font-black ${textColor}`}>{score}</div>
                    </div>

                    <button
                        onClick={() => onComplete(score)}
                        className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-transform active:scale-95 bg-gradient-to-r from-blue-500 to-indigo-500`}
                    >
                        {isVietnamese ? 'Tiếp tục' : 'Continue'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-[50] flex flex-col bg-gradient-to-br ${bgGradient}`}>
            {/* Header */}
            <div className="flex-none p-4 flex justify-between items-center max-w-2xl mx-auto w-full">
                <button onClick={onClose} className="p-2 rounded-full bg-white/50 hover:bg-white transition-colors">
                    <XCircle className="w-6 h-6 text-slate-500" />
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: Math.min(words.length, 5) }).map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i <= currentIndex ? `w-8 ${textColor.replace('text-', 'bg-')}` : 'w-2 bg-slate-300'
                            }`} />
                    ))}
                </div>
                <div className={`px-3 py-1 rounded-full bg-white/80 font-bold text-sm ${textColor}`}>
                    {currentIndex + 1} / {words.length}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto w-full relative">

                {/* Target Word Card */}
                <div className="w-full bg-white rounded-[2rem] shadow-xl p-8 text-center mb-8 relative overflow-hidden border-4 border-white/50">
                    <div className={`absolute top-0 left-0 w-full h-2 ${accentBg}`} />

                    <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-xs font-bold mb-4 uppercase tracking-widest border border-slate-200">
                        {currentWord.pos}
                    </span>

                    <h1 className="text-4xl font-black text-slate-800 mb-2">{currentWord.word}</h1>
                    <p className="text-slate-400 font-medium text-lg mb-6">{currentWord.phonetic}</p>

                    <button
                        onClick={playAudio}
                        className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${accentBg} ${textColor} hover:brightness-95`}
                    >
                        <Volume2 className="w-6 h-6" />
                    </button>
                </div>

                {/* Feedback Area */}
                <div className="w-full min-h-[160px] mb-8">
                    <AnimatePresence mode="wait">
                        {error ? (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="h-full rounded-2xl p-5 border-2 bg-red-50 border-red-200 flex flex-col items-center justify-center text-center"
                            >
                                <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                                <p className="font-bold text-red-700 mb-1">
                                    {error === 'network'
                                        ? (isVietnamese ? 'Lỗi kết nối dịch vụ giọng nói' : 'Speech Service Network Error')
                                        : (isVietnamese ? 'Lỗi nhận diện giọng nói' : 'Recognition Error')
                                    }
                                </p>
                                <p className="text-sm text-red-600 mb-2">
                                    {error === 'network'
                                        ? (isVietnamese
                                            ? 'Trình duyệt không thể kết nối với máy chủ nhận diện (Google Speech). Vui lòng kiểm tra internet hoặc thử lại sau vài giây.'
                                            : 'Could not connect to speech recognition servers (Google Speech). Please check internet or try again in a few seconds.')
                                        : (isVietnamese ? 'Vui lòng thử lại.' : 'Please try again.')
                                    }
                                </p>
                                <button
                                    onClick={handleRetry}
                                    className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 underline"
                                >
                                    {isVietnamese ? 'Thử lại ngay' : 'Retry Now'}
                                </button>
                            </motion.div>
                        ) : isAnalyzing ? (
                            <motion.div
                                key="analyzing"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center h-full text-slate-500"
                            >
                                <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                                <p className="font-medium animate-pulse">Analyzing pronunciation...</p>
                            </motion.div>
                        ) : feedback ? (
                            <motion.div
                                key="feedback"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className={`h-full rounded-2xl p-5 border-2 ${feedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`p-2 rounded-full ${feedback.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {feedback.isCorrect ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
                                    </div>
                                    <span className={`font-bold text-lg ${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                        {feedback.accuracy}% Accuracy
                                    </span>
                                </div>
                                <p className="text-slate-600 font-medium mb-1">{feedback.error}</p>
                                <p className="text-sm text-slate-500 italic mt-auto">💡 {feedback.tip}</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/30"
                            >
                                <p className="font-medium">Tap mic to speak</p>
                                <p className="text-sm mt-1 opacity-70">Say: "{currentWord.word}"</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="w-full flex justify-center gap-6 items-center">
                    {!feedback ? (
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`
                                relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all
                                ${isListening ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' : 'bg-white text-slate-800 hover:scale-105 active:scale-95'}
                            `}
                        >
                            {isListening ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleRetry}
                                className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-all font-bold shadow-sm"
                            >
                                <RotateCcw className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleNext}
                                className={`h-16 flex-1 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 bg-gradient-to-r from-blue-600 to-indigo-600`}
                            >
                                {isVietnamese ? 'Tiếp theo' : 'Next Word'} <ArrowRight className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* User Transcript Preview (Optional, helpful for debug/trust) */}
            <div className="absolute bottom-8 left-0 w-full text-center px-4">
                <p className="text-slate-500 text-sm font-medium h-6">
                    {transcript || (isListening ? 'Listening...' : '')}
                </p>
            </div>
        </div>
    );
};

export default PronunciationPractice;
