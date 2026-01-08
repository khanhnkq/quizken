import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Volume2, RotateCw, Check, Pin, Star, Sparkles, XCircle, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { VocabWord } from '../../lib/constants/cefrVocabData';
import { toast } from '@/hooks/use-toast';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';

interface FlashcardSetProps {
    words: VocabWord[];
    title: string;
    onClose: () => void;
    onComplete?: () => void;
}

// Helper to get playful theme colors based on CEFR level
const getTheme = (level: string) => {
    switch (level) {
        case 'A1': return {
            bg: 'bg-green-50', text: 'text-green-600', accent: 'bg-green-500',
            shadow: 'shadow-green-200', border: 'border-green-100', light: 'bg-green-100',
            gradient: 'from-green-50 via-white to-green-50',
            blobMain: 'bg-green-300', blobSec: 'bg-emerald-300',
            cardBack: 'bg-gradient-to-br from-green-600 to-emerald-700'
        };
        case 'A2': return {
            bg: 'bg-cyan-50', text: 'text-cyan-600', accent: 'bg-cyan-500',
            shadow: 'shadow-cyan-200', border: 'border-cyan-100', light: 'bg-cyan-100',
            gradient: 'from-cyan-50 via-white to-cyan-50',
            blobMain: 'bg-cyan-300', blobSec: 'bg-teal-300',
            cardBack: 'bg-gradient-to-br from-cyan-600 to-teal-700'
        };
        case 'B1': return {
            bg: 'bg-blue-50', text: 'text-blue-600', accent: 'bg-blue-500',
            shadow: 'shadow-blue-200', border: 'border-blue-100', light: 'bg-blue-100',
            gradient: 'from-blue-50 via-white to-blue-50',
            blobMain: 'bg-blue-300', blobSec: 'bg-indigo-300',
            cardBack: 'bg-gradient-to-br from-blue-600 to-indigo-700'
        };
        case 'B2': return {
            bg: 'bg-indigo-50', text: 'text-indigo-600', accent: 'bg-indigo-500',
            shadow: 'shadow-indigo-200', border: 'border-indigo-100', light: 'bg-indigo-100',
            gradient: 'from-indigo-50 via-white to-indigo-50',
            blobMain: 'bg-indigo-300', blobSec: 'bg-purple-300',
            cardBack: 'bg-gradient-to-br from-indigo-600 to-violet-700'
        };
        case 'C1': return {
            bg: 'bg-purple-50', text: 'text-purple-600', accent: 'bg-purple-500',
            shadow: 'shadow-purple-200', border: 'border-purple-100', light: 'bg-purple-100',
            gradient: 'from-purple-50 via-white to-purple-50',
            blobMain: 'bg-purple-300', blobSec: 'bg-fuchsia-300',
            cardBack: 'bg-gradient-to-br from-purple-600 to-fuchsia-700'
        };
        case 'C2': return {
            bg: 'bg-rose-50', text: 'text-rose-600', accent: 'bg-rose-500',
            shadow: 'shadow-rose-200', border: 'border-rose-100', light: 'bg-rose-100',
            gradient: 'from-rose-50 via-white to-rose-50',
            blobMain: 'bg-rose-300', blobSec: 'bg-pink-300',
            cardBack: 'bg-gradient-to-br from-rose-600 to-pink-700'
        };
        default: return {
            bg: 'bg-violet-50', text: 'text-violet-600', accent: 'bg-violet-500',
            shadow: 'shadow-violet-200', border: 'border-violet-100', light: 'bg-violet-100',
            gradient: 'from-violet-50 via-white to-violet-50',
            blobMain: 'bg-violet-300', blobSec: 'bg-fuchsia-300',
            cardBack: 'bg-gradient-to-br from-violet-600 to-purple-700'
        };
    }
};

