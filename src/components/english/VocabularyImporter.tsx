import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Check, Book, GraduationCap, Briefcase, Layers, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TOPIC_DATA } from '../../lib/constants/topicVocabData';
import {
    VOCAB_A1, VOCAB_A2, VOCAB_B1, VOCAB_B2, VOCAB_C1, VOCAB_C2
} from '../../lib/constants/cefrVocabData';
import { TOEIC_DATA } from '../../lib/constants/toeicData'; // Ensure this matches export
import { useVocabulary } from '@/hooks/useVocabulary';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const CEFR_LEVELS = [
    { id: 'A1', title: 'Beginner (A1)', words: VOCAB_A1, color: 'bg-green-100 text-green-700' },
    { id: 'A2', title: 'Elementary (A2)', words: VOCAB_A2, color: 'bg-emerald-100 text-emerald-700' },
    { id: 'B1', title: 'Intermediate (B1)', words: VOCAB_B1, color: 'bg-blue-100 text-blue-700' },
    { id: 'B2', title: 'Upper Intermediate (B2)', words: VOCAB_B2, color: 'bg-indigo-100 text-indigo-700' },
    { id: 'C1', title: 'Advanced (C1)', words: VOCAB_C1, color: 'bg-purple-100 text-purple-700' },
    { id: 'C2', title: 'Proficiency (C2)', words: VOCAB_C2, color: 'bg-pink-100 text-pink-700' },
];

interface VocabularyImporterProps {
    existingVocabulary: string[];
    onAddWords: (words: string[]) => Promise<boolean>;
}

