import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Mic,
    Square,
    Volume2,
    ArrowRight,
    ArrowLeft,
    RotateCcw,
    CheckCircle,
    AlertCircle,
    Loader2,
    Trophy,
    Sparkles,
    Zap,
    Brain,
    Lightbulb,
    Type,
    MessageSquare,
    Shuffle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '@/lib/auth';
import { VocabWord } from '@/lib/constants/cefrVocabData';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { 
    getPronunciationFeedback, 
    getSentenceFeedback, 
    getUserGeminiKey,
    type SentenceFeedback,
    type WordFeedback 
} from '@/lib/geminiPronunciation';
import { toast } from '@/hooks/use-toast';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';
import { GRAMMAR_SENTENCE_DATA, SentenceData } from '@/lib/constants/grammarSentenceData';

type PracticeMode = 'word' | 'sentence';

interface PronunciationPracticeProps {
    words: VocabWord[];
    level: string;
    onComplete: (score: number) => void;
    onClose: () => void;
    minimalView?: boolean;
    initialMode?: PracticeMode;
}

const getTheme = (level: string) => {
    const themes: Record<string, { gradient: string; text: string; accent: string; light: string; border: string }> = {
        'A1': { gradient: 'from-green-50 to-emerald-50', text: 'text-green-600', accent: 'bg-green-500', light: 'bg-green-100', border: 'border-green-200' },
        'A2': { gradient: 'from-cyan-50 to-teal-50', text: 'text-cyan-600', accent: 'bg-cyan-500', light: 'bg-cyan-100', border: 'border-cyan-200' },
        'B1': { gradient: 'from-blue-50 to-indigo-50', text: 'text-blue-600', accent: 'bg-blue-500', light: 'bg-blue-100', border: 'border-blue-200' },
        'B2': { gradient: 'from-indigo-50 to-violet-50', text: 'text-indigo-600', accent: 'bg-indigo-500', light: 'bg-indigo-100', border: 'border-indigo-200' },
        'C1': { gradient: 'from-purple-50 to-fuchsia-50', text: 'text-purple-600', accent: 'bg-purple-500', light: 'bg-purple-100', border: 'border-purple-200' },
        'C2': { gradient: 'from-rose-50 to-pink-50', text: 'text-rose-600', accent: 'bg-rose-500', light: 'bg-rose-100', border: 'border-rose-200' },
    };
    return themes[level] || themes['A1'];
};

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Word-by-word highlight component
const WordHighlight: React.FC<{ words: WordFeedback[] }> = ({ words }) => {
    return (
        <div className="flex flex-wrap gap-2 justify-center">
            {words.map((w, idx) => (
                <motion.span
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`
                        px-3 py-1.5 rounded-lg font-semibold text-sm relative group cursor-default
                        ${w.isCorrect 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }
                    `}
                >
                    {w.word}
                    {w.isCorrect ? (
                        <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-500" />
                    ) : (
                        <AlertCircle className="w-3 h-3 absolute -top-1 -right-1 text-red-500" />
                    )}
                    {w.feedback && !w.isCorrect && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {w.feedback}
                        </div>
                    )}
                </motion.span>
            ))}
        </div>
    );
};