const FlashcardSet = ({ words, title, onClose, onComplete }: FlashcardSetProps) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [pinnedWords, setPinnedWords] = useState<string[]>(() => {
        const saved = localStorage.getItem('my_notebook_words');
        return saved ? JSON.parse(saved) : [];
    });

    const cardRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentWord = words[currentIndex] || words[words.length - 1];
    const theme = getTheme(currentWord.level);

    // Initial Entrance
    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)" }
        );
    }, []);

    // Card Transition Animation
    useEffect(() => {
        setIsFlipped(false);

        // Bouncy entrance for new card
        gsap.fromTo(cardRef.current,
            { scale: 0.8, rotationY: -10, opacity: 0 },
            { scale: 1, rotationY: 0, opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.75)", clearProps: "all" }
        );
    }, [currentIndex]);

    const handleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation();
        const utterance = new SpeechSynthesisUtterance(currentWord.word);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);

        // Pulse animation on speak
        gsap.to(e.currentTarget, { scale: 1.2, duration: 0.1, yoyo: true, repeat: 1 });
    };

    const togglePin = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newPinned = pinnedWords.includes(currentWord.word)
            ? pinnedWords.filter(w => w !== currentWord.word)
            : [...pinnedWords, currentWord.word];

        setPinnedWords(newPinned);
        localStorage.setItem('my_notebook_words', JSON.stringify(newPinned));

        // Shake animation for pin
        gsap.fromTo(e.currentTarget, { rotate: -20 }, { rotate: 20, duration: 0.1, yoyo: true, repeat: 3, clearProps: "rotate" });

        toast({
            title: newPinned.includes(currentWord.word) ? "Word Saved!" : "Removed from Notebook",
            variant: newPinned.includes(currentWord.word) ? "success" : "default"
        });
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            // Slide out left animation
            gsap.to(cardRef.current, {
                x: -100, rotation: -10, opacity: 0, duration: 0.3, ease: "back.in(1.7)",
                onComplete: () => {
                    setCurrentIndex(prev => prev + 1);
                    gsap.set(cardRef.current, { x: 0, rotation: 0 }); // Reset position for effect in useEffect
                }
            });
        } else {
            // AUTO-TRANSITION when finishing last card
            fireConfetti();
            toast({ title: "🎉 Words Learned! Moving to Quiz...", duration: 2000 });

            // Transition delay
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 1500);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            // Slide OUT to RIGHT (reverse logic for previous)
            gsap.to(cardRef.current, {
                x: 100, rotation: 10, opacity: 0, duration: 0.3, ease: "back.in(1.7)",
                onComplete: () => {
                    setCurrentIndex(prev => prev - 1);
                    gsap.set(cardRef.current, { x: 0, rotation: 0 }); // Reset position
                }
            });
        }
    };

    const fireConfetti = () => {
        const duration = 2000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    // --- Playing Screen ---
    return (
        <div ref={containerRef} className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-gradient-to-br ${theme.gradient} overflow-hidden`}>

            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40"
                style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            </div>

            {/* Animated Background Blobs */}
            <div className={`absolute top-1/2 left-1/4 w-96 h-96 ${theme.blobMain} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none`}></div>
            <div className={`absolute top-0 right-1/4 w-96 h-96 ${theme.blobSec} rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none`}></div>

            {/* Floating Icon */}
            <div className="absolute top-[10%] left-[10%] hidden md:block animate-float pointer-events-none">
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-white/50 rotate-[-12deg]">
                    <Brain className={`w-8 h-8 ${theme.text}`} />
                </div>
            </div>

            {/* Floating Back Button */}
            <button
                onClick={onClose}
                className="absolute top-4 left-4 md:top-8 md:left-8 z-50 p-3 bg-white/40 backdrop-blur-md hover:bg-white/60 text-slate-700 rounded-full shadow-lg border border-white/50 transition-all hover:scale-105 active:scale-95"
            >
                <ArrowLeft className="w-6 h-6" />
            </button>

            {/* Top Bar */}
            <div className="w-full max-w-md flex items-center justify-between mb-8 relative z-10 px-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className={`
                            p-3 rounded-2xl shadow-[0_4px_0_0_rgba(0,0,0,0.05)] border-2 transition-all active:translate-y-1 active:shadow-none
                            ${currentIndex === 0
                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed shadow-none'
                                : 'bg-white text-gray-500 hover:text-gray-800 hover:border-gray-200'}
                        `}
                        title="Previous Card"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>

                {/* Cute Progress Bar */}
                <div className="flex-1 mx-4 h-5 bg-white rounded-full overflow-hidden shadow-inner p-1 border border-white/50">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${theme.accent} shadow-sm`}
                        style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                    ></div>
                </div>

                <div className={`px-4 py-2 bg-white rounded-2xl shadow-sm border border-white/50 font-black text-sm ${theme.text}`}>
                    {currentIndex + 1}/{words.length}
                </div>
            </div>

            {/* The Flashcard */}
            <div
                ref={cardRef}
                className="w-full max-w-sm aspect-[3/4] perspective-1000 cursor-pointer relative group"
                onClick={() => setIsFlipped(!isFlipped)}
            >
                {/* 3D Depth Layer */}
                <div className={`absolute top-4 left-4 w-full h-full rounded-[2.5rem] bg-black/10 transition-all duration-300 group-hover:top-6 group-hover:left-6 -z-10`} />

                <div className={`relative w-full h-full duration-500 transform-style-3d transition-all ease-spring ${isFlipped ? 'rotate-y-180' : ''}`}>

                    {/* FRONT */}
                    <div className={`
                        absolute inset-0 backface-hidden bg-white rounded-[2.5rem] shadow-2xl 
                        flex flex-col items-center justify-center p-6 border-4 border-white
                        transition-transform duration-300 group-hover:-translate-y-1
                    `}>
                        {/* Corner Actions */}
                        <div className="absolute top-6 right-6 flex flex-col gap-3">
                            <button
                                onClick={togglePin}
                                className={`p-3 rounded-full shadow-sm transition-all hover:scale-110 active:scale-95 ${pinnedWords.includes(currentWord.word) ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-50 text-gray-300 hover:text-yellow-500'}`}
                            >
                                <Star className={`w-6 h-6 ${pinnedWords.includes(currentWord.word) ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        {/* Word Content */}
                        <div className="text-center z-10">
                            <h3 className={`text-5xl md:text-6xl font-black mb-4 tracking-tight ${theme.text} drop-shadow-sm`}>{currentWord.word}</h3>
                            <div className={`inline-block px-5 py-2 ${theme.light} rounded-2xl`}>
                                <p className={`text-xl font-serif font-bold opacity-80 ${theme.text}`}>{currentWord.phonetic}</p>
                            </div>
                        </div>

                        {/* Speaker Button (Floating) */}
                        <button
                            onClick={handleSpeak}
                            className={`
                                mt-12 p-5 rounded-full text-white shadow-[0_8px_16px_rgba(0,0,0,0.2)] transform transition-transform hover:scale-110 active:scale-95
                                ${theme.accent}
                            `}
                        >
                            <Volume2 className="w-10 h-10" />
                        </button>

                        <div className="absolute bottom-10 text-xs font-black text-slate-300 uppercase tracking-[0.25em] animate-pulse">
                            Tap to flip
                        </div>
                    </div>

                    {/* BACK */}
                    <div className={`
                        absolute inset-0 backface-hidden rotate-y-180 rounded-[2.5rem] shadow-2xl 
                        flex flex-col items-center justify-center p-6 text-white text-center border-8 border-white
                        overflow-y-auto
                        ${theme.cardBack}
                    `}>
                        <div className="w-full space-y-4">
                            {/* Part of Speech Badge */}
                            <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase bg-black/20 text-white/90 shadow-inner`}>
                                {currentWord.pos || 'word'}
                            </div>

                            {/* English Definition */}
                            <div className="bg-white/15 p-4 rounded-2xl backdrop-blur-sm">
                                <p className="text-xs uppercase tracking-wider text-white/60 mb-2 font-bold">Definition</p>
                                <h4 className="text-lg font-bold leading-snug drop-shadow-md">
                                    {currentWord.definition_en || 'No definition'}
                                </h4>
                            </div>

                            {/* Vietnamese Translation */}
                            {currentWord.definition_vi && (
                                <div className="bg-white/25 p-4 rounded-2xl backdrop-blur-sm border border-white/30">
                                    <p className="text-xs uppercase tracking-wider text-white/60 mb-2 font-bold">Vietnamese</p>
                                    <h4 className="text-lg font-bold leading-snug text-yellow-100">
                                        {currentWord.definition_vi}
                                    </h4>
                                </div>
                            )}

                            {/* Example Sentence */}
                            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
                                <p className="text-xs uppercase tracking-wider text-white/60 mb-2 font-bold">Example</p>
                                <p className="text-base italic text-white/90 font-medium leading-relaxed">
                                    "{currentWord.example_en || 'No example available'}"
                                </p>
                                {currentWord.example_vi && (
                                    <p className="text-sm italic text-yellow-100/80 font-medium mt-2 border-t border-white/20 pt-2">
                                        "{currentWord.example_vi}"
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Controls - Candy Buttons */}
            <div className="w-full max-w-sm mt-10 px-4">
                {isFlipped ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className={`
                            w-full py-4 text-white rounded-2xl font-black text-xl shadow-[0_4px_0_0_#15803d]
                            transform transition-all active:translate-y-1 active:shadow-none
                            flex items-center justify-center gap-3
                            bg-gradient-to-r from-green-500 to-emerald-600
                        `}
                    >
                        Got It! <Check className="w-7 h-7" />
                    </button>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
                        className={`
                            w-full py-4 bg-white text-slate-600 rounded-2xl font-black text-xl shadow-[0_4px_0_0_#cbd5e1] border-2 border-slate-200
                            transform transition-all active:translate-y-1 active:shadow-none
                            flex items-center justify-center gap-3 hover:text-indigo-500 hover:border-indigo-100
                        `}
                    >
                        Reveal <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    </button>
                )}
            </div>
        </div >
    );
};

export default FlashcardSet;