export const VocabularyImporter = ({ existingVocabulary, onAddWords }: VocabularyImporterProps) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [loadingSet, setLoadingSet] = useState<string | null>(null);

    const handleImport = async (setId: string, words: any[]) => {
        setLoadingSet(setId);
        // Extract word strings. Handle different data structures.
        // TOPIC_DATA: { word: string, ... }
        // CEFR: { word: string, ... }
        // TOEIC: { word: string, ... }
        // Currently all seem to use 'word' property.

        const wordList = words.map(w => w.word);
        const success = await onAddWords(wordList);

        if (success) {
            toast({
                title: t('english.notebook.importSuccess', 'Success!'),
                description: t('english.notebook.importDesc', { count: wordList.length }),
            });
            // Optional: Close dialog or keep open? Keep open for multiple adds.
        }
        setLoadingSet(null);
    };

    const isSetFullyAdded = (words: any[]) => {
        if (!words || words.length === 0) return false;
        return words.every(w => existingVocabulary.includes(w.word));
    };

    const getAddedCount = (words: any[]) => {
        return words.filter(w => existingVocabulary.includes(w.word)).length;
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-200/50 hover:shadow-orange-200/80 hover:scale-105 transition-all duration-300 rounded-full pl-4 pr-5 py-6"
                >
                    <div className="bg-white/20 p-1 rounded-full">
                        <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold tracking-wide">{t('english.notebook.addCollection', 'Add Collection')}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="[&>button]:hidden h-[85vh] max-w-3xl flex flex-col p-0 gap-0 overflow-hidden bg-[#FFF9F0] border-4 border-white shadow-2xl rounded-[32px]">


                {/* Close Button */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute top-6 right-6 z-50 p-2 bg-white/50 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <DialogHeader className="p-8 pb-4 relative z-10">
                    <DialogTitle className="text-3xl font-black text-slate-800 flex items-center gap-3">
                        <span className="bg-gradient-to-br from-amber-400 to-orange-500 text-transparent bg-clip-text">
                            {t('english.notebook.importTitle', 'Vocabulary Collections')}
                        </span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-600 hover:bg-orange-200 border-none px-2 py-0.5 text-xs">
                            New
                        </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium text-base">
                        {t('english.notebook.importSubtitle', 'Choose a set to unlock and add to your notebook.')}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="topics" className="flex-1 flex flex-col overflow-hidden relative z-10">
                    <div className="px-8 pb-4">
                        <TabsList className="bg-white/80 p-1.5 gap-2 rounded-2xl border border-orange-100/50 w-full justify-start h-auto">
                            <TabsTrigger
                                value="topics"
                                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-400 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-xl py-3 text-slate-500 font-bold transition-all data-[state=active]:shadow-lg data-[state=active]:shadow-orange-200/50"
                            >
                                <Layers className="w-4 h-4 mr-2" />
                                Topics
                            </TabsTrigger>
                            <TabsTrigger
                                value="cefr"
                                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl py-3 text-slate-500 font-bold transition-all data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200/50"
                            >
                                <GraduationCap className="w-4 h-4 mr-2" />
                                CEFR Levels
                            </TabsTrigger>
                            <TabsTrigger
                                value="toeic"
                                className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400 data-[state=active]:to-teal-500 data-[state=active]:text-white rounded-xl py-3 text-slate-500 font-bold transition-all data-[state=active]:shadow-lg data-[state=active]:shadow-teal-200/50"
                            >
                                <Briefcase className="w-4 h-4 mr-2" />
                                TOEIC
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden bg-white/95 border-t border-white/50 min-h-0">
                        <ScrollArea className="h-full p-6">

                            {/* TOPICS TAB */}
                            <TabsContent value="topics" className="mt-0 space-y-4 px-2">
                                <div className="grid grid-cols-1 gap-4">
                                    {TOPIC_DATA.map((topic) => {
                                        const isAdded = isSetFullyAdded(topic.words);
                                        const count = getAddedCount(topic.words);
                                        return (
                                            <div key={topic.id} className="group bg-white p-5 rounded-3xl shadow-sm border-2 border-transparent hover:border-amber-200 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${topic.color === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                                        <Book className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-lg group-hover:text-amber-600 transition-colors">{topic.title}</h4>
                                                        <p className="text-sm text-slate-500 font-medium">{topic.words.length} words</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {count > 0 && (
                                                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                                                            {count}/{topic.words.length}
                                                        </span>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        disabled={isAdded || loadingSet === topic.id}
                                                        onClick={() => handleImport(topic.id, topic.words)}
                                                        className={`h-10 w-10 rounded-xl shadow-md transition-all hover:scale-110 active:scale-95 ${isAdded ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gradient-to-br from-amber-400 to-orange-500 text-white hover:shadow-orange-300/50"}`}
                                                    >
                                                        {loadingSet === topic.id ? (
                                                            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : isAdded ? (
                                                            <Check className="w-5 h-5" />
                                                        ) : (
                                                            <Plus className="w-5 h-5 stroke-[3]" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            {/* CEFR TAB */}
                            <TabsContent value="cefr" className="mt-0 space-y-4 px-2">
                                <div className="grid grid-cols-1 gap-4">
                                    {CEFR_LEVELS.map((level) => {
                                        const count = getAddedCount(level.words);
                                        return (
                                            <div key={level.id} className="group bg-white p-5 rounded-3xl shadow-sm border-2 border-transparent hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 flex items-center justify-between opacity-90 hover:opacity-100">
                                                <div className="flex items-center gap-4">
                                                    <Badge className={`${level.color} h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black border-none shadow-inner`}>
                                                        {level.id}
                                                    </Badge>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">{level.title}</h4>
                                                        <p className="text-sm text-slate-500 font-medium">{level.words.length} words required</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col items-end gap-1">
                                                        {count > 0 && (
                                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                                                {count}/{level.words.length} collected
                                                            </span>
                                                        )}
                                                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                                            <GraduationCap className="w-3 h-3" />
                                                            Unlock in Lessons
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            {/* TOEIC TAB */}
                            <TabsContent value="toeic" className="mt-0 px-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {TOEIC_DATA.map((topic) => {
                                        const isAdded = isSetFullyAdded(topic.words);
                                        const count = getAddedCount(topic.words);
                                        return (
                                            <div key={topic.id} className="group bg-white p-5 rounded-[24px] shadow-sm border-2 border-transparent hover:border-teal-200 hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 flex flex-col justify-between min-h-[160px] h-auto relative overflow-hidden">
                                                {/* Card Background Decoration */}
                                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-teal-50 rounded-full group-hover:bg-teal-100 transition-colors pointer-events-none" />

                                                <div className="relative z-10">
                                                    <div className="flex items-start justify-between">
                                                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                            <Briefcase className="w-5 h-5" />
                                                        </div>
                                                        {isAdded && (
                                                            <div className="bg-green-100 text-green-600 p-1.5 rounded-full">
                                                                <Check className="w-4 h-4 stroke-[3]" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <h4 className="font-bold text-slate-800 text-lg line-clamp-1 group-hover:text-teal-700 transition-colors" title={topic.title}>{topic.title}</h4>
                                                    <p className="text-sm text-slate-500 font-medium">{topic.words.length} words</p>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto relative z-10 pt-4">
                                                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                                                        {count > 0 ? `${count} added` : '0 added'}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        disabled={isAdded || loadingSet === topic.id}
                                                        onClick={() => handleImport(topic.id, topic.words)}
                                                        className={`h-9 px-4 rounded-xl font-bold text-xs transition-all ${isAdded ? "bg-slate-100 text-slate-400" : "bg-teal-500 hover:bg-teal-600 text-white shadow-md shadow-teal-200"}`}
                                                    >
                                                        {loadingSet === topic.id ? (
                                                            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : isAdded ? (
                                                            'Added'
                                                        ) : (
                                                            'Add Set'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                        </ScrollArea>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
