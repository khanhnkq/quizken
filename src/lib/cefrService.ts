/**
 * CEFR Vocabulary Service
 * Provides utilities for working with CEFR vocabulary levels
 */

import type { CEFRLevel, CEFRWord, VocabularyAnalysis, PartOfSpeech } from '@/types/cefr';
import { CEFR_LEVELS } from '@/types/cefr';

class CEFRService {
    private vocabularyMap: Map<string, CEFRWord[]> = new Map();
    private isLoaded = false;
    private loadingPromise: Promise<void> | null = null;

    /**
     * Load CEFR vocabulary data from CSV files
     */
    async loadVocabulary(): Promise<void> {
        if (this.isLoaded) return;
        if (this.loadingPromise) return this.loadingPromise;

        this.loadingPromise = (async () => {
            try {
                // Load both datasets in parallel
                const [cefrjData, octanoveData] = await Promise.all([
                    this.loadCSV('/data/cefr/cefrj-vocabulary-1.5.csv'),
                    this.loadCSV('/data/cefr/octanove-c1c2-1.0.csv'),
                ]);

                // Parse CEFR-J data (A1-B2)
                this.parseVocabularyData(cefrjData, false);

                // Parse Octanove data (C1-C2)
                this.parseVocabularyData(octanoveData, true);

                this.isLoaded = true;
                console.log(`✅ CEFR vocabulary loaded: ${this.vocabularyMap.size} unique words`);
            } catch (error) {
                console.error('Failed to load CEFR vocabulary:', error);
                throw error;
            } finally {
                this.loadingPromise = null;
            }
        })();

        return this.loadingPromise;
    }

    /**
     * Load CSV file from public directory
     */
    private async loadCSV(path: string): Promise<string> {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.statusText}`);
        }
        return response.text();
    }

    /**
     * Parse CSV data and populate vocabulary map
     */
    private parseVocabularyData(csvData: string, isOctanove: boolean): void {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(',');
            if (values.length < 3) continue;

            const headword = values[0].toLowerCase().trim();
            const pos = values[1].trim() as PartOfSpeech;
            const level = values[2].trim() as CEFRLevel;

            if (!headword || !level) continue;

            const word: CEFRWord = {
                headword,
                pos,
                level,
            };

            if (!isOctanove && values.length > 3) {
                word.coreInventory1 = values[3]?.trim();
                word.coreInventory2 = values[4]?.trim();
                word.threshold = values[5]?.trim();
            } else if (isOctanove && values.length > 3) {
                word.notes = values[3]?.trim();
            }

            // Store word with all its POS variations
            const existing = this.vocabularyMap.get(headword) || [];
            existing.push(word);
            this.vocabularyMap.set(headword, existing);
        }
    }

    /**
     * Get CEFR level for a word
     * Returns the most common (lowest) level if word has multiple POS
     */
    getWordLevel(word: string): CEFRLevel | null {
        if (!this.isLoaded) {
            console.warn('CEFR vocabulary not loaded yet. Call loadVocabulary() first.');
            return null;
        }

        const normalized = word.toLowerCase().trim();
        const entries = this.vocabularyMap.get(normalized);

        if (!entries || entries.length === 0) return null;

        // Return the lowest (easiest) level
        const levels = entries.map(e => e.level);
        return this.getLowestLevel(levels);
    }

    /**
     * Get all entries for a word (with different POS)
     */
    getWordEntries(word: string): CEFRWord[] {
        const normalized = word.toLowerCase().trim();
        return this.vocabularyMap.get(normalized) || [];
    }

    /**
     * Analyze a text and return vocabulary statistics
     */
    analyzeText(text: string): VocabularyAnalysis {
        const words = this.extractWords(text);
        const uniqueWords = Array.from(new Set(words.map(w => w.toLowerCase())));

        const levelDistribution: Record<CEFRLevel, number> = {
            A1: 0, A2: 0, B1: 0, B2: 0, C1: 0, C2: 0,
        };

        const analyzedWords: Array<{ word: string; level?: CEFRLevel; pos?: PartOfSpeech }> = [];
        const unknownWords: string[] = [];
        let totalLevelScore = 0;
        let analyzedCount = 0;

        for (const word of uniqueWords) {
            const entries = this.getWordEntries(word);

            if (entries.length > 0) {
                const level = this.getLowestLevel(entries.map(e => e.level));
                const mainEntry = entries[0];

                levelDistribution[level]++;
                totalLevelScore += CEFR_LEVELS[level].order;
                analyzedCount++;

                analyzedWords.push({
                    word,
                    level,
                    pos: mainEntry.pos,
                });
            } else {
                unknownWords.push(word);
                analyzedWords.push({ word });
            }
        }

        // Calculate average level
        const avgScore = analyzedCount > 0 ? Math.round(totalLevelScore / analyzedCount) : 1;
        const averageLevel = Object.values(CEFR_LEVELS).find(l => l.order === avgScore)?.level || 'A1';

        return {
            totalWords: words.length,
            analyzedWords: analyzedCount,
            unknownWords,
            levelDistribution,
            averageLevel,
            words: analyzedWords,
        };
    }

    /**
     * Extract words from text (basic tokenization)
     */
    private extractWords(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s'-]/g, ' ') // Keep apostrophes and hyphens
            .split(/\s+/)
            .filter(word => word.length > 0);
    }

    /**
     * Get the lowest (easiest) level from an array of levels
     */
    private getLowestLevel(levels: CEFRLevel[]): CEFRLevel {
        return levels.reduce((lowest, current) => {
            return CEFR_LEVELS[current].order < CEFR_LEVELS[lowest].order ? current : lowest;
        });
    }

    /**
     * Check if a word is at or below a certain level
     */
    isWordAtLevel(word: string, targetLevel: CEFRLevel): boolean {
        const wordLevel = this.getWordLevel(word);
        if (!wordLevel) return false;

        return CEFR_LEVELS[wordLevel].order <= CEFR_LEVELS[targetLevel].order;
    }

    /**
     * Filter words by CEFR level
     */
    filterWordsByLevel(words: string[], maxLevel: CEFRLevel): string[] {
        return words.filter(word => this.isWordAtLevel(word, maxLevel));
    }

    /**
     * Get vocabulary statistics
     */
    getStats() {
        return {
            totalWords: this.vocabularyMap.size,
            isLoaded: this.isLoaded,
        };
    }
}

// Export singleton instance
export const cefrService = new CEFRService();
