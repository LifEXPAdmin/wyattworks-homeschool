/**
 * Language Arts Generators
 *
 * Spelling, vocabulary, writing prompts, and grammar exercises
 */

import { SeededRandom } from "./math";

export interface SpellingWord {
  word: string;
  difficulty: string;
  sentence?: string;
}

export interface VocabularyItem {
  word: string;
  definition: string;
  example?: string;
}

export interface WritingPrompt {
  prompt: string;
  type: "narrative" | "expository" | "persuasive" | "descriptive";
  grade: string;
}

// Spelling word lists by grade level
const SPELLING_LISTS = {
  very_easy: [
    "cat",
    "dog",
    "run",
    "sun",
    "fun",
    "hat",
    "bat",
    "rat",
    "sit",
    "hit",
    "big",
    "pig",
    "dig",
    "log",
    "fog",
    "hop",
    "top",
    "pop",
    "yes",
    "can",
  ],
  easy: [
    "play",
    "stay",
    "they",
    "said",
    "make",
    "take",
    "like",
    "bike",
    "time",
    "fine",
    "home",
    "come",
    "some",
    "went",
    "jump",
    "help",
    "much",
    "such",
    "when",
    "then",
  ],
  medium: [
    "because",
    "before",
    "after",
    "school",
    "friend",
    "family",
    "people",
    "important",
    "special",
    "together",
    "animals",
    "problem",
    "question",
    "answer",
    "different",
    "remember",
    "thought",
    "through",
    "enough",
    "although",
  ],
  hard: [
    "beginning",
    "beautiful",
    "necessary",
    "restaurant",
    "environment",
    "government",
    "separate",
    "definitely",
    "recommend",
    "accommodate",
    "embarrass",
    "occurrence",
    "privilege",
    "conscience",
    "curious",
    "mysterious",
    "fascinating",
    "extraordinary",
    "magnificent",
    "spectacular",
  ],
};

// Writing prompts by type and grade
const WRITING_PROMPTS = {
  narrative: [
    "Write about your favorite adventure or trip.",
    "Describe a time when you learned something new.",
    "Tell the story of your best day ever.",
    "Write about a time you helped someone.",
    "Describe your favorite holiday memory.",
    "Tell about a time you overcame a challenge.",
    "Write about meeting someone new.",
    "Describe your dream vacation.",
    "Tell a story about your favorite pet or animal.",
    "Write about a special tradition your family has.",
  ],
  expository: [
    "Explain how to make your favorite food.",
    "Describe the steps to care for a plant.",
    "Explain why exercise is important.",
    "Describe how the water cycle works.",
    "Explain what makes a good friend.",
    "Describe the process of photosynthesis.",
    "Explain why reading is beneficial.",
    "Describe how to solve a problem you face.",
    "Explain the importance of recycling.",
    "Describe your daily morning routine.",
  ],
  persuasive: [
    "Convince your parents to get a pet.",
    "Argue for or against homework.",
    "Persuade someone to read your favorite book.",
    "Make a case for a longer recess.",
    "Convince others why your hobby is the best.",
    "Argue for protecting the environment.",
    "Persuade someone to visit your favorite place.",
    "Make a case for learning a musical instrument.",
    "Convince others to help in the community.",
    "Argue for or against school uniforms.",
  ],
  descriptive: [
    "Describe your favorite room in detail.",
    "Paint a picture of a beautiful sunset with words.",
    "Describe your favorite season and why you love it.",
    "Write about a place that makes you happy.",
    "Describe your ideal treehouse or fort.",
    "Paint a word picture of your best friend.",
    "Describe a delicious meal in detail.",
    "Write about your favorite outdoor spot.",
    "Describe an interesting person you know.",
    "Paint a picture of your dream bedroom.",
  ],
};

