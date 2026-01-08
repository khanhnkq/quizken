/**
 * CEFR Vocabulary - Lazy Loaded Chunks
 * Optimized for bundle size
 */

export type { CEFRLevel, VocabWord } from './a1';

// Lazy loading functions for each level
export async function loadA1() {
  const { VOCAB_A1 } = await import('./a1');
  return VOCAB_A1;
}

export async function loadA2() {
  const { VOCAB_A2 } = await import('./a2');
  return VOCAB_A2;
}

export async function loadB1() {
  const { VOCAB_B1 } = await import('./b1');
  return VOCAB_B1;
}

export async function loadB2() {
  const { VOCAB_B2 } = await import('./b2');
  return VOCAB_B2;
}

export async function loadC1() {
  const { VOCAB_C1 } = await import('./c1');
  return VOCAB_C1;
}

export async function loadC2() {
  const { VOCAB_C2 } = await import('./c2');
  return VOCAB_C2;
}

// Helper to load any level dynamically
export async function loadVocabByLevel(level: CEFRLevel) {
  switch (level) {
    case 'A1': return loadA1();
    case 'A2': return loadA2();
    case 'B1': return loadB1();
    case 'B2': return loadB2();
    case 'C1': return loadC1();
    case 'C2': return loadC2();
  }
}
