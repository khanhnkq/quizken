/**
 * React Hook for CEFR Vocabulary Service
 */

import { useState, useEffect } from 'react';
import { cefrService } from '@/lib/cefrService';
import type { CEFRLevel, VocabularyAnalysis } from '@/types/cefr';

export function useCEFR() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        cefrService
            .loadVocabulary()
            .then(() => {
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err);
                setIsLoading(false);
            });
    }, []);

    return {
        isLoading,
        error,
        getWordLevel: (word: string) => cefrService.getWordLevel(word),
        getWordEntries: (word: string) => cefrService.getWordEntries(word),
        analyzeText: (text: string) => cefrService.analyzeText(text),
        isWordAtLevel: (word: string, level: CEFRLevel) => cefrService.isWordAtLevel(word, level),
        filterWordsByLevel: (words: string[], maxLevel: CEFRLevel) =>
            cefrService.filterWordsByLevel(words, maxLevel),
        stats: cefrService.getStats(),
    };
}

/**
 * Hook for analyzing text vocabulary
 */
export function useVocabularyAnalysis(text: string) {
    const [analysis, setAnalysis] = useState<VocabularyAnalysis | null>(null);
    const { isLoading } = useCEFR();

    useEffect(() => {
        if (!isLoading && text) {
            const result = cefrService.analyzeText(text);
            setAnalysis(result);
        }
    }, [text, isLoading]);

    return {
        analysis,
        isLoading,
    };
}
