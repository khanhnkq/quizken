import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Volume2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { VOCAB_DATA, VocabWord } from '../../lib/constants/vocabData';
import { toast } from '@/hooks/use-toast';
import { gsap } from 'gsap';

const MyNotebook = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [pinnedWords, setPinnedWords] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('my_notebook_words');
        if (saved) {
            setPinnedWords(JSON.parse(saved));
        }

        // Animate list
        gsap.fromTo(".notebook-item",
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.05, duration: 0.4 }
        );
    }, []);

    // Retrieve full word objects from the original data based on pinned strings
    const notebookList = pinnedWords
        .map(w => VOCAB_DATA.find(v => v.word === w))
        .filter((w): w is VocabWord => w !== undefined);

    const filteredList = notebookList.filter(w =>
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const removeWord = (wordToRemove: string) => {
        const newList = pinnedWords.filter(w => w !== wordToRemove);
        setPinnedWords(newList);
        localStorage.setItem('my_notebook_words', JSON.stringify(newList));
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
        <div className="min-h-screen bg-yellow-50/50 p-4 pb-20">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/english')}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-serif">{t('englishHub.notebook.title')}</h1>
                        <p className="text-sm text-gray-500">{t('englishHub.notebook.subtitle')}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={t('englishHub.notebook.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-yellow-400 bg-white"
                    />
                </div>

                {/* Empty State */}
                {filteredList.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-lg font-bold text-gray-900">{t('englishHub.notebook.emptyTitle')}</h3>
                        <p className="text-gray-500 mt-2">{t('englishHub.notebook.emptyDesc')}</p>
                        <button
                            onClick={() => navigate('/english/phase/1/vocab')}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
                        >
                            {t('englishHub.notebook.emptyAction')}
                        </button>
                    </div>
                )}

                {/* List */}
                <div className="grid gap-4">
                    {filteredList.map((word) => (
                        <div key={word.word} className="notebook-item bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between group">
                            <div>
                                <div className="flex items-baseline gap-3">
                                    <h3 className="text-xl font-bold text-gray-900">{word.word}</h3>
                                    <span className="text-sm text-gray-400 font-serif">{word.phonetic}</span>
                                </div>
                                <p className="text-gray-600 mt-1">{word.definition}</p>
                                <div className="mt-3 text-sm text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-lg">
                                    {t('englishHub.notebook.exampleLabel')} "{word.example}"
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => speak(word.word)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                >
                                    <Volume2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => removeWord(word.word)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default MyNotebook;
