// Automatically import all images from the chat-backgrounds folder
// This allows adding new images without changing code
const images = import.meta.glob('/src/assets/chat-backgrounds/*.{png,jpg,jpeg,svg,webp}', {
  eager: true,
  import: 'default',
});

// Convert to array of URLs
// We sort keys to ensure consistent order across different clients/reloads 
// (assuming filenames are meaningful like 1.jpg, 2.jpg... or just consistent alphabetical)
export const CHAT_BACKGROUND_URLS = Object.keys(images)
  .sort((a, b) => {
    // Try to sort numerically if possible for cleaner mapping "1.jpg" < "10.jpg"
    const numA = parseInt(a.match(/\/(\d+)\./)?.[1] || "0");
    const numB = parseInt(b.match(/\/(\d+)\./)?.[1] || "0");
    if (numA && numB) return numA - numB;
    return a.localeCompare(b);
  })
  .map((key) => images[key] as string);
