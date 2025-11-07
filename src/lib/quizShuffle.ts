// Utility to shuffle quiz questions and options with mapping preservation
import type { Quiz, Question } from "@/types/quiz";

// Fisher–Yates shuffle (non-mutating)
export function shuffleArray<T>(array: T[]): T[] {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i];
    result[i] = result[j];
    result[j] = tmp;
  }
  return result;
}

// Mapping of options for a question: new option index -> original option index
export interface OptionMapping {
  questionIndex: number;
  optionOrder: number[];
}

// Shuffled quiz data with mappings to original indices
export interface ShuffledQuizData {
  shuffledQuiz: Quiz;
  // Maps new question index -> original question index
  originalQuestionOrder: number[];
  // Per-question option index mapping: new option index -> original option index
  optionMappings: OptionMapping[];
}

// Create a shuffled quiz while preserving mappings to the original order
export function createShuffledQuiz(quiz: Quiz): ShuffledQuizData {
  const questionCount = quiz.questions.length;
  const originalOrder = Array.from({ length: questionCount }, (_, i) => i);
  const newQuestionOrder = shuffleArray(originalOrder);

  const optionMappings: OptionMapping[] = [];
  const shuffledQuestions: Question[] = newQuestionOrder.map(
    (origIdx, newIdx) => {
      const originalQ = quiz.questions[origIdx];
      const optionIndices = Array.from(
        { length: originalQ.options.length },
        (_, i) => i
      );
      const shuffledOptionOrder = shuffleArray(optionIndices);

      // Keep mapping for later score computation or audit
      optionMappings.push({
        questionIndex: newIdx,
        optionOrder: shuffledOptionOrder,
      });

      const newOptions = shuffledOptionOrder.map((i) => originalQ.options[i]);
      const newCorrectIndex = shuffledOptionOrder.findIndex(
        (i) => i === originalQ.correctAnswer
      );

      return {
        question: originalQ.question,
        options: newOptions,
        correctAnswer: newCorrectIndex,
        explanation: originalQ.explanation,
      };
    }
  );

  const shuffledQuiz: Quiz = {
    ...quiz,
    questions: shuffledQuestions,
  };

  return {
    shuffledQuiz,
    originalQuestionOrder: newQuestionOrder,
    optionMappings,
  };
}

// Map a selected answer (based on shuffled view) back to original indices
export function mapAnswerToOriginal(
  newQuestionIndex: number,
  selectedOptionIndex: number,
  data: ShuffledQuizData
): { originalQuestionIndex: number; originalOptionIndex: number } {
  const originalQuestionIndex = data.originalQuestionOrder[newQuestionIndex];
  const mapping = data.optionMappings.find(
    (m) => m.questionIndex === newQuestionIndex
  );
  if (!mapping) {
    throw new Error(
      `Missing option mapping for question index ${newQuestionIndex}`
    );
  }
  const originalOptionIndex = mapping.optionOrder[selectedOptionIndex];
  return { originalQuestionIndex, originalOptionIndex };
}

// Utility to reshuffle again from the current (or original) quiz
export function reshuffle(quiz: Quiz): ShuffledQuizData {
  return createShuffledQuiz(quiz);
}

// Helper to compute score from user answers using shuffled quiz data
// This compares directly against shuffled correctAnswer (fast path).
// If you need to audit against original mapping, use mapAnswerToOriginal.
export function computeScoreFromShuffled(
  data: ShuffledQuizData,
  userAnswers: number[]
): number {
  let score = 0;
  const { shuffledQuiz } = data;
  for (let i = 0; i < shuffledQuiz.questions.length; i++) {
    const q = shuffledQuiz.questions[i];
    const ans = userAnswers[i];
    if (typeof ans === "number" && ans === q.correctAnswer) {
      score++;
    }
  }
  return score;
}

// Validate mappings integrity (optional diagnostic)
export function validateMappings(data: ShuffledQuizData): boolean {
  const { shuffledQuiz, originalQuestionOrder, optionMappings } = data;
  if (shuffledQuiz.questions.length !== originalQuestionOrder.length)
    return false;
  for (let i = 0; i < shuffledQuiz.questions.length; i++) {
    const mapping = optionMappings.find((m) => m.questionIndex === i);
    if (!mapping) return false;
    const optsLen = shuffledQuiz.questions[i].options.length;
    if (mapping.optionOrder.length !== optsLen) return false;
    // Ensure mapping is a permutation 0..n-1
    const set = new Set(mapping.optionOrder);
    if (set.size !== optsLen) return false;
    for (let j = 0; j < optsLen; j++) {
      if (!set.has(j)) return false;
    }
  }
  return true;
}
