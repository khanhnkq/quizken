/**
 * CEFR CSV Parser
 * Parses CEFR vocabulary CSV files and generates TypeScript vocabulary data
 */

import * as fs from 'fs';
import * as path from 'path';

interface CEFREntry {
    headword: string;
    pos: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    coreInventory1?: string;
    coreInventory2?: string;
    threshold?: string;
    notes?: string;
}

interface VocabWord {
    id: string;
    word: string;
    pos: string;
    level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
    definition?: string;
    example?: string;
    phonetic?: string;
}

function parseCSV(filePath: string, isOctanove: boolean = false): CEFREntry[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const entries: CEFREntry[] = [];

    // Skip header
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length < 3) continue;

        const entry: CEFREntry = {
            headword: parts[0].trim(),
            pos: parts[1].trim(),
            level: parts[2].trim() as any,
        };

        if (!isOctanove && parts.length > 3) {
            entry.coreInventory1 = parts[3]?.trim();
            entry.coreInventory2 = parts[4]?.trim();
            entry.threshold = parts[5]?.trim();
        } else if (isOctanove && parts.length > 3) {
            entry.notes = parts[3]?.trim();
        }

        entries.push(entry);
    }

    return entries;
}

function generateVocabData(entries: CEFREntry[]): VocabWord[] {
    const vocabWords: VocabWord[] = [];
    const seenWords = new Set<string>();

    entries.forEach((entry, index) => {
        // Create unique ID for each word-pos combination
        const key = `${entry.headword}-${entry.pos}`;

        // Skip duplicates (keep first occurrence)
        if (seenWords.has(key)) return;
        seenWords.add(key);

        const word: VocabWord = {
            id: `${entry.level.toLowerCase()}-${index + 1}`,
            word: entry.headword,
            pos: entry.pos,
            level: entry.level,
            // Placeholder for now - can be enriched later
            definition: `${entry.pos} - CEFR ${entry.level}`,
            example: `Example sentence using "${entry.headword}".`,
        };

        vocabWords.push(word);
    });

    return vocabWords;
}

function groupByLevel(words: VocabWord[]): Record<string, VocabWord[]> {
    const grouped: Record<string, VocabWord[]> = {
        A1: [],
        A2: [],
        B1: [],
        B2: [],
        C1: [],
        C2: [],
    };

    words.forEach(word => {
        grouped[word.level].push(word);
    });

    return grouped;
}

function generateTypeScriptFile(vocabByLevel: Record<string, VocabWord[]>, outputPath: string) {
    let content = `/**
 * CEFR-Based Vocabulary Data
 * Generated from official CEFR-J dataset
 * 
 * Total words: ${Object.values(vocabByLevel).flat().length}
 * A1: ${vocabByLevel.A1.length} | A2: ${vocabByLevel.A2.length} | B1: ${vocabByLevel.B1.length}
 * B2: ${vocabByLevel.B2.length} | C1: ${vocabByLevel.C1.length} | C2: ${vocabByLevel.C2.length}
 */

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface VocabWord {
  id: string;
  word: string;
  pos: string;
  level: CEFRLevel;
  definition?: string;
  example?: string;
  phonetic?: string;
}

`;

    // Generate data for each level
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
        const words = vocabByLevel[level];
        content += `\n// ${level} Level (${words.length} words)\n`;
        content += `export const VOCAB_${level}: VocabWord[] = ${JSON.stringify(words, null, 2)};\n`;
    }

    // Generate combined array
    content += `\n// All vocabulary combined\n`;
    content += `export const VOCAB_DATA: VocabWord[] = [\n`;
    content += `  ...VOCAB_A1,\n`;
    content += `  ...VOCAB_A2,\n`;
    content += `  ...VOCAB_B1,\n`;
    content += `  ...VOCAB_B2,\n`;
    content += `  ...VOCAB_C1,\n`;
    content += `  ...VOCAB_C2,\n`;
    content += `];\n`;

    // Generate levels constant
    content += `\nexport const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];\n`;

    // Helper function to get words by level
    content += `\nexport function getWordsByLevel(level: CEFRLevel): VocabWord[] {
  switch (level) {
    case 'A1': return VOCAB_A1;
    case 'A2': return VOCAB_A2;
    case 'B1': return VOCAB_B1;
    case 'B2': return VOCAB_B2;
    case 'C1': return VOCAB_C1;
    case 'C2': return VOCAB_C2;
    default: return [];
  }
}\n`;

    fs.writeFileSync(outputPath, content, 'utf-8');
}

// Main execution
function main() {
    console.log('🚀 Parsing CEFR vocabulary data...\n');

    const publicDir = path.join(process.cwd(), 'public', 'data', 'cefr');
    const cefrjPath = path.join(publicDir, 'cefrj-vocabulary-1.5.csv');
    const octanovePath = path.join(publicDir, 'octanove-c1c2-1.0.csv');

    // Parse both CSV files
    console.log('📖 Reading CEFR-J vocabulary (A1-B2)...');
    const cefrjEntries = parseCSV(cefrjPath, false);
    console.log(`   Found ${cefrjEntries.length} entries\n`);

    console.log('📖 Reading Octanove C1/C2 vocabulary...');
    const octanoveEntries = parseCSV(octanovePath, true);
    console.log(`   Found ${octanoveEntries.length} entries\n`);

    // Combine entries
    const allEntries = [...cefrjEntries, ...octanoveEntries];
    console.log(`📊 Total entries: ${allEntries.length}\n`);

    // Generate vocabulary data
    console.log('🔄 Generating vocabulary data...');
    const vocabWords = generateVocabData(allEntries);
    console.log(`   Generated ${vocabWords.length} unique words\n`);

    // Group by level
    console.log('📁 Grouping by CEFR level...');
    const vocabByLevel = groupByLevel(vocabWords);
    console.log('   Distribution:');
    console.log(`   - A1: ${vocabByLevel.A1.length} words`);
    console.log(`   - A2: ${vocabByLevel.A2.length} words`);
    console.log(`   - B1: ${vocabByLevel.B1.length} words`);
    console.log(`   - B2: ${vocabByLevel.B2.length} words`);
    console.log(`   - C1: ${vocabByLevel.C1.length} words`);
    console.log(`   - C2: ${vocabByLevel.C2.length} words\n`);

    // Generate TypeScript file
    const outputPath = path.join(process.cwd(), 'src', 'lib', 'constants', 'cefrVocabData.ts');
    console.log(`📝 Writing to ${outputPath}...`);
    generateTypeScriptFile(vocabByLevel, outputPath);
    console.log('\n✅ Done! CEFR vocabulary data generated successfully.\n');
}

main();
