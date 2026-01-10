import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Trash2, Volume2, Search, BookOpen, Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VOCAB_DATA, VocabWord } from '../../lib/constants/vocabData';
import { TOPIC_DATA } from '../../lib/constants/topicVocabData';
import {
    VOCAB_A1, VOCAB_A2, VOCAB_B1, VOCAB_B2, VOCAB_C1, VOCAB_C2
} from '../../lib/constants/cefrVocabData';
import { TOEIC_DATA } from '../../lib/constants/toeicData';
import { VocabularyImporter } from './VocabularyImporter';
import { toast } from '@/hooks/use-toast';
import { gsap } from 'gsap';
import { BackgroundDecorations } from '@/components/ui/BackgroundDecorations';

import { useVocabulary } from '@/hooks/useVocabulary';

const MyNotebook = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { vocabulary: pinnedWords, addWords, removeWord: dbRemoveWord, isLoading } = useVocabulary();
    const [searchQuery, setSearchQuery] = useState('');


    // No need for local storage effect anymore

    // Animations removed as requested
    useEffect(() => {
        // Placeholder for future animations
    }, []);

    // Flatten TOPIC_DATA for lookup
    const allTopicWords = TOPIC_DATA.flatMap(cat => cat.words.map(w => ({
        ...w,
        definition: w.meaning,
        phonetic: w.pronunciation,
        topic: cat.title,
        difficulty: 'medium' as const // Default
    })));

    // Flatten CEFR Data for lookup
    const allCefrWords = [
        ...VOCAB_A1, ...VOCAB_A2, ...VOCAB_B1,
        ...VOCAB_B2, ...VOCAB_C1, ...VOCAB_C2
    ].map(w => ({
        id: w.id,
        word: w.word,
        definition: w.definition_en, // Use English definition
        definition_vi: w.definition_vi, // Keep VI definition if needed later
        example: w.example_en,
        phonetic: w.phonetic,
        topic: `CEFR ${w.level}`,
        difficulty: w.level as any
    }));

    // Flatten TOEIC Data for lookup
    const allToeicWords = TOEIC_DATA.flatMap(cat => cat.words.map(w => ({
        id: w.id,
        word: w.word,
        definition: w.definition, // Use English definition
        example: w.example,
        phonetic: w.pronunciation,
        topic: `TOEIC: ${cat.title}`,
        difficulty: 'hard' as const
    })));

    // Retrieve full word objects from the original data based on pinned strings
    const notebookList = pinnedWords
        .map(w => {
            // 1. Check VOCAB_DATA
            const vocabMatch = VOCAB_DATA.find(v => v.word === w);
            if (vocabMatch) return vocabMatch;

            // 2. Check TOPIC_DATA
            const topicMatch = allTopicWords.find(t => t.word === w);
            if (topicMatch) return topicMatch;

            // 3. Check CEFR Data
            const cefrMatch = allCefrWords.find(c => c.word === w);
            if (cefrMatch) return cefrMatch;

            // 4. Check TOEIC Data
            const toeicMatch = allToeicWords.find(t => t.word === w);
            return toeicMatch;
        })
        .filter((w): w is VocabWord | (typeof allTopicWords)[0] | (typeof allCefrWords)[0] | (typeof allToeicWords)[0] => w !== undefined);

    const filteredList = notebookList.filter(w =>
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const removeWord = async (wordToRemove: string) => {
        await dbRemoveWord(wordToRemove);
        toast({
            title: t('englishHub.notebook.removedToastTitle'),
            description: t('englishHub.notebook.removedToastDesc', { word: wordToRemove })
        });
    };

    const speak = (word: string) => {
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'en-US';
        window.speechSynthesis.speak(u);
    };

    return (
        <div className="h-screen bg-gradient-to-b from-amber-50/80 via-orange-50/50 to-white relative overflow-hidden flex flex-col">
            {/* Background Decorations */}
            <BackgroundDecorations />

            {/* Decorative Blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

            {/* Fixed Header Section */}
            <div className="relative z-10 max-w-4xl w-full mx-auto px-4 pt-8 pb-4 flex-none">
                {/* Header */}
                <div className="notebook-header mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => navigate('/english')}
                            className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl shadow-lg border-2 border-white hover:scale-105 transition-transform text-slate-600"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <VocabularyImporter existingVocabulary={pinnedWords} onAddWords={addWords} />

                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-lg border-2 border-amber-100 flex items-center gap-2">
                                <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl">
                                    <BookOpen className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-lg font-black text-slate-700">{filteredList.length}</span>
                                <span className="text-sm font-medium text-slate-400">{t('englishHub.notebook.wordsCount', 'từ')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-amber-200 text-amber-600 font-bold text-sm shadow-sm mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span>{t('englishHub.notebook.badge', 'Vocabulary Collection')}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
                            {t('englishHub.notebook.title')}
                        </h1>
                        <p className="text-lg text-slate-500 font-medium">
                            {t('englishHub.notebook.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="notebook-search relative max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-backwards">
                    <div className="relative">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={t('englishHub.notebook.searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-12 py-4 rounded-2xl border-2 border-slate-100 shadow-lg bg-white/90 backdrop-blur-sm focus:ring-4 focus:ring-amber-100 focus:border-amber-300 transition-all font-medium text-slate-700 placeholder:text-slate-300"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Scrollable Content Section */}
            <div className="relative z-10 max-w-4xl w-full mx-auto px-4 pb-24 flex-1 overflow-y-auto no-scrollbar">
                {/* Empty State */}
                {filteredList.length === 0 && (
                    <div className="text-center py-16 px-8 bg-white/80 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-amber-200 shadow-xl mt-4">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
                            <BookOpen className="w-10 h-10 text-amber-500" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{t('englishHub.notebook.emptyTitle')}</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">{t('englishHub.notebook.emptyDesc')}</p>
                        <button
                            onClick={() => navigate('/english/phase/1/vocab')}
                            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 transition-all"
                        >
                            {t('englishHub.notebook.emptyAction')}
                        </button>
                    </div>
                )}

                {/* Word Cards Grid */}
                {filteredList.length > 0 && (
                    <div className="grid gap-4 md:gap-6 pt-4 animate-in zoom-in-95 fade-in duration-700 delay-300 fill-mode-backwards">
                        {filteredList.map((word, index) => (
                            <div
                                key={word.word}
                                className="notebook-item group bg-white/90 backdrop-blur-sm p-5 md:p-6 rounded-[1.5rem] border-2 border-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Word Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{word.word}</h3>
                                            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full font-medium">{word.phonetic}</span>
                                            <button
                                                onClick={() => speak(word.word)}
                                                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all hover:scale-110"
                                            >
                                                <Volume2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <p className="text-slate-600 font-medium text-lg mb-4">{word.definition}</p>

                                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-xl border border-blue-100">
                                            <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">{t('englishHub.notebook.exampleLabel')}</span>
                                            <p className="text-blue-700 font-medium mt-1 italic">"{word.example}"</p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <button
                                        onClick={() => removeWord(word.word)}
                                        className="shrink-0 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyNotebook;