// Vocabulary words with definitions
const VOCABULARY_LISTS = {
  easy: [
    { word: "brave", definition: "Showing courage; not afraid" },
    { word: "clever", definition: "Smart and quick to understand" },
    { word: "gentle", definition: "Soft and kind" },
    { word: "honest", definition: "Truthful and sincere" },
    { word: "patient", definition: "Able to wait calmly" },
  ],
  medium: [
    { word: "curious", definition: "Eager to learn or know something" },
    { word: "determined", definition: "Having a strong will to achieve something" },
    { word: "enthusiastic", definition: "Full of excitement and interest" },
    { word: "generous", definition: "Willing to give and share" },
    { word: "perseverance", definition: "Continuing despite difficulty" },
  ],
  hard: [
    { word: "benevolent", definition: "Kind and generous" },
    { word: "diligent", definition: "Showing care and effort in work" },
    { word: "eloquent", definition: "Fluent and persuasive in speaking or writing" },
    { word: "meticulous", definition: "Showing great attention to detail" },
    { word: "resilient", definition: "Able to recover quickly from difficulties" },
  ],
};

/**
 * Generates spelling words
 */
export function generateSpellingWords(options: {
  count?: number;
  difficulty?: "very_easy" | "easy" | "medium" | "hard";
  seed?: number;
}): SpellingWord[] {
  const { count = 10, difficulty = "easy", seed = Date.now() } = options;
  const rng = new SeededRandom(seed);

  const wordList =
    difficulty === "very_easy"
      ? SPELLING_LISTS.very_easy
      : SPELLING_LISTS[difficulty] || SPELLING_LISTS.easy;
  const selected: SpellingWord[] = [];
  const used = new Set<string>();

  while (selected.length < Math.min(count, wordList.length)) {
    const index = rng.nextInt(0, wordList.length - 1);
    const word = wordList[index];

    if (!used.has(word)) {
      used.add(word);
      selected.push({
        word,
        difficulty,
      });
    }
  }

  return selected;
}

/**
 * Generates vocabulary words with definitions
 */
export function generateVocabularyWords(options: {
  count?: number;
  difficulty?: "easy" | "medium" | "hard";
  seed?: number;
}): VocabularyItem[] {
  const { count = 5, difficulty = "medium", seed = Date.now() } = options;
  const rng = new SeededRandom(seed);

  const vocabList = VOCABULARY_LISTS[difficulty] || VOCABULARY_LISTS.medium;
  const selected: VocabularyItem[] = [];
  const used = new Set<string>();

  while (selected.length < Math.min(count, vocabList.length)) {
    const index = rng.nextInt(0, vocabList.length - 1);
    const item = vocabList[index];

    if (!used.has(item.word)) {
      used.add(item.word);
      selected.push(item);
    }
  }

  return selected;
}

/**
 * Generates writing prompts
 */
export function generateWritingPrompts(options: {
  count?: number;
  type?: "narrative" | "expository" | "persuasive" | "descriptive" | "mixed";
  seed?: number;
}): WritingPrompt[] {
  const { count = 1, type = "mixed", seed = Date.now() } = options;
  const rng = new SeededRandom(seed);

  let allPrompts: WritingPrompt[] = [];

  if (type === "mixed") {
    // Mix all types
    Object.entries(WRITING_PROMPTS).forEach(([promptType, prompts]) => {
      prompts.forEach((prompt) => {
        allPrompts.push({
          prompt,
          type: promptType as "narrative" | "expository" | "persuasive" | "descriptive",
          grade: "3-8",
        });
      });
    });
  } else {
    const prompts = WRITING_PROMPTS[type] || WRITING_PROMPTS.narrative;
    allPrompts = prompts.map((prompt) => ({
      prompt,
      type,
      grade: "3-8",
    }));
  }

  const selected: WritingPrompt[] = [];
  const used = new Set<string>();

  while (selected.length < Math.min(count, allPrompts.length)) {
    const index = rng.nextInt(0, allPrompts.length - 1);
    const item = allPrompts[index];

    if (!used.has(item.prompt)) {
      used.add(item.prompt);
      selected.push(item);
    }
  }

  return selected;
}
