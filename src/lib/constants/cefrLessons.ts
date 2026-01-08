/**
 * CEFR Lesson Organization
 * Organizes CEFR vocabulary into manageable lessons
 */

import {
    VOCAB_A1,
    VOCAB_A2,
    VOCAB_B1,
    VOCAB_B2,
    VOCAB_C1,
    VOCAB_C2,
    VocabWord,
    CEFRLevel
} from './cefrVocabData';

export interface CEFRLesson {
    id: string;
    level: CEFRLevel;
    lessonNumber: number;
    title: string;
    words: VocabWord[];
    totalWords: number;
}

export interface CEFRLevelData {
    level: CEFRLevel;
    levelName: string;
    color: string;
    totalWords: number;
    totalLessons: number;
    lessons: CEFRLesson[];
}

// Configuration
const WORDS_PER_LESSON = 25;

/**
 * Check if a definition is a placeholder (not a real definition)
 */
function isPlaceholderDefinition(definition: string): boolean {
    if (!definition) return true;
    return definition.includes('word at A1 level') ||
        definition.includes('word at A2 level') ||
        definition.includes('word at B1 level') ||
        definition.includes('word at B2 level') ||
        definition.includes('word at C1 level') ||
        definition.includes('word at C2 level') ||
        definition.startsWith('A ') && definition.includes(' word at ');
}

/**
 * Filter out words with placeholder definitions AND deduplicate words
 * - Removes placeholder definitions
 * - Removes duplicates (same word + same definition)
 */
function filterValidWords(words: VocabWord[]): VocabWord[] {
    const seen = new Set<string>();

    return words.filter(word => {
        // 1. Filter placeholders
        if (isPlaceholderDefinition(word.definition_en)) return false;

        // 2. Deduplicate based on word + definition
        // Some words appear multiple times (noun/verb) but have same definition in this dataset
        // or effectively same entry repeated.
        const uniqueKey = `${word.word.toLowerCase()}-${word.definition_en.substring(0, 20)}`;
        if (seen.has(uniqueKey)) return false;

        seen.add(uniqueKey);
        return true;
    });
}

/**
 * Create lessons from vocabulary array
 */
function createLessons(
    words: VocabWord[],
    level: CEFRLevel,
    levelName: string
): CEFRLesson[] {
    // Filter out placeholder definitions first
    const validWords = filterValidWords(words);

    const lessons: CEFRLesson[] = [];
    const totalLessons = Math.ceil(validWords.length / WORDS_PER_LESSON);

    for (let i = 0; i < totalLessons; i++) {
        const startIdx = i * WORDS_PER_LESSON;
        const endIdx = Math.min(startIdx + WORDS_PER_LESSON, validWords.length);
        const lessonWords = validWords.slice(startIdx, endIdx);

        lessons.push({
            id: `${level.toLowerCase()}-lesson-${i + 1}`,
            level,
            lessonNumber: i + 1,
            title: `${levelName} - Lesson ${i + 1}`,
            words: lessonWords,
            totalWords: lessonWords.length,
        });
    }

    return lessons;
}

// Generate lessons for each level (only valid words)
export const A1_LESSONS = createLessons(VOCAB_A1, 'A1', 'Beginner');
export const A2_LESSONS = createLessons(VOCAB_A2, 'A2', 'Elementary');
export const B1_LESSONS = createLessons(VOCAB_B1, 'B1', 'Intermediate');
export const B2_LESSONS = createLessons(VOCAB_B2, 'B2', 'Upper Intermediate');
export const C1_LESSONS = createLessons(VOCAB_C1, 'C1', 'Advanced');
export const C2_LESSONS = createLessons(VOCAB_C2, 'C2', 'Proficient');

// Level metadata with CEFR standard colors
export const CEFR_LEVEL_DATA: CEFRLevelData[] = [
    {
        level: 'A1',
        levelName: 'Beginner',
        color: '#10B981', // Green
        totalWords: A1_LESSONS.reduce((sum, l) => sum + l.totalWords, 0),
        totalLessons: A1_LESSONS.length,
        lessons: A1_LESSONS,
    },
    {
        level: 'A2',
        levelName: 'Elementary',
        color: '#84CC16', // Lime
        totalWords: A2_LESSONS.reduce((sum, l) => sum + l.totalWords, 0),
        totalLessons: A2_LESSONS.length,
        lessons: A2_LESSONS,
    },
    {
        level: 'B1',
        levelName: 'Intermediate',
        color: '#F59E0B', // Amber
        totalWords: B1_LESSONS.reduce((sum, l) => sum + l.totalWords, 0),
        totalLessons: B1_LESSONS.length,
        lessons: B1_LESSONS,
    },
    {
        level: 'B2',
        levelName: 'Upper Intermediate',
        color: '#F97316', // Orange
        totalWords: B2_LESSONS.reduce((sum, l) => sum + l.totalWords, 0),
        totalLessons: B2_LESSONS.length,
        lessons: B2_LESSONS,
    },
    {
        level: 'C1',
        levelName: 'Advanced',
        color: '#EF4444', // Red
        totalWords: C1_LESSONS.reduce((sum, l) => sum + l.totalWords, 0),
        totalLessons: C1_LESSONS.length,
        lessons: C1_LESSONS,
    },
    {
        level: 'C2',
        levelName: 'Proficient',
        color: '#DC2626', // Dark Red
        totalWords: C2_LESSONS.reduce((sum, l) => sum + l.totalWords, 0),
        totalLessons: C2_LESSONS.length,
        lessons: C2_LESSONS,
    },
];

/**
 * Get lessons for a specific CEFR level
 */
export function getLessonsByLevel(level: CEFRLevel): CEFRLesson[] {
    const levelData = CEFR_LEVEL_DATA.find((ld) => ld.level === level);
    return levelData?.lessons || [];
}

/**
 * Get a specific lesson by ID
 */
export function getLessonById(lessonId: string): CEFRLesson | null {
    for (const levelData of CEFR_LEVEL_DATA) {
        const lesson = levelData.lessons.find((l) => l.id === lessonId);
        if (lesson) return lesson;
    }
    return null;
}

/**
 * Get total statistics
 */
export function getCEFRStats() {
    return {
        totalLevels: CEFR_LEVEL_DATA.length,
        totalWords: CEFR_LEVEL_DATA.reduce((sum, level) => sum + level.totalWords, 0),
        totalLessons: CEFR_LEVEL_DATA.reduce((sum, level) => sum + level.totalLessons, 0),
        levels: CEFR_LEVEL_DATA.map((level) => ({
            level: level.level,
            name: level.levelName,
            words: level.totalWords,
            lessons: level.totalLessons,
        })),
    };
}

// Export all for convenience
export { VOCAB_A1, VOCAB_A2, VOCAB_B1, VOCAB_B2, VOCAB_C1, VOCAB_C2 };
export type { VocabWord };
