export interface WorksheetTemplate {
  id: string;
  name: string;
  subject: string;
  gradeLevel: string;
  difficulty: string;
  preview: string;
  description: string;
  tags: string[];
  createdBy: "system" | "community" | "premium";
  rating: number;
  downloads: number;
  category: string;
  estimatedTime: string;
  skills: string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  templates: WorksheetTemplate[];
}

// Pre-made system templates
export const SYSTEM_TEMPLATES: WorksheetTemplate[] = [
  // Math Templates
  {
    id: "math-basic-addition",
    name: "Basic Addition Practice",
    subject: "math",
    gradeLevel: "K-2",
    difficulty: "easy",
    preview: "2 + 3 = ___, 5 + 1 = ___, 4 + 2 = ___",
    description: "Simple addition problems for beginners",
    tags: ["addition", "basic", "numbers", "beginner"],
    createdBy: "system",
    rating: 4.8,
    downloads: 1250,
    category: "math",
    estimatedTime: "10-15 minutes",
    skills: ["number recognition", "basic addition", "counting"],
  },
  {
    id: "math-multiplication-table",
    name: "Multiplication Table Practice",
    subject: "math",
    gradeLevel: "3-4",
    difficulty: "medium",
    preview: "3 × 4 = ___, 7 × 8 = ___, 9 × 6 = ___",
    description: "Multiplication table practice with mixed problems",
    tags: ["multiplication", "tables", "times tables"],
    createdBy: "system",
    rating: 4.6,
    downloads: 980,
    category: "math",
    estimatedTime: "15-20 minutes",
    skills: ["multiplication", "mental math", "number patterns"],
  },
  {
    id: "math-word-problems",
    name: "Math Word Problems",
    subject: "math",
    gradeLevel: "3-4",
    difficulty: "medium",
    preview: "Sarah has 12 apples. She gives away 4. How many does she have left?",
    description: "Real-world math problems to develop problem-solving skills",
    tags: ["word problems", "problem solving", "real world"],
    createdBy: "system",
    rating: 4.7,
    downloads: 1150,
    category: "math",
    estimatedTime: "20-25 minutes",
    skills: ["problem solving", "reading comprehension", "math application"],
  },

  // Language Arts Templates
  {
    id: "la-spelling-practice",
    name: "Spelling Practice Sheet",
    subject: "language_arts",
    gradeLevel: "1-2",
    difficulty: "easy",
    preview: "Write each word 3 times: cat, dog, hat, run",
    description: "Traditional spelling practice with repetition",
    tags: ["spelling", "handwriting", "vocabulary"],
    createdBy: "system",
    rating: 4.5,
    downloads: 890,
    category: "language_arts",
    estimatedTime: "15-20 minutes",
    skills: ["spelling", "handwriting", "letter formation"],
  },
  {
    id: "la-reading-comprehension",
    name: "Reading Comprehension",
    subject: "language_arts",
    gradeLevel: "3-4",
    difficulty: "medium",
    preview: "Read the passage and answer the questions below...",
    description: "Short passages with comprehension questions",
    tags: ["reading", "comprehension", "critical thinking"],
    createdBy: "system",
    rating: 4.8,
    downloads: 1350,
    category: "language_arts",
    estimatedTime: "25-30 minutes",
    skills: ["reading comprehension", "inference", "vocabulary"],
  },
  {
    id: "la-creative-writing",
    name: "Creative Writing Prompts",
    subject: "language_arts",
    gradeLevel: "3-4",
    difficulty: "medium",
    preview: "Write a story about a magical forest...",
    description: "Inspiring creative writing prompts with guidelines",
    tags: ["creative writing", "storytelling", "imagination"],
    createdBy: "system",
    rating: 4.6,
    downloads: 720,
    category: "language_arts",
    estimatedTime: "30-45 minutes",
    skills: ["creative writing", "storytelling", "imagination"],
  },

  // Science Templates
  {
    id: "science-observation",
    name: "Science Observation Sheet",
    subject: "science",
    gradeLevel: "K-2",
    difficulty: "easy",
    preview: "Draw what you see. What do you notice? What questions do you have?",
    description: "Simple observation and recording template for young scientists",
    tags: ["observation", "recording", "inquiry"],
    createdBy: "system",
    rating: 4.4,
    downloads: 650,
    category: "science",
    estimatedTime: "20-25 minutes",
    skills: ["observation", "recording", "scientific thinking"],
  },
  {
    id: "science-experiment",
    name: "Science Experiment Log",
    subject: "science",
    gradeLevel: "3-4",
    difficulty: "medium",
    preview: "Hypothesis: I think... Materials: ... Procedure: ... Results: ...",
    description: "Structured experiment recording template",
    tags: ["experiment", "hypothesis", "scientific method"],
    createdBy: "system",
    rating: 4.7,
    downloads: 920,
    category: "science",
    estimatedTime: "30-40 minutes",
    skills: ["scientific method", "hypothesis", "data recording"],
  },
];

