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

// Spelling word lists by grade level (much larger pools)
const SPELLING_LISTS = {
  K: [
    // Kindergarten: CVC words, basic sight words
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
    "the",
    "and",
    "see",
    "you",
    "me",
    "we",
    "he",
    "she",
    "it",
    "at",
    "mat",
    "fan",
    "pan",
    "man",
    "tan",
    "van",
    "red",
    "bed",
    "led",
    "fed",
    "get",
    "let",
    "pet",
    "wet",
    "net",
    "hot",
    "pot",
    "lot",
    "not",
    "got",
    "mom",
    "dad",
    "up",
    "cup",
    "bug",
    "hug",
    "rug",
    "tub",
    "cub",
    "sub",
  ],
  "1-2": [
    // Grades 1-2: Simple consonant blends, digraphs, basic sight words
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
    "stop",
    "drop",
    "shop",
    "ship",
    "chip",
    "trip",
    "skip",
    "snap",
    "clap",
    "flag",
    "blue",
    "true",
    "glue",
    "with",
    "this",
    "that",
    "what",
    "where",
    "who",
    "why",
    "look",
    "book",
    "took",
    "good",
    "food",
    "moon",
    "soon",
    "rain",
    "pain",
    "train",
    "from",
    "have",
    "were",
    "want",
    "your",
    "they",
    "been",
    "their",
    "would",
    "could",
    "does",
    "goes",
    "know",
    "show",
    "grow",
    "slow",
    "find",
    "kind",
    "mind",
    "wind",
  ],
  "3-4": [
    // Grades 3-4: Multi-syllable words, common patterns
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
    "around",
    "another",
    "between",
    "every",
    "always",
    "never",
    "sometimes",
    "usually",
    "really",
    "pretty",
    "beautiful",
    "wonderful",
    "favorite",
    "interest",
    "surprise",
    "imagine",
    "believe",
    "language",
    "attention",
    "decision",
    "business",
    "calendar",
    "chocolate",
    "february",
    "dictionary",
    "exercise",
    "experience",
    "finally",
    "government",
    "happened",
    "library",
    "mountain",
    "neighbor",
    "probably",
    "remember",
    "separate",
    "several",
    "situation",
    "soldier",
    "tomorrow",
    "trouble",
    "usually",
    "weather",
    "yesterday",
    "accident",
    "believe",
    "breakfast",
    "brother",
    "caught",
    "children",
  ],
  "5-6": [
    // Grades 5-6: Complex words, Greek/Latin roots
    "accommodate",
    "achievement",
    "argument",
    "beginning",
    "believe",
    "business",
    "calendar",
    "committee",
    "conscience",
    "curiosity",
    "definitely",
    "describe",
    "desperate",
    "develop",
    "difference",
    "disappoint",
    "discipline",
    "embarrass",
    "environment",
    "especially",
    "exaggerate",
    "excellent",
    "familiar",
    "foreign",
    "government",
    "guarantee",
    "height",
    "immediately",
    "independent",
    "interrupt",
    "knowledge",
    "library",
    "license",
    "maintenance",
    "necessary",
    "neighbor",
    "occasion",
    "occurred",
    "opinion",
    "opportunity",
    "parallel",
    "particular",
    "peasant",
    "possess",
    "possible",
    "prefer",
    "prejudice",
    "privilege",
    "probably",
    "psychology",
    "recommend",
    "reference",
    "restaurant",
    "rhythm",
    "ridiculous",
    "schedule",
    "separate",
    "similar",
    "successful",
    "surprise",
    "temperature",
    "thorough",
    "thought",
    "throughout",
    "truly",
    "unnecessary",
    "until",
    "unusual",
    "vacuum",
    "weather",
  ],
  "7-8": [
    // Grades 7-8: Advanced vocabulary, challenging spellings
    "accommodate",
    "acknowledgment",
    "acquire",
    "acquaintance",
    "address",
    "amateur",
    "apparatus",
    "apparent",
    "appropriate",
    "argument",
    "atheist",
    "auxiliary",
    "balloon",
    "barbarous",
    "beginning",
    "believe",
    "benefit",
    "bureau",
    "business",
    "calendar",
    "cemetery",
    "colonel",
    "column",
    "commission",
    "committee",
    "comparative",
    "compelled",
    "concede",
    "conscience",
    "conscientious",
    "conscious",
    "coolly",
    "correspondence",
    "criticize",
    "deceive",
    "defendant",
    "deferred",
    "definitely",
    "dependent",
    "descendant",
    "description",
    "desert",
    "dessert",
    "despair",
    "desperate",
    "develop",
    "dictionary",
    "dilemma",
    "disappear",
    "disappoint",
    "disastrous",
    "discipline",
    "dissatisfied",
    "eighth",
    "eligible",
    "eliminate",
    "embarrass",
    "environment",
    "equipped",
    "especially",
    "exaggerate",
    "exceed",
    "excellent",
    "existence",
    "experience",
    "extraordinary",
    "fascinate",
    "foreign",
    "forty",
    "government",
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

// Vocabulary words with definitions by grade
const VOCABULARY_LISTS = {
  K: [
    { word: "big", definition: "Large in size" },
    { word: "small", definition: "Little in size" },
    { word: "happy", definition: "Feeling good and joyful" },
    { word: "sad", definition: "Feeling unhappy" },
    { word: "fast", definition: "Moving quickly" },
    { word: "slow", definition: "Moving not quickly" },
    { word: "hot", definition: "Very warm" },
    { word: "cold", definition: "Not warm; chilly" },
    { word: "loud", definition: "Making a lot of sound" },
    { word: "quiet", definition: "Making little or no sound" },
  ],
  "1-2": [
    { word: "brave", definition: "Showing courage; not afraid" },
    { word: "clever", definition: "Smart and quick to understand" },
    { word: "gentle", definition: "Soft and kind" },
    { word: "honest", definition: "Truthful and sincere" },
    { word: "patient", definition: "Able to wait calmly" },
    { word: "friendly", definition: "Kind and pleasant" },
    { word: "polite", definition: "Having good manners" },
    { word: "proud", definition: "Feeling pleased with yourself" },
    { word: "silly", definition: "Funny in a playful way" },
    { word: "curious", definition: "Wanting to know or learn" },
  ],
  "3-4": [
    { word: "curious", definition: "Eager to learn or know something" },
    { word: "determined", definition: "Having a strong will to achieve something" },
    { word: "enthusiastic", definition: "Full of excitement and interest" },
    { word: "generous", definition: "Willing to give and share" },
    { word: "creative", definition: "Having original and imaginative ideas" },
    { word: "confident", definition: "Believing in yourself" },
    { word: "mysterious", definition: "Strange and not easy to explain" },
    { word: "adventurous", definition: "Willing to try new things" },
    { word: "cautious", definition: "Being careful to avoid danger" },
    { word: "fortunate", definition: "Lucky; having good things happen" },
  ],
  "5-6": [
    { word: "perseverance", definition: "Continuing despite difficulty" },
    { word: "benevolent", definition: "Kind and generous" },
    { word: "diligent", definition: "Showing care and effort in work" },
    { word: "eloquent", definition: "Fluent and persuasive in speaking or writing" },
    { word: "meticulous", definition: "Showing great attention to detail" },
    { word: "resilient", definition: "Able to recover quickly from difficulties" },
    { word: "ambitious", definition: "Having a strong desire to succeed" },
    { word: "compassionate", definition: "Showing sympathy and concern for others" },
    { word: "innovative", definition: "Featuring new methods or ideas" },
    { word: "skeptical", definition: "Not easily convinced; doubtful" },
  ],
  "7-8": [
    { word: "aesthetic", definition: "Concerned with beauty or the appreciation of beauty" },
    { word: "pragmatic", definition: "Dealing with things in a practical way" },
    { word: "tenacious", definition: "Persistent and determined" },
    { word: "versatile", definition: "Able to adapt to many functions" },
    { word: "eloquent", definition: "Fluent and persuasive in expression" },
    { word: "altruistic", definition: "Showing selfless concern for others" },
    { word: "shrewd", definition: "Having sharp judgment" },
    { word: "vindicate", definition: "To clear of blame or suspicion" },
    { word: "meticulous", definition: "Showing extreme care about details" },
    { word: "ephemeral", definition: "Lasting for a very short time" },
  ],
};

/**
 * Generates spelling words
 */
export function generateSpellingWords(options: {
  count?: number;
  grade?: "K" | "1-2" | "3-4" | "5-6" | "7-8" | "9-12";
  seed?: number;
}): SpellingWord[] {
  const { count = 10, grade = "1-2", seed = Date.now() } = options;
  const rng = new SeededRandom(seed);

  const wordList = SPELLING_LISTS[grade as keyof typeof SPELLING_LISTS] || SPELLING_LISTS["1-2"];
  const selected: SpellingWord[] = [];
  const used = new Set<string>();

  while (selected.length < Math.min(count, wordList.length)) {
    const index = rng.nextInt(0, wordList.length - 1);
    const word = wordList[index];

    if (!used.has(word)) {
      used.add(word);
      selected.push({
        word,
        difficulty: grade,
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
  grade?: "K" | "1-2" | "3-4" | "5-6" | "7-8" | "9-12";
  seed?: number;
}): VocabularyItem[] {
  const { count = 5, grade = "3-4", seed = Date.now() } = options;
  const rng = new SeededRandom(seed);

  const vocabList =
    VOCABULARY_LISTS[grade as keyof typeof VOCABULARY_LISTS] || VOCABULARY_LISTS["3-4"];
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
