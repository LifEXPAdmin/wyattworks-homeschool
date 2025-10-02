export interface InteractiveElement {
  id: string;
  type: "drag-drop" | "fill-blank" | "multiple-choice" | "audio" | "video" | "drawing";
  content: unknown;
  feedback?: string;
  points: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface DragDropElement extends InteractiveElement {
  type: "drag-drop";
  content: {
    question: string;
    options: string[];
    correctAnswers: string[];
    dropZones: Array<{
      id: string;
      label: string;
      position: { x: number; y: number };
      accepts: string[];
    }>;
  };
}

export interface FillBlankElement extends InteractiveElement {
  type: "fill-blank";
  content: {
    text: string;
    blanks: Array<{
      id: string;
      position: number;
      correctAnswer: string;
      hint?: string;
    }>;
  };
}

export interface MultipleChoiceElement extends InteractiveElement {
  type: "multiple-choice";
  content: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
    explanation?: string;
  };
}

export interface AudioElement extends InteractiveElement {
  type: "audio";
  content: {
    url: string;
    transcript?: string;
    questions?: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  };
}

export interface VideoElement extends InteractiveElement {
  type: "video";
  content: {
    url: string;
    title: string;
    description?: string;
    questions?: Array<{
      id: string;
      timestamp: number;
      question: string;
      answer: string;
    }>;
  };
}

export interface DrawingElement extends InteractiveElement {
  type: "drawing";
  content: {
    prompt: string;
    canvasSize: { width: number; height: number };
    tools: string[];
    sampleImage?: string;
  };
}

export type AllInteractiveElements =
  | DragDropElement
  | FillBlankElement
  | MultipleChoiceElement
  | AudioElement
  | VideoElement
  | DrawingElement;

// Interactive worksheet configuration
export interface InteractiveWorksheet {
  id: string;
  title: string;
  elements: AllInteractiveElements[];
  settings: {
    autoGrade: boolean;
    showHints: boolean;
    timeLimit?: number;
    allowRetry: boolean;
    showProgress: boolean;
  };
  metadata: {
    subject: string;
    gradeLevel: string;
    difficulty: string;
    estimatedTime: string;
    skills: string[];
  };
}

// Interactive element generators
export class InteractiveElementGenerator {
  // Generate drag-and-drop math problems
  static generateDragDropMath(
    operation: string,
    difficulty: string,
    count: number
  ): DragDropElement[] {
    const elements: DragDropElement[] = [];

    for (let i = 0; i < count; i++) {
      const element: DragDropElement = {
        id: `drag-drop-${i}`,
        type: "drag-drop",
        content: {
          question: `Drag the correct answer to complete the equation:`,
          options: this.generateMathOptions(operation, difficulty),
          correctAnswers: [],
          dropZones: [
            {
              id: "answer-zone",
              label: "Answer",
              position: { x: 300, y: 100 },
              accepts: ["correct-answer"],
            },
          ],
        },
        feedback: "Great job! You got it right!",
        points: 10,
        position: { x: 50, y: 50 + i * 200 },
        size: { width: 400, height: 150 },
      };

      elements.push(element);
    }

    return elements;
  }

  // Generate fill-in-the-blank vocabulary
  static generateFillBlankVocabulary(words: string[], count: number): FillBlankElement[] {
    const elements: FillBlankElement[] = [];

    for (let i = 0; i < Math.min(count, words.length); i++) {
      const word = words[i];
      const definition = this.getWordDefinition(word);

      const element: FillBlankElement = {
        id: `fill-blank-${i}`,
        type: "fill-blank",
        content: {
          text: `The word "${word}" means: ${definition.replace(word, "_____")}`,
          blanks: [
            {
              id: "blank-1",
              position: definition.indexOf(word),
              correctAnswer: word,
              hint: `Starts with "${word[0].toUpperCase()}"`,
            },
          ],
        },
        feedback: `Correct! "${word}" means "${definition}"`,
        points: 5,
        position: { x: 50, y: 50 + i * 100 },
        size: { width: 500, height: 80 },
      };

      elements.push(element);
    }

    return elements;
  }

  // Generate multiple choice science questions
  static generateMultipleChoiceScience(topic: string, count: number): MultipleChoiceElement[] {
    const elements: MultipleChoiceElement[] = [];
    const questions = this.getScienceQuestions(topic);

    for (let i = 0; i < Math.min(count, questions.length); i++) {
      const question = questions[i];

      const element: MultipleChoiceElement = {
        id: `multiple-choice-${i}`,
        type: "multiple-choice",
        content: {
          question: question.question,
          options: question.options.map((option, index) => ({
            id: `option-${index}`,
            text: option,
            isCorrect: index === question.correctIndex,
          })),
          explanation: question.explanation,
        },
        feedback: question.explanation || "Good job!",
        points: 10,
        position: { x: 50, y: 50 + i * 200 },
        size: { width: 600, height: 150 },
      };

      elements.push(element);
    }

    return elements;
  }