const PronunciationPractice: React.FC<PronunciationPracticeProps> = ({
    words,
    onComplete,
    onClose,
    level = 'A1',
    minimalView = false,
    initialMode = 'word'
}) => {
    const { t, i18n } = useTranslation();
    const isVietnamese = i18n.language === 'vi';
    const { user } = useAuth();

    // Practice mode
    const [practiceMode, setPracticeMode] = useState<PracticeMode>(initialMode);
    
    // Word mode state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [feedback, setFeedback] = useState<{
        accuracy: number;
        error: string;
        tip: string;
        isCorrect: boolean;
    } | null>(null);
    
    // Sentence mode state
    const [sentenceIndex, setSentenceIndex] = useState(0);
    const [sentenceFeedback, setSentenceFeedback] = useState<SentenceFeedback | null>(null);
    
    // Shared state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [score, setScore] = useState(0);
    const [apiKey, setApiKey] = useState<string | null>(null);
    
    // Topic selection state
    const [selectedTopic, setSelectedTopic] = useState<string>('all');
    const [isShuffled, setIsShuffled] = useState(false);
    const [shuffledSentences, setShuffledSentences] = useState<SentenceData[]>([]);

    // Hooks
    const {
        isRecording,
        recordingTime,
        audioBlob,
        error: recorderError,
        startRecording,
        stopRecording,
        resetRecording
    } = useAudioRecorder();

    // Data
    const currentWord = words[currentIndex % words.length];
    const theme = getTheme(level);
    
    // Get all topic keys for selection
    const topicKeys = useMemo(() => Object.keys(GRAMMAR_SENTENCE_DATA), []);
    
    // Get sentences based on selected topic
    const getSentencesByTopic = useMemo((): SentenceData[] => {
        if (selectedTopic === 'all') {
            const allSentences: SentenceData[] = [];
            Object.values(GRAMMAR_SENTENCE_DATA).forEach(sentences => {
                allSentences.push(...sentences);
            });
            return allSentences;
        }
        return GRAMMAR_SENTENCE_DATA[selectedTopic] || [];
    }, [selectedTopic]);
    
    // Apply shuffle if needed
    const sentences = useMemo(() => {
        if (isShuffled && shuffledSentences.length > 0) {
            return shuffledSentences;
        }
        return getSentencesByTopic;
    }, [isShuffled, shuffledSentences, getSentencesByTopic]);
    
    const currentSentence = sentences[sentenceIndex % Math.max(sentences.length, 1)];
    
    // Shuffle function
    const handleShuffle = () => {
        const shuffled = [...getSentencesByTopic].sort(() => Math.random() - 0.5);
        setShuffledSentences(shuffled);
        setIsShuffled(true);
        setSentenceIndex(0);
        setSentenceFeedback(null);
    };
    
    // Handle topic change
    const handleTopicChange = (topic: string) => {
        setSelectedTopic(topic);
        setSentenceIndex(0);
        setSentenceFeedback(null);
        setIsShuffled(false);
        setShuffledSentences([]);
    };

    // Init Gemini Key
    useEffect(() => {
        if (user) {
            getUserGeminiKey(user.id).then(key => setApiKey(key));
        }
    }, [user]);

    // TTS Helper
    const playAudio = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = practiceMode === 'sentence' ? 0.9 : 0.8;
        window.speechSynthesis.speak(utterance);
    };

    // Log errors from recorder
    useEffect(() => {
        if (recorderError) {
            console.error('[PronunciationPractice] Recorder Error:', recorderError);
            toast({
                title: isVietnamese ? "Lỗi truy cập micro" : "Microphone Access Error",
                description: isVietnamese ? "Vui lòng cấp quyền micro cho trang web." : "Please allow microphone access.",
                variant: "destructive",
            });
        }
    }, [recorderError, isVietnamese]);

    // Analyze when audio blob is available (recording stopped)
    useEffect(() => {
        if (audioBlob && !isRecording && !isAnalyzing && !feedback && !sentenceFeedback) {
            handleAnalyze(audioBlob);
        }
    }, [audioBlob, isRecording]);

    const handleAnalyze = async (blob: Blob) => {
        setIsAnalyzing(true);
        try {
            const base64Audio = await blobToBase64(blob);

            if (practiceMode === 'word') {
                const result = await getPronunciationFeedback(
                    currentWord.word,
                    base64Audio,
                    apiKey || '',
                    isVietnamese
                );
                setFeedback(result);
                if (result.isCorrect) {
                    setScore(prev => prev + 10);
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
                }
            } else {
                const result = await getSentenceFeedback(
                    currentSentence.sentence,
                    base64Audio,
                    apiKey || '',
                    isVietnamese
                );
                setSentenceFeedback(result);
                if (result.isCorrect) {
                    setScore(prev => prev + 20);
                    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
                }
            }
        } catch (err) {
            console.error('Error analyzing audio:', err);
            toast({
                title: isVietnamese ? "Lỗi phân tích" : "Analysis Error",
                description: isVietnamese ? "Không thể xử lý âm thanh. Vui lòng thử lại." : "Could not process audio. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleNext = () => {
        if (practiceMode === 'word') {
            if (currentIndex >= words.length - 1) {
                setIsFinished(true);
            } else {
                setCurrentIndex(prev => prev + 1);
                setFeedback(null);
                resetRecording();
            }
        } else {
            if (sentenceIndex >= sentences.length - 1) {
                setIsFinished(true);
            } else {
                setSentenceIndex(prev => prev + 1);
                setSentenceFeedback(null);
                resetRecording();
            }
        }
    };

    const handleRetry = () => {
        setFeedback(null);
        setSentenceFeedback(null);
        resetRecording();
    };

    const handleModeSwitch = (mode: PracticeMode) => {
        setPracticeMode(mode);
        setFeedback(null);
        setSentenceFeedback(null);
        resetRecording();
    };

    // Finished screen
    if (isFinished) {
        return (
            <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 bg-gradient-to-br ${theme.gradient}`}>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full animate-scale-in">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${theme.light} ring-8 ring-white shadow-lg`}>
                        <Trophy className={`w-10 h-10 ${theme.text}`} />
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
                        <div className={`text-4xl font-black ${theme.text}`}>{score}</div>
                    </div>
                    <button
                        onClick={() => onComplete(score)}
                        className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg shadow-blue-200 transition-transform active:scale-95 bg-gradient-to-r from-blue-500 to-indigo-500"
                    >
                        {isVietnamese ? 'Tiếp tục' : 'Continue'}
                    </button>
                </div>
            </div>
        );
    }

    const hasFeedback = practiceMode === 'word' ? feedback : sentenceFeedback;

    return (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-start pt-24 md:pt-0 ${minimalView ? 'bg-transparent' : `bg-gradient-to-br ${theme.gradient}`} overflow-hidden`}>
            {!minimalView && <BackgroundDecorations />}

            {/* Animated Background Blobs */}
            {!minimalView && (
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] ${theme.accent} rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob`}></div>
                    <div className={`absolute top-[-10%] right-[-10%] w-[500px] h-[500px] ${theme.accent} rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-2000`}></div>
                    <div className={`absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] ${theme.accent} rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob animation-delay-4000`}></div>
                </div>
            )}

            {/* Floating Icons */}
            {!minimalView && (
                <div className="hidden lg:block absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-[15%] left-[5%] animate-float">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 rotate-[-12deg]">
                            <Brain className={`w-10 h-10 ${theme.text}`} />
                        </div>
                    </div>
                    <div className="absolute top-[20%] right-[5%] animate-float animation-delay-2000">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 rotate-[12deg]">
                            <Sparkles className="w-10 h-10 text-yellow-500" />
                        </div>
                    </div>
                    <div className="absolute bottom-[30%] left-[8%] animate-float animation-delay-4000">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 rotate-[6deg]">
                            <Zap className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    <div className="absolute bottom-[20%] right-[8%] animate-float animation-delay-5000">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl shadow-xl border border-white/50 rotate-[-8deg]">
                            <Lightbulb className="w-8 h-8 text-orange-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* Back Button */}
            <button
                onClick={onClose}
                className="absolute top-16 left-4 md:top-8 md:left-8 z-50 p-3 bg-white/50 hover:bg-white backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all border border-white/50 group"
            >
                <ArrowLeft className="w-6 h-6 text-slate-600 group-hover:text-slate-800" />
            </button>

            {/* Top Bar */}
            <div className="w-full max-w-md mx-auto flex items-center justify-between mb-4 relative z-10 px-4 md:mt-28">
                <div className="w-12"></div>

                {/* Progress Bar */}
                <div className="flex-1 mx-4 h-5 bg-white rounded-full overflow-hidden shadow-inner p-1 border border-white/50">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.accent} shadow-sm`}
                        style={{ 
                            width: `${practiceMode === 'word' 
                                ? ((currentIndex + 1) / words.length) * 100 
                                : ((sentenceIndex + 1) / sentences.length) * 100
                            }%` 
                        }}
                    ></div>
                </div>

                <div className={`px-4 py-2 bg-white rounded-2xl shadow-sm border border-white/50 font-black text-sm ${theme.text}`}>
                    {practiceMode === 'word' 
                        ? `${currentIndex + 1}/${words.length}`
                        : `${sentenceIndex + 1}/${sentences.length}`
                    }
                </div>
            </div>

            {/* Mode Toggle */}
            <div className="w-full max-w-md mx-auto px-4 mb-4 relative z-10">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 flex gap-1 shadow-sm border border-white/50">
                    <button
                        onClick={() => handleModeSwitch('word')}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            practiceMode === 'word'
                                ? `${theme.accent} text-white shadow-md`
                                : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        <Type className="w-4 h-4" />
                        {isVietnamese ? 'Từ vựng' : 'Words'}
                    </button>
                    <button
                        onClick={() => handleModeSwitch('sentence')}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            practiceMode === 'sentence'
                                ? `${theme.accent} text-white shadow-md`
                                : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        {isVietnamese ? 'Câu' : 'Sentences'}
                    </button>
                </div>
            </div>

            {/* Topic Selection & Shuffle - Only in Sentence Mode */}
            {practiceMode === 'sentence' && (
                <div className="w-full max-w-md mx-auto px-4 mb-4 relative z-10">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 flex gap-2 shadow-sm border border-white/50">
                        {/* Topic Dropdown */}
                        <select
                            value={selectedTopic}
                            onChange={(e) => handleTopicChange(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">{isVietnamese ? 'Tất cả chủ đề' : 'All Topics'} ({Object.values(GRAMMAR_SENTENCE_DATA).flat().length})</option>
                            {topicKeys.map(key => (
                                <option key={key} value={key}>
                                    {key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ({GRAMMAR_SENTENCE_DATA[key].length})
                                </option>
                            ))}
                        </select>
                        
                        {/* Shuffle Button */}
                        <button
                            onClick={handleShuffle}
                            className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                                isShuffled 
                                    ? 'bg-green-100 text-green-600 border-2 border-green-200' 
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Shuffle className="w-4 h-4" />
                            {isShuffled ? '✓' : isVietnamese ? 'Trộn' : 'Shuffle'}
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex flex-col relative z-10">
                <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 pb-24 max-w-md mx-auto relative w-full">

                    {/* Target Card */}
                    <div className="w-full bg-white rounded-[2rem] shadow-xl p-6 sm:p-8 text-center mb-6 sm:mb-8 relative overflow-hidden border-4 border-white/50">
                        <div className={`absolute top-0 left-0 w-full h-2 ${theme.accent}`} />

                        {practiceMode === 'word' ? (
                            <>
                                <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] sm:text-xs font-bold mb-4 uppercase tracking-widest border border-slate-200">
                                    {currentWord.pos}
                                </span>
                                <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-2 break-words">{currentWord.word}</h1>
                                <p className="text-slate-400 font-medium text-lg mb-6">{currentWord.phonetic}</p>
                            </>
                        ) : (
                            <>
                                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-[10px] sm:text-xs font-bold mb-4 uppercase tracking-widest border border-blue-200">
                                    {isVietnamese ? 'Luyện câu' : 'Sentence Practice'}
                                </span>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 break-words leading-relaxed">
                                    "{currentSentence.sentence}"
                                </h1>
                                {currentSentence.translation && (
                                    <p className="text-slate-400 font-medium text-sm mb-4">{currentSentence.translation}</p>
                                )}
                            </>
                        )}

                        <button
                            onClick={() => playAudio(practiceMode === 'word' ? currentWord.word : currentSentence.sentence)}
                            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${theme.accent} text-white hover:brightness-95`}
                        >
                            <Volume2 className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Feedback Area */}
                    <div className="w-full min-h-[160px] mb-6 sm:mb-8">
                        <AnimatePresence mode="wait">
                            {recorderError ? (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className="h-full rounded-2xl p-5 border-2 bg-red-50 border-red-200 flex flex-col items-center justify-center text-center"
                                >
                                    <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
                                    <p className="font-bold text-red-700 mb-1">
                                        {isVietnamese ? 'Lỗi truy cập micro' : 'Microphone Error'}
                                    </p>
                                    <p className="text-sm text-red-600 mb-2">
                                        {isVietnamese ? 'Vui lòng kiểm tra quyền truy cập micro.' : 'Please check microphone permissions.'}
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
                                    className="flex flex-col items-center justify-center h-full text-slate-500 min-h-[160px]"
                                >
                                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                                    <p className="font-medium animate-pulse">
                                        {isVietnamese ? 'Đang phân tích giọng nói...' : 'Analyzing pronunciation...'}
                                    </p>
                                </motion.div>
                            ) : practiceMode === 'word' && feedback ? (
                                <motion.div
                                    key="word-feedback"
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
                            ) : practiceMode === 'sentence' && sentenceFeedback ? (
                                <motion.div
                                    key="sentence-feedback"
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    className={`rounded-2xl p-5 border-2 ${sentenceFeedback.isCorrect ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-full ${sentenceFeedback.isCorrect ? 'bg-green-100' : 'bg-amber-100'}`}>
                                            {sentenceFeedback.isCorrect ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-amber-600" />}
                                        </div>
                                        <span className={`font-bold text-lg ${sentenceFeedback.isCorrect ? 'text-green-700' : 'text-amber-700'}`}>
                                            {sentenceFeedback.overallAccuracy}% Accuracy
                                        </span>
                                    </div>
                                    
                                    {/* Word-by-word highlight */}
                                    <div className="mb-4">
                                        <WordHighlight words={sentenceFeedback.words} />
                                    </div>
                                    
                                    <p className="text-sm text-slate-500 italic text-center">💡 {sentenceFeedback.tip}</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-white/30 min-h-[160px]"
                                >
                                    <p className="font-medium">
                                        {isVietnamese ? 'Nhấn micro để ghi âm' : 'Tap mic to record'}
                                    </p>
                                    <p className="text-sm mt-1 opacity-70">
                                        {practiceMode === 'word' 
                                            ? `Say: "${currentWord.word}"`
                                            : `Say: "${currentSentence.sentence}"`
                                        }
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Controls */}
                    <div className="w-full flex justify-center gap-6 items-center mb-auto sm:mb-0">
                        {!hasFeedback ? (
                            <div className="relative">
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`
                                        relative w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all z-20
                                        ${isRecording ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' : 'bg-white text-slate-800 hover:scale-105 active:scale-95'}
                                    `}
                                >
                                    {isRecording ? (
                                        <div className="flex flex-col items-center">
                                            <Square className="w-8 h-8 fill-current mb-[-5px]" />
                                            <span className="text-[10px] font-mono mt-1">{recordingTime}s</span>
                                        </div>
                                    ) : (
                                        <Mic className="w-8 h-8" />
                                    )}
                                </button>
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    <p className="text-slate-600/80 text-xs font-bold tracking-wide h-6">
                                        {isRecording ? (isVietnamese ? 'Đang ghi âm...' : 'Recording...') : ''}
                                    </p>
                                </div>
                            </div>
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
                                    className="h-16 flex-1 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 bg-gradient-to-r from-blue-600 to-indigo-600"
                                >
                                    {isVietnamese ? 'Tiếp theo' : 'Next'} <ArrowRight className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PronunciationPractice;
