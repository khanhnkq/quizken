/**
 * FAST Vocabulary Enrichment Script (Parallel Processing)
 * ~10x faster than sequential version
 * 
 * Usage: node scripts/enrichVocabFast.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SPEED Configuration - Much faster!
const CONFIG = {
    CONCURRENT_REQUESTS: 10,      // Process 10 words at once
    BATCH_SIZE: 50,               // 50 words per batch  
    DELAY_BETWEEN_BATCHES: 1000,  // 1 second between batches
    MAX_RETRIES: 2,
    OUTPUT_FILE: path.join(__dirname, '../public/data/cefr/enriched-vocab.json'),
    PROGRESS_FILE: path.join(__dirname, '../public/data/cefr/enrichment-progress.json'),
};

// Load vocabulary from CSV
function loadVocabFromCSV() {
    const csvPath = path.join(__dirname, '../public/data/cefr/cefrj-vocabulary-1.5.csv');
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.split('\n').slice(1);

    const words = [];
    const seen = new Set();

    lines.forEach((line, index) => {
        if (!line.trim()) return;

        const parts = line.split(',');
        const headword = parts[0]?.trim()?.toLowerCase();
        const pos = parts[1]?.trim() || '';
        const level = parts[2]?.trim() || 'A1';

        // Dedupe by word+pos
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

// Fetch English data (with timeout)
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
            phonetic: entry?.phonetic || entry?.phonetics?.[0]?.text || '',
        };
    } catch {
        clearTimeout(timeoutId);
        return { definition: '', example: '', phonetic: '' };
    }
}

// Translate to Vietnamese (with timeout)
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

    // Fetch English first
    const { definition, example, phonetic } = await fetchEnglish(word);

    // Only translate if we got a definition
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

    // Process in chunks of CONCURRENT_REQUESTS
    for (let i = 0; i < batch.length; i += CONFIG.CONCURRENT_REQUESTS) {
        const chunk = batch.slice(i, i + CONFIG.CONCURRENT_REQUESTS);
        const chunkResults = await Promise.all(chunk.map(enrichWord));
        results.push(...chunkResults);
    }

    return results;
}

// Load/Save progress
function loadProgress() {
    try {
        if (fs.existsSync(CONFIG.PROGRESS_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG.PROGRESS_FILE, 'utf-8'));
        }
    } catch { }
    return { processedIds: [], enrichedData: {} };
}

function saveProgress(progress) {
    fs.writeFileSync(CONFIG.PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function saveOutput(data) {
    fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(data, null, 2));
}

// Main
async function main() {
    console.log('🚀 FAST Vocabulary Enrichment (Parallel Mode)\n');

    const words = loadVocabFromCSV();
    console.log(`📚 Loaded ${words.length} unique words\n`);

    let progress = loadProgress();
    const processedSet = new Set(progress.processedIds);
    let enrichedData = progress.enrichedData;

    const remaining = words.filter(w => !processedSet.has(w.id));
    console.log(`⏳ ${remaining.length} words remaining\n`);

    if (remaining.length === 0) {
        console.log('✅ All done!');
        return;
    }

    const startTime = Date.now();
    let processed = Object.keys(enrichedData).length;

    for (let i = 0; i < remaining.length; i += CONFIG.BATCH_SIZE) {
        const batch = remaining.slice(i, i + CONFIG.BATCH_SIZE);
        const batchNum = Math.floor(i / CONFIG.BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(remaining.length / CONFIG.BATCH_SIZE);

        console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} words)`);

        try {
            const results = await processBatch(batch);

            results.forEach(result => {
                enrichedData[result.id] = result;
                progress.processedIds.push(result.id);
            });

            processed += results.length;

            // Calculate ETA
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = processed / elapsed;
            const eta = Math.round((words.length - processed) / rate / 60);

            console.log(`   ✅ ${processed}/${words.length} (${Math.round(processed / words.length * 100)}%) - ETA: ${eta} min`);

            // Save progress
            progress.enrichedData = enrichedData;
            saveProgress(progress);

        } catch (err) {
            console.error(`   ❌ Batch error:`, err.message);
        }

        // Short delay
        await new Promise(r => setTimeout(r, CONFIG.DELAY_BETWEEN_BATCHES));
    }

    saveOutput(enrichedData);
    console.log(`\n🎉 Complete! ${Object.keys(enrichedData).length} words enriched`);
    console.log(`📁 Output: ${CONFIG.OUTPUT_FILE}`);
}

main().catch(console.error);