// Template categories
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "math",
    name: "Mathematics",
    icon: "📐",
    description: "Math worksheets and practice sheets",
    templates: SYSTEM_TEMPLATES.filter((t) => t.category === "math"),
  },
  {
    id: "language_arts",
    name: "Language Arts",
    icon: "📖",
    description: "Reading, writing, and language skills",
    templates: SYSTEM_TEMPLATES.filter((t) => t.category === "language_arts"),
  },
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    description: "Science experiments and observations",
    templates: SYSTEM_TEMPLATES.filter((t) => t.category === "science"),
  },
  {
    id: "popular",
    name: "Popular",
    icon: "⭐",
    description: "Most downloaded templates",
    templates: SYSTEM_TEMPLATES.sort((a, b) => b.downloads - a.downloads).slice(0, 6),
  },
  {
    id: "recent",
    name: "Recently Added",
    icon: "🆕",
    description: "Latest template additions",
    templates: SYSTEM_TEMPLATES.slice(-6).reverse(),
  },
];

// Template storage and management
export class TemplateManager {
  private static readonly STORAGE_KEY = "astra-academy-templates";
  private static readonly FAVORITES_KEY = "astra-academy-favorite-templates";

  // Get all available templates
  static getAllTemplates(): WorksheetTemplate[] {
    return SYSTEM_TEMPLATES;
  }

  // Get templates by category
  static getTemplatesByCategory(categoryId: string): WorksheetTemplate[] {
    const category = TEMPLATE_CATEGORIES.find((c) => c.id === categoryId);
    return category?.templates || [];
  }

  // Search templates
  static searchTemplates(query: string): WorksheetTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return SYSTEM_TEMPLATES.filter(
      (template) =>
        template.name.toLowerCase().includes(lowercaseQuery) ||
        template.description.toLowerCase().includes(lowercaseQuery) ||
        template.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)) ||
        template.skills.some((skill) => skill.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get template by ID
  static getTemplateById(id: string): WorksheetTemplate | null {
    return SYSTEM_TEMPLATES.find((template) => template.id === id) || null;
  }

  // Get user's favorite templates
  static getFavoriteTemplates(): string[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(this.FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Add template to favorites
  static addToFavorites(templateId: string): void {
    if (typeof window === "undefined") return;
    const favorites = this.getFavoriteTemplates();
    if (!favorites.includes(templateId)) {
      favorites.push(templateId);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  // Remove template from favorites
  static removeFromFavorites(templateId: string): void {
    if (typeof window === "undefined") return;
    const favorites = this.getFavoriteTemplates();
    const updatedFavorites = favorites.filter((id) => id !== templateId);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(updatedFavorites));
  }

  // Check if template is favorited
  static isFavorited(templateId: string): boolean {
    return this.getFavoriteTemplates().includes(templateId);
  }

  // Get templates by grade level
  static getTemplatesByGradeLevel(gradeLevel: string): WorksheetTemplate[] {
    return SYSTEM_TEMPLATES.filter(
      (template) => template.gradeLevel.includes(gradeLevel) || template.gradeLevel === gradeLevel
    );
  }

  // Get templates by difficulty
  static getTemplatesByDifficulty(difficulty: string): WorksheetTemplate[] {
    return SYSTEM_TEMPLATES.filter((template) => template.difficulty === difficulty);
  }

  // Get recommended templates based on user preferences
  static getRecommendedTemplates(preferences: {
    subject?: string;
    gradeLevel?: string;
    difficulty?: string;
    limit?: number;
  }): WorksheetTemplate[] {
    let templates = SYSTEM_TEMPLATES;

    if (preferences.subject) {
      templates = templates.filter((t) => t.subject === preferences.subject);
    }

    if (preferences.gradeLevel) {
      templates = templates.filter((t) => t.gradeLevel.includes(preferences.gradeLevel!));
    }

    if (preferences.difficulty) {
      templates = templates.filter((t) => t.difficulty === preferences.difficulty);
    }

    // Sort by rating and downloads
    templates.sort((a, b) => {
      const scoreA = a.rating * 0.7 + (a.downloads / 1000) * 0.3;
      const scoreB = b.rating * 0.7 + (b.downloads / 1000) * 0.3;
      return scoreB - scoreA;
    });

    return preferences.limit ? templates.slice(0, preferences.limit) : templates;
  }

  // Increment download count (for analytics)
  static incrementDownloads(templateId: string): void {
    // In a real app, this would update the database
    console.log(`Template ${templateId} downloaded`);
  }

  // Rate a template
  static rateTemplate(templateId: string, rating: number): void {
    // In a real app, this would update the database
    console.log(`Template ${templateId} rated ${rating} stars`);
  }
}
