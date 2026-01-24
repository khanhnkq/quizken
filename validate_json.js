import fs from 'fs';

const path = "/Users/nguyenkimquockhanh/Desktop/quizken/quizken/src/i18n/locales/en.json";

try {
    const content = fs.readFileSync(path, 'utf8');
    const json = JSON.parse(content);
    console.log("JSON is valid.");
    if (json.themes) {
        console.log("Found 'themes' key.");
        console.log("Keys in themes:", Object.keys(json.themes));
        if (json.themes.neon_night) {
             console.log("neon_night subtitle:", json.themes.neon_night.subtitle);
        } else {
             console.log("neon_night missing");
        }
    } else {
        console.log("'themes' key MISSING.");
    }
} catch (e) {
    console.error("JSON Error:", e.message);
}
