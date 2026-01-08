/**
 * CEFR (Common European Framework of Reference) Types
 * Vocabulary proficiency levels from A1 (beginner) to C2 (proficient)
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type PartOfSpeech =
    | 'noun'
    | 'verb'
    | 'adjective'
    | 'adverb'
    | 'preposition'
    | 'determiner'
    | 'pronoun'
    | 'conjunction'
    | 'interjection'
    | 'phrase';

export interface CEFRWord {
    headword: string;
    pos: PartOfSpeech;
    level: CEFRLevel;
    coreInventory1?: string;
    coreInventory2?: string;
    threshold?: string;
    notes?: string;
}

export interface CEFRLevelInfo {
    level: CEFRLevel;
    name: string;
    description: string;
    color: string;
    order: number;
}

export const CEFR_LEVELS: Record<CEFRLevel, CEFRLevelInfo> = {
    A1: {
        level: 'A1',
        name: 'Beginner',
        description: 'Can understand and use familiar everyday expressions',
        color: '#10B981', // green-500
        order: 1,
    },
    A2: {
        level: 'A2',
        name: 'Elementary',
        description: 'Can communicate in simple and routine tasks',
        color: '#84CC16', // lime-500
        order: 2,
    },
    B1: {
        level: 'B1',
        name: 'Intermediate',
        description: 'Can deal with most situations while traveling',
        color: '#F59E0B', // amber-500
        order: 3,
    },
    B2: {
        level: 'B2',
        name: 'Upper Intermediate',
        description: 'Can interact with a degree of fluency and spontaneity',
        color: '#F97316', // orange-500
        order: 4,
    },
    C1: {
        level: 'C1',
        name: 'Advanced',
        description: 'Can express ideas fluently and spontaneously',
        color: '#EF4444', // red-500
        order: 5,
    },
    C2: {
        level: 'C2',
        name: 'Proficient',
        description: 'Can understand virtually everything heard or read',
        color: '#DC2626', // red-600
        order: 6,
    },
};

export interface VocabularyAnalysis {
    totalWords: number;
    analyzedWords: number;
    unknownWords: string[];
    levelDistribution: Record<CEFRLevel, number>;
    averageLevel: CEFRLevel;
    words: Array<{
        word: string;
        level?: CEFRLevel;
        pos?: PartOfSpeech;
    }>;
}
