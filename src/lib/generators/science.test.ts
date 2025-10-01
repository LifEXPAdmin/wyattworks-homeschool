import { describe, it, expect } from "vitest";
import {
  generateBiologyProblems,
  generateChemistryProblems,
  generatePhysicsProblems,
  generateEarthScienceProblems,
  generateScienceProblems,
  type ScienceSubject,
  type GradeLevel,
} from "./science";

describe("Science Problem Generators", () => {
  describe("generateBiologyProblems", () => {
    it("should generate the correct number of problems", () => {
      const problems = generateBiologyProblems(5, "3-4");
      expect(problems).toHaveLength(5);
    });

    it("should generate problems with correct structure", () => {
      const problems = generateBiologyProblems(3, "5-6");
      problems.forEach((problem) => {
        expect(problem).toHaveProperty("type");
        expect(problem).toHaveProperty("question");
        expect(problem).toHaveProperty("answer");
        expect(typeof problem.question).toBe("string");
        expect(typeof problem.answer).toBe("string");
        expect(problem.question.length).toBeGreaterThan(0);
        expect(problem.answer.length).toBeGreaterThan(0);
      });
    });

    it("should generate different problems with different seeds", () => {
      const problems1 = generateBiologyProblems(5, "7-8", ["classification"], 123);
      const problems2 = generateBiologyProblems(5, "7-8", ["classification"], 456);

      expect(problems1).not.toEqual(problems2);
    });

    it("should generate same problems with same seed", () => {
      const problems1 = generateBiologyProblems(5, "9-12", ["ecosystem"], 789);
      const problems2 = generateBiologyProblems(5, "9-12", ["ecosystem"], 789);

      expect(problems1).toEqual(problems2);
    });

    it("should work for all grade levels", () => {
      const grades: GradeLevel[] = ["K", "1-2", "3-4", "5-6", "7-8", "9-12"];

      grades.forEach((grade) => {
        const problems = generateBiologyProblems(2, grade);
        expect(problems).toHaveLength(2);
        problems.forEach((problem) => {
          expect(problem.type).toBeOneOf([
            "classification",
            "life-cycle",
            "ecosystem",
            "anatomy",
            "genetics",
          ]);
        });
      });
    });

    it("should filter by problem types", () => {
      const problems = generateBiologyProblems(10, "5-6", ["classification"]);
      problems.forEach((problem) => {
        expect(problem.type).toBe("classification");
      });
    });
  });

  describe("generateChemistryProblems", () => {
    it("should generate the correct number of problems", () => {
      const problems = generateChemistryProblems(4, "3-4");
      expect(problems).toHaveLength(4);
    });

    it("should generate problems with correct structure", () => {
      const problems = generateChemistryProblems(3, "7-8");
      problems.forEach((problem) => {
        expect(problem).toHaveProperty("type");
        expect(problem).toHaveProperty("question");
        expect(problem).toHaveProperty("answer");
        expect(typeof problem.question).toBe("string");
        expect(typeof problem.answer).toBe("string");
        expect(problem.question.length).toBeGreaterThan(0);
        expect(problem.answer.length).toBeGreaterThan(0);
      });
    });

    it("should work for all grade levels", () => {
      const grades: GradeLevel[] = ["K", "1-2", "3-4", "5-6", "7-8", "9-12"];

      grades.forEach((grade) => {
        const problems = generateChemistryProblems(2, grade);
        expect(problems).toHaveLength(2);
        problems.forEach((problem) => {
          expect(problem.type).toBeOneOf([
            "elements",
            "compounds",
            "reactions",
            "periodic-table",
            "molecules",
          ]);
        });
      });
    });

    it("should generate different problems with different seeds", () => {
      const problems1 = generateChemistryProblems(5, "5-6", ["elements"], 111);
      const problems2 = generateChemistryProblems(5, "5-6", ["elements"], 222);

      expect(problems1).not.toEqual(problems2);
    });
  });

  describe("generatePhysicsProblems", () => {
    it("should generate the correct number of problems", () => {
      const problems = generatePhysicsProblems(6, "1-2");
      expect(problems).toHaveLength(6);
    });

    it("should generate problems with correct structure", () => {
      const problems = generatePhysicsProblems(3, "9-12");
      problems.forEach((problem) => {
        expect(problem).toHaveProperty("type");
        expect(problem).toHaveProperty("question");
        expect(problem).toHaveProperty("answer");
        expect(typeof problem.question).toBe("string");
        expect(typeof problem.answer).toBe("string");
        expect(problem.question.length).toBeGreaterThan(0);
        expect(problem.answer.length).toBeGreaterThan(0);
      });
    });

    it("should work for all grade levels", () => {
      const grades: GradeLevel[] = ["K", "1-2", "3-4", "5-6", "7-8", "9-12"];

      grades.forEach((grade) => {
        const problems = generatePhysicsProblems(2, grade);
        expect(problems).toHaveLength(2);
        problems.forEach((problem) => {
          expect(problem.type).toBeOneOf(["motion", "forces", "energy", "waves", "electricity"]);
        });
      });
    });

    it("should generate different problems with different seeds", () => {
      const problems1 = generatePhysicsProblems(5, "7-8", ["motion"], 333);
      const problems2 = generatePhysicsProblems(5, "7-8", ["motion"], 444);

      expect(problems1).not.toEqual(problems2);
    });
  });

  describe("generateEarthScienceProblems", () => {
    it("should generate the correct number of problems", () => {
      const problems = generateEarthScienceProblems(7, "K");
      expect(problems).toHaveLength(7);
    });

    it("should generate problems with correct structure", () => {
      const problems = generateEarthScienceProblems(3, "3-4");
      problems.forEach((problem) => {
        expect(problem).toHaveProperty("type");
        expect(problem).toHaveProperty("question");
        expect(problem).toHaveProperty("answer");
        expect(typeof problem.question).toBe("string");
        expect(typeof problem.answer).toBe("string");
        expect(problem.question.length).toBeGreaterThan(0);
        expect(problem.answer.length).toBeGreaterThan(0);
      });
    });

    it("should work for all grade levels", () => {
      const grades: GradeLevel[] = ["K", "1-2", "3-4", "5-6", "7-8", "9-12"];

      grades.forEach((grade) => {
        const problems = generateEarthScienceProblems(2, grade);
        expect(problems).toHaveLength(2);
        problems.forEach((problem) => {
          expect(problem.type).toBeOneOf(["weather", "geology", "astronomy", "oceans", "climate"]);
        });
      });
    });

    it("should generate different problems with different seeds", () => {
      const problems1 = generateEarthScienceProblems(5, "5-6", ["weather"], 555);
      const problems2 = generateEarthScienceProblems(5, "5-6", ["weather"], 666);

      expect(problems1).not.toEqual(problems2);
    });
  });

  describe("generateScienceProblems", () => {
    it("should generate biology problems", () => {
      const problems = generateScienceProblems("biology", 3, "3-4");
      expect(problems).toHaveLength(3);
      problems.forEach((problem) => {
        expect(problem.type).toBeOneOf([
          "classification",
          "life-cycle",
          "ecosystem",
          "anatomy",
          "genetics",
        ]);
      });
    });

    it("should generate chemistry problems", () => {
      const problems = generateScienceProblems("chemistry", 3, "5-6");
      expect(problems).toHaveLength(3);
      problems.forEach((problem) => {
        expect(problem.type).toBeOneOf([
          "elements",
          "compounds",
          "reactions",
          "periodic-table",
          "molecules",
        ]);
      });
    });

    it("should generate physics problems", () => {
      const problems = generateScienceProblems("physics", 3, "7-8");
      expect(problems).toHaveLength(3);
      problems.forEach((problem) => {
        expect(problem.type).toBeOneOf(["motion", "forces", "energy", "waves", "electricity"]);
      });
    });

    it("should generate earth science problems", () => {
      const problems = generateScienceProblems("earth-science", 3, "9-12");
      expect(problems).toHaveLength(3);
      problems.forEach((problem) => {
        expect(problem.type).toBeOneOf(["weather", "geology", "astronomy", "oceans", "climate"]);
      });
    });

    it("should return empty array for invalid subject", () => {
      const problems = generateScienceProblems("invalid" as ScienceSubject, 3, "3-4");
      expect(problems).toEqual([]);
    });

    it("should generate same problems with same seed", () => {
      const problems1 = generateScienceProblems("biology", 5, "5-6", 123);
      const problems2 = generateScienceProblems("biology", 5, "5-6", 123);

      expect(problems1).toEqual(problems2);
    });

    it("should generate different problems with different seeds", () => {
      const problems1 = generateScienceProblems("chemistry", 5, "7-8", 111);
      const problems2 = generateScienceProblems("chemistry", 5, "7-8", 222);

      expect(problems1).not.toEqual(problems2);
    });
  });

  describe("Content Quality", () => {
    it("should have appropriate content for kindergarten", () => {
      const problems = generateBiologyProblems(5, "K");
      problems.forEach((problem) => {
        expect(problem.question).toBeTruthy();
        expect(problem.answer).toBeTruthy();
        // Kindergarten questions should be simple and clear
        expect(problem.question.length).toBeLessThan(100);
        expect(problem.answer.length).toBeLessThan(50);
      });
    });

    it("should have appropriate content for high school", () => {
      const problems = generateBiologyProblems(5, "9-12");
      problems.forEach((problem) => {
        expect(problem.question).toBeTruthy();
        expect(problem.answer).toBeTruthy();
        // High school questions can be more complex
        expect(problem.question.length).toBeGreaterThan(10);
        expect(problem.answer.length).toBeGreaterThan(5);
      });
    });

    it("should not generate duplicate problems in single call", () => {
      const problems = generateBiologyProblems(20, "3-4");
      const questions = problems.map((p) => p.question);
      const uniqueQuestions = new Set(questions);

      // Allow some duplicates due to limited content pool, but not too many
      expect(uniqueQuestions.size).toBeGreaterThan(questions.length * 0.7);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero count", () => {
      const problems = generateBiologyProblems(0, "3-4");
      expect(problems).toEqual([]);
    });

    it("should handle large count", () => {
      const problems = generateBiologyProblems(100, "5-6");
      expect(problems).toHaveLength(100);
    });

    it("should handle empty types array", () => {
      const problems = generateBiologyProblems(5, "3-4", []);
      expect(problems).toEqual([]);
    });

    it("should handle invalid types", () => {
      const problems = generateBiologyProblems(5, "3-4", ["invalid" as never]);
      expect(problems).toEqual([]);
    });
  });
});
