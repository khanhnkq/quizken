/**
 * Vocabulary Enrichment Script
 * Fetches English definitions/examples and translates to Vietnamese
 * 
 * Usage: node scripts/enrichVocabWithTranslations.mjs
 * 
 * APIs used (FREE):
 * - Free Dictionary API: https://dictionaryapi.dev/
 * - MyMemory Translation: https://mymemory.translated.net/
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    BATCH_SIZE: 20,           // Words per batch
    DELAY_BETWEEN_BATCHES: 3000,  // 3 seconds between batches (rate limit)
    DELAY_BETWEEN_WORDS: 500,     // 0.5 second between words
    MAX_RETRIES: 3,
    OUTPUT_FILE: path.join(__dirname, '../public/data/cefr/enriched-vocab.json'),
    PROGRESS_FILE: path.join(__dirname, '../public/data/cefr/enrichment-progress.json'),
};

// Load existing CEFR vocabulary from CSV
async function loadVocabFromCSV() {
    const csvPath = path.join(__dirname, '../public/data/cefr/cefrj-vocabulary-1.5.csv');
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').slice(1); // Skip header

    const words = [];
    lines.forEach((line, index) => {
        if (!line.trim()) return;

        const parts = line.split(',');
        const headword = parts[0]?.trim();
        const pos = parts[1]?.trim() || '';
        const level = parts[2]?.trim() || 'A1';

        if (headword) {
            words.push({
                id: `${level.toLowerCase()}-${index}`,
                word: headword,
                pos: pos,
                level: level,
            });
        }
    });

    return words;
}

// Fetch English definition and example from Free Dictionary API
async function fetchEnglishData(word) {
    try {
        const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
            { headers: { 'Accept': 'application/json' } }
        );

        if (!res.ok) {
            return { definition_en: '', example_en: '', phonetic: '' };
        }

        const data = await res.json();
        const entry = data[0];

        // Get phonetic
        const phonetic = entry?.phonetic || entry?.phonetics?.[0]?.text || '';

        // Get first meaning with definition
        let definition = '';
        let example = '';

        for (const meaning of entry?.meanings || []) {
            for (const def of meaning.definitions || []) {
                if (def.definition && !definition) {
                    definition = def.definition;
                }
                if (def.example && !example) {
                    example = def.example;
                }
                if (definition && example) break;
            }
            if (definition && example) break;
        }

        return {
            definition_en: definition || '',
            example_en: example || '',
            phonetic: phonetic || '',
        };
    } catch (error) {
        console.error(`  ⚠️ Dictionary API error for "${word}":`, error.message);
        return { definition_en: '', example_en: '', phonetic: '' };
    }
}

// Translate text to Vietnamese using MyMemory (free, no API key needed)
async function translateToVietnamese(text) {
    if (!text || text.length < 2) return '';

    try {
        // Limit text length to avoid API issues
        const truncatedText = text.length > 500 ? text.substring(0, 500) + '...' : text;

        const res = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncatedText)}&langpair=en|vi`,
            { headers: { 'Accept': 'application/json' } }
        );

        if (!res.ok) return '';

        const data = await res.json();

        if (data.responseStatus === 200 && data.responseData?.translatedText) {
            return data.responseData.translatedText;
        }

        return '';
    } catch (error) {
        console.error(`  ⚠️ Translation error:`, error.message);
        return '';
    }
}

// Process a single word
async function enrichWord(wordData) {
    const { word, pos, level } = wordData;

    // 1. Fetch English data
    const { definition_en, example_en, phonetic } = await fetchEnglishData(word);

    // Small delay before translation
    await sleep(200);

    // 2. Translate definition to Vietnamese
    const definition_vi = definition_en
        ? await translateToVietnamese(definition_en)
        : '';

    // Small delay
    await sleep(200);

    // 3. Translate example to Vietnamese (if exists)
    const example_vi = example_en
        ? await translateToVietnamese(example_en)
        : '';

    // 4. Generate fallback example if none found
    const finalExample = example_en || generateFallbackExample(word, pos);

    return {
        ...wordData,
        definition_en: definition_en || `A ${pos} word at ${level} level`,
        definition_vi: definition_vi || `Từ ${pos} ở cấp độ ${level}`,
        example_en: finalExample,
        example_vi: example_vi || '',
        phonetic: phonetic,
    };
}

// Generate simple example sentence
function generateFallbackExample(word, pos) {
    const templates = {
        noun: [
            `The ${word} is very important.`,
            `I saw a ${word} yesterday.`,
            `This ${word} is interesting.`,
        ],
        verb: [
            `I ${word} every day.`,
            `She wants to ${word}.`,
            `They ${word} together.`,
        ],
        adjective: [
            `It is very ${word}.`,
            `The ${word} thing surprised me.`,
            `She looks ${word} today.`,
        ],
        adverb: [
            `He runs ${word}.`,
            `She speaks ${word}.`,
            `They work ${word}.`,
        ],
        default: [
            `Let me use "${word}" in a sentence.`,
            `This is an example with "${word}".`,
        ],
    };

    const posType = pos?.toLowerCase() || 'default';
    const options = templates[posType] || templates.default;
    return options[Math.floor(Math.random() * options.length)];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Load progress (for resuming)
function loadProgress() {
    try {
        if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
            const data = fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.log('No previous progress found, starting fresh.');
    }
    return { processedIds: [], enrichedData: {} };
}

// Save progress
function saveProgress(progress) {
    fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// Save final output
function saveOutput(enrichedData) {
    fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(enrichedData, null, 2));
}

// Main execution
async function main() {
    console.log('🚀 Starting Vocabulary Enrichment...\n');

    // Load vocabulary
    const words = await loadVocabFromCSV();
    console.log(`📚 Loaded ${words.length} words from CSV\n`);

    // Load previous progress
    let progress = loadProgress();
    const processedSet = new Set(progress.processedIds);
    let enrichedData = progress.enrichedData;

    // Filter out already processed words
    const remaining = words.filter(w => !processedSet.has(w.id));
    console.log(`⏳ ${remaining.length} words remaining to process\n`);

    if (remaining.length === 0) {
        console.log('✅ All words already processed!');
        return;
    }

    // Process in batches
    const totalBatches = Math.ceil(remaining.length / CONFIG.BATCH_SIZE);
    let processedCount = Object.keys(enrichedData).length;

    for (let i = 0; i < remaining.length; i += CONFIG.BATCH_SIZE) {
        const batchNum = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
        const batch = remaining.slice(i, i + CONFIG.BATCH_SIZE);

        console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} words)`);
        console.log(`   Progress: ${processedCount}/${words.length} (${Math.round(processedCount / words.length * 100)}%)`);

        for (const wordData of batch) {
            try {
                console.log(`  🔍 Processing: ${wordData.word} (${wordData.level})`);

                const enriched = await enrichWord(wordData);
                enrichedData[wordData.id] = enriched;
                progress.processedIds.push(wordData.id);
                processedCount++;

                // Log success
                console.log(`  ✅ ${wordData.word}: "${enriched.definition_en?.substring(0, 40)}..."`);

                // Delay between words
                await sleep(CONFIG.DELAY_BETWEEN_WORDS);

            } catch (error) {
                console.error(`  ❌ Error processing "${wordData.word}":`, error.message);
            }
        }

        // Save progress after each batch
        progress.enrichedData = enrichedData;
        saveProgress(progress);
        console.log(`  💾 Progress saved`);

        // Delay between batches (avoid rate limiting)
        if (i + CONFIG.BATCH_SIZE < remaining.length) {
            console.log(`  ⏸️ Waiting ${CONFIG.DELAY_BETWEEN_BATCHES / 1000}s before next batch...`);
            await sleep(CONFIG.DELAY_BETWEEN_BATCHES);
        }
    }

    // Save final output
    saveOutput(enrichedData);
    console.log(`\n🎉 Enrichment complete!`);
    console.log(`📁 Output saved to: ${CONFIG.OUTPUT_FILE}`);
    console.log(`📊 Total words enriched: ${Object.keys(enrichedData).length}`);
}

// Run
main().catch(console.error);
