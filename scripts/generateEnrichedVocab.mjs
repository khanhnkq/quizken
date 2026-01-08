/**
 * Generate enriched cefrVocabData.ts from enriched-vocab.json
 * 
 * Usage: node scripts/generateEnrichedVocab.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_FILE = path.join(__dirname, '../public/data/cefr/enriched-vocab.json');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/constants/cefrVocabData.ts');

function main() {
    console.log('📖 Loading enriched vocabulary...');
    const enrichedData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

    const words = Object.values(enrichedData);
    console.log(`📚 ${words.length} words loaded\n`);

    // Group by level
    const byLevel = { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] };
    words.forEach(word => {
        const level = word.level || 'A1';
        if (byLevel[level]) {
            byLevel[level].push(word);
        }
    });

    console.log('📊 Distribution:');
    Object.entries(byLevel).forEach(([level, list]) => {
        console.log(`   ${level}: ${list.length} words`);
    });

    // Generate TypeScript
    let output = `/**
 * CEFR Vocabulary Data (Enriched with Vietnamese translations)
 * Auto-generated from enriched-vocab.json
 * 
 * Total: ${words.length} words
 * A1: ${byLevel.A1.length} | A2: ${byLevel.A2.length} | B1: ${byLevel.B1.length}
 * B2: ${byLevel.B2.length} | C1: ${byLevel.C1.length} | C2: ${byLevel.C2.length}
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
}

`;

    // Generate each level
    for (const [level, list] of Object.entries(byLevel)) {
        const sortedList = list.sort((a, b) => a.word.localeCompare(b.word));

        output += `export const VOCAB_${level}: VocabWord[] = [\n`;

        sortedList.forEach(word => {
            const escaped = (str) => str ? str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ').trim() : '';

            output += `  { id: '${word.id}', word: '${escaped(word.word)}', pos: '${escaped(word.pos)}', level: '${level}', definition_en: '${escaped(word.definition_en)}', definition_vi: '${escaped(word.definition_vi)}', example_en: '${escaped(word.example_en)}', phonetic: '${escaped(word.phonetic || '')}' },\n`;
        });

        output += `];\n\n`;
    }

    // Add combined data and helpers
    output += `// Combined vocabulary
export const VOCAB_DATA: VocabWord[] = [
  ...VOCAB_A1,
  ...VOCAB_A2,
  ...VOCAB_B1,
  ...VOCAB_B2,
  ...VOCAB_C1,
  ...VOCAB_C2,
];

export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function getWordsByLevel(level: CEFRLevel): VocabWord[] {
  switch (level) {
    case 'A1': return VOCAB_A1;
    case 'A2': return VOCAB_A2;
    case 'B1': return VOCAB_B1;
    case 'B2': return VOCAB_B2;
    case 'C1': return VOCAB_C1;
    case 'C2': return VOCAB_C2;
    default: return [];
  }
}

console.log('✅ CEFR vocabulary loaded:', VOCAB_DATA.length, 'words');
`;

    // Write output
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`\n✅ Generated: ${OUTPUT_FILE}`);
    console.log(`📄 File size: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
}

main();
