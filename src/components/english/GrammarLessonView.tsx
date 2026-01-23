import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Lightbulb, Play, X, ArrowLeft } from 'lucide-react';
import { GrammarLesson as GrammarLessonType, GrammarSection, GrammarExample } from '../../lib/constants/grammarLessons';

interface CategoryTheme {
    id: string;
    color: string; // gradient "from-x to-y"
    bg: string;
    text: string;
    border: string;
}

interface GrammarLessonProps {
    lesson: GrammarLessonType;
    theme?: CategoryTheme;
    onComplete: () => void;
    onClose: () => void;
}

const GrammarLessonView: React.FC<GrammarLessonProps> = ({ lesson, theme, onComplete, onClose }) => {
    const { t, i18n } = useTranslation();
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [viewedSections, setViewedSections] = useState<Set<number>>(new Set([0]));

    const isVietnamese = i18n.language === 'vi';
    const currentSection = lesson.sections[currentSectionIndex];
    const totalSections = lesson.sections.length;
    const isLastSection = currentSectionIndex === totalSections - 1;
    const allViewed = viewedSections.size === totalSections;

    // Default theme if not provided
    const activeTheme = theme || {
        id: 'default',
        color: 'from-indigo-500 to-purple-500',
        bg: 'bg-indigo-50',
        text: 'text-indigo-600',
        border: 'border-indigo-100'
    };

    const goToNext = () => {
        if (currentSectionIndex < totalSections - 1) {
            const nextIndex = currentSectionIndex + 1;
            setCurrentSectionIndex(nextIndex);
            setViewedSections(prev => new Set([...prev, nextIndex]));
        }
    };

    const goToPrev = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(currentSectionIndex - 1);
        }
    };

    // Parse markdown-style bold text
    const renderHighlightedText = (text: string) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <span key={i} className={`font-bold ${activeTheme.text} ${activeTheme.bg} px-1 rounded`}>
                        {part.slice(2, -2)}
                    </span>
                );
            }
            return part;
        });
    };

    // Parse content with line breaks
    const renderContent = (content: string) => {
        return content.split('\n').map((line, i) => (
            <p key={i} className="mb-3 last:mb-0 leading-relaxed text-slate-700">
                {renderHighlightedText(line)}
            </p>
        ));
    };

    // Extract gradient colors for simpler usage
    const gradientColors = activeTheme.color; // "from-blue-500 to-indigo-500"

    return (
        <div className={`fixed inset-0 z-50 overflow-hidden flex flex-col bg-slate-50`}>
            {/* Background Gradient & Pattern */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors} opacity-10 pointer-events-none`} />
            <div className="absolute inset-0 opacity-40 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />
            {/* Soft Blobs */}
            <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>

            {/* Header - Empty space for layout */}
            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-6 pb-2">
            </div>

            {/* Main Content Card - Centered */}
            <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-4 overflow-y-auto">
                <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden flex flex-col max-h-full">

                    {/* Card Header */}
                    <div className={`bg-gradient-to-r ${gradientColors} p-6 text-white text-center relative shrink-0`}>
                        <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50"
                            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '12px 12px' }}
                        />
                        <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/20 shadow-sm">
                            {currentSectionIndex + 1}/{totalSections}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black relative z-10 drop-shadow-md">
                            {isVietnamese ? currentSection.headingVi : currentSection.heading}
                        </h2>
                        <div className="mt-2 text-white/80 text-sm font-medium relative z-10 uppercase tracking-widest">
                            {isVietnamese ? 'Bài học lý thuyết' : 'Theory Lesson'}
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                        <div className="bg-slate-50 rounded-2xl p-5 mb-6 leading-relaxed border border-slate-100">
                            {renderContent(isVietnamese ? currentSection.contentVi : currentSection.content)}
                        </div>

                        {/* Examples */}
                        {currentSection.examples.length > 0 && (
                            <div>
                                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-4">
                                    <Lightbulb className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    {isVietnamese ? 'Ví dụ minh họa' : 'Examples'}
                                </h3>
                                <div className="space-y-3">
                                    {currentSection.examples.map((example, i) => (
                                        <div
                                            key={i}
                                            className={`bg-white rounded-2xl p-4 border shadow-sm ${activeTheme.border}`}
                                        >
                                            <p className="text-lg font-bold text-slate-800 mb-1">
                                                {renderHighlightedText(example.sentence)}
                                            </p>
                                            <p className="text-slate-500 italic">
                                                {example.translation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pb-16 pt-2 grid grid-cols-2 gap-4">
                <button
                    onClick={goToPrev}
                    disabled={currentSectionIndex === 0}
                    className={`
                        py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_4px_0_0_rgba(0,0,0,0.1)]
                        ${currentSectionIndex === 0
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none border-2 border-slate-100'
                            : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 hover:text-slate-800'}
                    `}
                >
                    <ChevronLeft className="w-6 h-6" />
                    {isVietnamese ? 'Trước' : 'Previous'}
                </button>

                {isLastSection && allViewed ? (
                    <button
                        onClick={onComplete}
                        className={`
                            py-4 text-white rounded-2xl font-black text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.2)]
                            transform transition-all hover:-translate-y-1 active:translate-y-0 active:shadow-none
                            flex items-center justify-center gap-2
                            bg-gradient-to-r from-green-500 to-emerald-600
                        `}
                    >
                        {isVietnamese ? 'Hoàn thành' : 'Complete'}
                        <CheckCircle className="w-6 h-6" />
                    </button>
                ) : (
                    <button
                        onClick={goToNext}
                        disabled={isLastSection}
                        className={`
                            py-4 text-white rounded-2xl font-black text-lg shadow-[0_4px_0_0_rgba(0,0,0,0.2)]
                            transform transition-all active:scale-95
                            flex items-center justify-center gap-2
                             bg-gradient-to-r ${gradientColors}
                        `}
                    >
                        {isVietnamese ? 'Tiếp theo' : 'Next'}
                        <ChevronRight className="w-6 h-6" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default GrammarLessonView;