  // Helper methods
  private static generateMathOptions(operation: string, difficulty: string): string[] {
    const options = [];
    const baseNumber = difficulty === "easy" ? 10 : difficulty === "medium" ? 50 : 100;

    for (let i = 0; i < 4; i++) {
      const num = Math.floor(Math.random() * baseNumber) + 1;
      options.push(num.toString());
    }

    return options;
  }

  private static getWordDefinition(word: string): string {
    const definitions: Record<string, string> = {
      cat: "a small domesticated carnivorous mammal",
      dog: "a domesticated carnivorous mammal",
      house: "a building for human habitation",
      tree: "a woody perennial plant",
      water: "a colorless, transparent, odorless liquid",
      sun: "the star around which the earth orbits",
      moon: "the natural satellite of the earth",
      star: "a fixed luminous point in the night sky",
    };

    return definitions[word.toLowerCase()] || `a word meaning ${word}`;
  }

  private static getScienceQuestions(topic: string): Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }> {
    const questions: Record<
      string,
      Array<{
        question: string;
        options: string[];
        correctIndex: number;
        explanation?: string;
      }>
    > = {
      biology: [
        {
          question: "What is the powerhouse of the cell?",
          options: ["Nucleus", "Mitochondria", "Ribosome", "Cell wall"],
          correctIndex: 1,
          explanation:
            "Mitochondria are known as the powerhouse of the cell because they produce energy.",
        },
        {
          question: "Which process do plants use to make food?",
          options: ["Respiration", "Photosynthesis", "Digestion", "Circulation"],
          correctIndex: 1,
          explanation: "Photosynthesis is the process plants use to convert sunlight into food.",
        },
      ],
      chemistry: [
        {
          question: "What is the chemical symbol for water?",
          options: ["H2O", "CO2", "NaCl", "O2"],
          correctIndex: 0,
          explanation: "H2O represents two hydrogen atoms and one oxygen atom.",
        },
      ],
      physics: [
        {
          question: "What is the force that pulls objects toward Earth?",
          options: ["Magnetism", "Gravity", "Friction", "Electricity"],
          correctIndex: 1,
          explanation: "Gravity is the force that pulls objects toward the center of Earth.",
        },
      ],
    };

    return questions[topic] || [];
  }
}

// Interactive worksheet manager
export class InteractiveWorksheetManager {
  private static readonly STORAGE_KEY = "astra-academy-interactive-worksheets";

  // Create interactive worksheet
  static createInteractiveWorksheet(
    title: string,
    subject: string,
    gradeLevel: string,
    difficulty: string,
    elementTypes: string[],
    count: number
  ): InteractiveWorksheet {
    const elements: AllInteractiveElements[] = [];

    // Generate elements based on types
    elementTypes.forEach((type) => {
      switch (type) {
        case "drag-drop":
          if (subject === "math") {
            elements.push(
              ...InteractiveElementGenerator.generateDragDropMath(
                "addition",
                difficulty,
                Math.ceil(count / 3)
              )
            );
          }
          break;
        case "fill-blank":
          if (subject === "language_arts") {
            const words = ["cat", "dog", "house", "tree", "water", "sun", "moon", "star"];
            elements.push(
              ...InteractiveElementGenerator.generateFillBlankVocabulary(
                words,
                Math.ceil(count / 3)
              )
            );
          }
          break;
        case "multiple-choice":
          if (subject === "science") {
            elements.push(
              ...InteractiveElementGenerator.generateMultipleChoiceScience(
                "biology",
                Math.ceil(count / 3)
              )
            );
          }
          break;
      }
    });

    const worksheet: InteractiveWorksheet = {
      id: `interactive-${Date.now()}`,
      title,
      elements,
      settings: {
        autoGrade: true,
        showHints: true,
        allowRetry: true,
        showProgress: true,
      },
      metadata: {
        subject,
        gradeLevel,
        difficulty,
        estimatedTime: `${elements.length * 2} minutes`,
        skills: ["problem solving", "critical thinking", "interactive learning"],
      },
    };

    return worksheet;
  }

  // Save interactive worksheet
  static saveInteractiveWorksheet(worksheet: InteractiveWorksheet): void {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem(this.STORAGE_KEY);
    const worksheets = stored ? JSON.parse(stored) : [];

    const existingIndex = worksheets.findIndex((w: InteractiveWorksheet) => w.id === worksheet.id);
    if (existingIndex >= 0) {
      worksheets[existingIndex] = worksheet;
    } else {
      worksheets.push(worksheet);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(worksheets));
  }

  // Load interactive worksheets
  static loadInteractiveWorksheets(): InteractiveWorksheet[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Get interactive worksheet by ID
  static getInteractiveWorksheet(id: string): InteractiveWorksheet | null {
    const worksheets = this.loadInteractiveWorksheets();
    return worksheets.find((w: InteractiveWorksheet) => w.id === id) || null;
  }

  // Delete interactive worksheet
  static deleteInteractiveWorksheet(id: string): void {
    if (typeof window === "undefined") return;

    const worksheets = this.loadInteractiveWorksheets();
    const filtered = worksheets.filter((w: InteractiveWorksheet) => w.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}
