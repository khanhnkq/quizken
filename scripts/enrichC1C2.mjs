/**
 * FAST Enrichment for C1/C2 (Octanove dataset)
 * 
 * Usage: node scripts/enrichC1C2.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    CONCURRENT_REQUESTS: 10,
    BATCH_SIZE: 50,
    DELAY_BETWEEN_BATCHES: 1000,
    OUTPUT_FILE: path.join(__dirname, '../public/data/cefr/enriched-vocab.json'),
    C1C2_CSV: path.join(__dirname, '../public/data/cefr/octanove-c1c2-1.0.csv'),
};

// Load C1/C2 vocabulary from Octanove CSV
function loadC1C2Vocab() {
    const content = fs.readFileSync(CONFIG.C1C2_CSV, 'utf-8');
    const lines = content.split('\n').slice(1); // Skip header

    const words = [];
    const seen = new Set();

    lines.forEach((line, index) => {
        if (!line.trim()) return;

        // Parse CSV (may have commas in fields, so be careful)
        const parts = line.split(',');
        const headword = parts[0]?.trim()?.toLowerCase();
        const pos = parts[1]?.trim() || '';
        const level = parts[2]?.trim() || 'C1';

        // Only C1 and C2
        if (!['C1', 'C2'].includes(level)) return;

        const key = `${headword}-${pos}`;
        if (headword && !seen.has(key)) {
            seen.add(key);
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

// Fetch English data
async function fetchEnglish(word, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) return { definition: '', example: '', phonetic: '' };

        const data = await res.json();
        const entry = data[0];
        const meaning = entry?.meanings?.[0]?.definitions?.[0];

        return {
            definition: meaning?.definition || '',
            example: meaning?.example || '',
            phonetic: entry?.phonetic || '',
        };
    } catch {
        clearTimeout(timeoutId);
        return { definition: '', example: '', phonetic: '' };
    }
}

// Translate to Vietnamese
async function translateToVi(text, timeout = 5000) {
    if (!text || text.length < 3) return '';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const truncated = text.length > 300 ? text.substring(0, 300) : text;
        const res = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(truncated)}&langpair=en|vi`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!res.ok) return '';
        const data = await res.json();
        return data.responseData?.translatedText || '';
    } catch {
        clearTimeout(timeoutId);
        return '';
    }
}

// Process single word
async function enrichWord(wordData) {
    const { word, pos, level } = wordData;

    const { definition, example, phonetic } = await fetchEnglish(word);

    let definition_vi = '';
    if (definition) {
        definition_vi = await translateToVi(definition);
    }

    return {
        ...wordData,
        definition_en: definition || `A ${pos} word at ${level} level`,
        definition_vi: definition_vi || '',
        example_en: example || `The word "${word}" is commonly used.`,
        phonetic: phonetic,
    };
}

// Process batch with concurrency
async function processBatch(batch) {
    const results = [];

    for (let i = 0; i < batch.length; i += CONFIG.CONCURRENT_REQUESTS) {
        const chunk = batch.slice(i, i + CONFIG.CONCURRENT_REQUESTS);
        const chunkResults = await Promise.all(chunk.map(enrichWord));
        results.push(...chunkResults);
    }

    return results;
}

// Main
async function main() {
    console.log('🚀 C1/C2 Vocabulary Enrichment\n');

    // Load existing enriched data
    let enrichedData = {};
    if (fs.existsSync(CONFIG.OUTPUT_FILE)) {
        enrichedData = JSON.parse(fs.readFileSync(CONFIG.OUTPUT_FILE, 'utf-8'));
        console.log(`📂 Loaded ${Object.keys(enrichedData).length} existing words\n`);
    }

    // Load C1/C2 words
    const c1c2Words = loadC1C2Vocab();
    console.log(`📚 Found ${c1c2Words.length} C1/C2 words\n`);

    // Filter already processed
    const remaining = c1c2Words.filter(w => !enrichedData[w.id]);
    console.log(`⏳ ${remaining.length} words to process\n`);

    if (remaining.length === 0) {
        console.log('✅ All C1/C2 words already enriched!');
        return;
    }

    const startTime = Date.now();
    let processed = 0;

    for (let i = 0; i < remaining.length; i += CONFIG.BATCH_SIZE) {
        const batch = remaining.slice(i, i + CONFIG.BATCH_SIZE);
        const batchNum = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(remaining.length / CONFIG.BATCH_SIZE);

        console.log(`📦 Batch ${batchNum}/${totalBatches}`);

        try {
            const results = await processBatch(batch);

            results.forEach(result => {
                enrichedData[result.id] = result;
            });

            processed += results.length;

            const elapsed = (Date.now() - startTime) / 1000;
            const rate = processed / elapsed;
            const eta = Math.round((remaining.length - processed) / rate / 60);

            console.log(`   ✅ ${processed}/${remaining.length} (${Math.round(processed / remaining.length * 100)}%) - ETA: ${eta} min`);

            // Save after each batch
            fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(enrichedData, null, 2));

        } catch (err) {
            console.error(`   ❌ Error:`, err.message);
        }

        await new Promise(r => setTimeout(r, CONFIG.DELAY_BETWEEN_BATCHES));
    }

    // Final save
    fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(enrichedData, null, 2));

    // Count by level
    const levels = {};
    Object.values(enrichedData).forEach(w => {
        levels[w.level] = (levels[w.level] || 0) + 1;
    });

    console.log('\n🎉 Complete!');
    console.log('📊 Final distribution:');
    Object.entries(levels).sort().forEach(([k, v]) => console.log(`   ${k}: ${v} words`));
}

main().catch(console.error);
