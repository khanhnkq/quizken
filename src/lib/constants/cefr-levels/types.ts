/**
 * CEFR Vocabulary Data (Enriched with Vietnamese translations)
 * Auto-generated from enriched-vocab.json
 * 
 * Total: 9872 words
 * A1: 1162 | A2: 1411 | B1: 2445
 * B2: 2778 | C1: 1086 | C2: 990
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface VocabWord {
  id: string;
  word: string;
  pos: string;
  level: CEFRLevel;
  definition_en: string;
  definition_vi: string;
  example_en: string;
  phonetic?: string;
  topic?: string;
  example_vi?: string;
}

