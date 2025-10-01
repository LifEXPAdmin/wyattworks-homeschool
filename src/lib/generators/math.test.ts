/**
 * Unit Tests for Math Problem Generators
 */

import { describe, it, expect } from "vitest";
import {
  SeededRandom,
  generateAddition,
  generateSubtraction,
  generateMultiplication,
  generateDivision,
  generateFractions,
  hasDuplicates,
  verifyConstraints,
  type MathProblem,
} from "./math";

describe("SeededRandom", () => {
  it("should generate consistent random numbers with same seed", () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(12345);

    const nums1 = Array.from({ length: 10 }, () => rng1.next());
    const nums2 = Array.from({ length: 10 }, () => rng2.next());

    expect(nums1).toEqual(nums2);
  });

  it("should generate different numbers with different seeds", () => {
    const rng1 = new SeededRandom(12345);
    const rng2 = new SeededRandom(54321);

    const nums1 = Array.from({ length: 10 }, () => rng1.next());
    const nums2 = Array.from({ length: 10 }, () => rng2.next());

    expect(nums1).not.toEqual(nums2);
  });

  it("should generate numbers between 0 and 1", () => {
    const rng = new SeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const num = rng.next();
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThan(1);
    }
  });

  it("should generate integers in specified range", () => {
    const rng = new SeededRandom(12345);

    for (let i = 0; i < 100; i++) {
      const num = rng.nextInt(1, 20);
      expect(num).toBeGreaterThanOrEqual(1);
      expect(num).toBeLessThanOrEqual(20);
      expect(Number.isInteger(num)).toBe(true);
    }
  });

  it("should reset seed correctly", () => {
    const rng = new SeededRandom(12345);
    const nums1 = Array.from({ length: 5 }, () => rng.next());

    rng.reset(12345);
    const nums2 = Array.from({ length: 5 }, () => rng.next());

    expect(nums1).toEqual(nums2);
  });

  it("should return current seed", () => {
    const seed = 12345;
    const rng = new SeededRandom(seed);

    expect(rng.getSeed()).toBe(seed);
  });
});

describe("generateAddition", () => {
  it("should generate the correct number of problems", () => {
    const problems = generateAddition({ count: 15, seed: 12345 });
    expect(problems).toHaveLength(15);
  });

  it("should generate problems within specified range", () => {
    const problems = generateAddition({
      count: 20,
      minValue: 5,
      maxValue: 15,
      seed: 12345,
    });

    expect(verifyConstraints(problems, 5, 15)).toBe(true);
  });

  it("should generate problems with correct structure", () => {
    const problems = generateAddition({ count: 1, seed: 12345 });
    const problem = problems[0];

    expect(problem).toHaveProperty("problem");
    expect(problem).toHaveProperty("answer");
    expect(problem).toHaveProperty("operands");
    expect(problem).toHaveProperty("operator");
    expect(problem.operator).toBe("+");
  });

  it("should calculate correct answers", () => {
    const problems = generateAddition({ count: 20, seed: 12345 });

    problems.forEach((problem) => {
      const calculatedAnswer = problem.operands.reduce((sum, n) => sum + n, 0);
      expect(problem.answer).toBe(calculatedAnswer);
    });
  });

  it("should not have duplicate problems", () => {
    const problems = generateAddition({ count: 50, seed: 12345 });
    expect(hasDuplicates(problems)).toBe(false);
  });

  it("should support multiple operands", () => {
    const problems = generateAddition({
      count: 10,
      operandCount: 3,
      seed: 12345,
    });

    problems.forEach((problem) => {
      expect(problem.operands).toHaveLength(3);
      const parts = problem.problem.split(" + ");
      expect(parts).toHaveLength(3);
    });
  });

  it("should be deterministic with same seed", () => {
    const problems1 = generateAddition({ count: 10, seed: 12345 });
    const problems2 = generateAddition({ count: 10, seed: 12345 });

    expect(problems1).toEqual(problems2);
  });

  it("should handle large problem counts", () => {
    const problems = generateAddition({ count: 100, minValue: 1, maxValue: 50, seed: 12345 });
    expect(problems).toHaveLength(100);
    expect(hasDuplicates(problems)).toBe(false);
  });
});

describe("generateSubtraction", () => {
  it("should generate the correct number of problems", () => {
    const problems = generateSubtraction({ count: 15, seed: 12345 });
    expect(problems).toHaveLength(15);
  });

  it("should generate problems within specified range", () => {
    const problems = generateSubtraction({
      count: 20,
      minValue: 5,
      maxValue: 25,
      seed: 12345,
    });

    expect(verifyConstraints(problems, 5, 25)).toBe(true);
  });

  it("should not generate negative results when disallowed", () => {
    const problems = generateSubtraction({
      count: 50,
      allowNegativeResults: false,
      seed: 12345,
    });

    problems.forEach((problem) => {
      expect(problem.answer).toBeGreaterThanOrEqual(0);
    });
  });

  it("should allow negative results when enabled", () => {
    const problems = generateSubtraction({
      count: 100,
      allowNegativeResults: true,
      minValue: 1,
      maxValue: 20,
      seed: 12345,
    });

    const hasNegative = problems.some((p) => p.answer < 0);
    expect(hasNegative).toBe(true);
  });

  it("should calculate correct answers", () => {
    const problems = generateSubtraction({ count: 20, seed: 12345 });

    problems.forEach((problem) => {
      const [a, b] = problem.operands;
      expect(problem.answer).toBe(a - b);
    });
  });

  it("should not have duplicate problems", () => {
    const problems = generateSubtraction({ count: 50, seed: 12345 });
    expect(hasDuplicates(problems)).toBe(false);
  });

  it("should be deterministic with same seed", () => {
    const problems1 = generateSubtraction({ count: 10, seed: 12345 });
    const problems2 = generateSubtraction({ count: 10, seed: 12345 });

    expect(problems1).toEqual(problems2);
  });
});

describe("generateMultiplication", () => {
  it("should generate the correct number of problems", () => {
    const problems = generateMultiplication({ count: 15, seed: 12345 });
    expect(problems).toHaveLength(15);
  });

  it("should generate problems within specified range", () => {
    const problems = generateMultiplication({
      count: 20,
      minValue: 2,
      maxValue: 10,
      seed: 12345,
    });

    expect(verifyConstraints(problems, 2, 10)).toBe(true);
  });

  it("should calculate correct answers", () => {
    const problems = generateMultiplication({ count: 20, seed: 12345 });

    problems.forEach((problem) => {
      const [a, b] = problem.operands;
      expect(problem.answer).toBe(a * b);
    });
  });

  it("should respect maxProduct constraint", () => {
    const problems = generateMultiplication({
      count: 50,
      minValue: 2,
      maxValue: 12,
      maxProduct: 50,
      seed: 12345,
    });

    problems.forEach((problem) => {
      expect(problem.answer).toBeLessThanOrEqual(50);
    });
  });

  it("should not have duplicate problems", () => {
    const problems = generateMultiplication({ count: 50, seed: 12345 });
    expect(hasDuplicates(problems)).toBe(false);
  });

  it("should use × operator", () => {
    const problems = generateMultiplication({ count: 10, seed: 12345 });

    problems.forEach((problem) => {
      expect(problem.operator).toBe("×");
      expect(problem.problem).toContain("×");
    });
  });

  it("should be deterministic with same seed", () => {
    const problems1 = generateMultiplication({ count: 10, seed: 12345 });
    const problems2 = generateMultiplication({ count: 10, seed: 12345 });

    expect(problems1).toEqual(problems2);
  });
});

describe("generateDivision", () => {
  it("should generate the correct number of problems", () => {
    const problems = generateDivision({ count: 15, seed: 12345 });
    expect(problems).toHaveLength(15);
  });

  it("should generate whole number answers when required", () => {
    const problems = generateDivision({
      count: 50,
      requireWholeNumbers: true,
      seed: 12345,
    });

    problems.forEach((problem) => {
      expect(Number.isInteger(problem.answer)).toBe(true);
    });
  });

  it("should calculate correct answers", () => {
    const problems = generateDivision({ count: 20, seed: 12345 });

    problems.forEach((problem) => {
      const [dividend, divisor] = problem.operands;
      expect(problem.answer).toBe(dividend / divisor);
    });
  });

  it("should verify division operation", () => {
    const problems = generateDivision({
      count: 20,
      requireWholeNumbers: true,
      seed: 12345,
    });

    problems.forEach((problem) => {
      const [dividend, divisor] = problem.operands;
      const quotient = problem.answer;
      expect(divisor * quotient).toBe(dividend);
    });
  });

  it("should not have duplicate problems", () => {
    const problems = generateDivision({ count: 50, seed: 12345 });
    expect(hasDuplicates(problems)).toBe(false);
  });

  it("should use ÷ operator", () => {
    const problems = generateDivision({ count: 10, seed: 12345 });

    problems.forEach((problem) => {
      expect(problem.operator).toBe("÷");
      expect(problem.problem).toContain("÷");
    });
  });

  it("should be deterministic with same seed", () => {
    const problems1 = generateDivision({ count: 10, seed: 12345 });
    const problems2 = generateDivision({ count: 10, seed: 12345 });

    expect(problems1).toEqual(problems2);
  });

  it("should generate problems within specified range", () => {
    const problems = generateDivision({
      count: 20,
      minValue: 2,
      maxValue: 10,
      seed: 12345,
    });

    // Divisors and quotients should be in range
    problems.forEach((problem) => {
      const [, divisor] = problem.operands;
      const quotient = problem.answer;
      expect(divisor).toBeGreaterThanOrEqual(2);
      expect(divisor).toBeLessThanOrEqual(10);
      expect(quotient).toBeGreaterThanOrEqual(2);
      expect(quotient).toBeLessThanOrEqual(10);
    });
  });
});

describe("generateFractions", () => {
  it("should generate the correct number of problems", () => {
    const problems = generateFractions({ count: 15, seed: 12345 });
    expect(problems).toHaveLength(15);
  });

  it("should generate fraction addition problems", () => {
    const problems = generateFractions({
      count: 10,
      operation: "add",
      seed: 12345,
    });

    problems.forEach((problem) => {
      expect(problem.problem).toContain("+");
      expect(problem.operator).toBe("+");
    });
  });

  it("should generate fraction subtraction problems", () => {
    const problems = generateFractions({
      count: 10,
      operation: "subtract",
      seed: 12345,
    });

    problems.forEach((problem) => {
      expect(problem.problem).toContain("-");
      expect(problem.operator).toBe("-");
    });
  });

  it("should generate fraction multiplication problems", () => {
    const problems = generateFractions({
      count: 10,
      operation: "multiply",
      seed: 12345,
    });

    problems.forEach((problem) => {
      expect(problem.problem).toContain("×");
      expect(problem.operator).toBe("×");
    });
  });

  it("should generate fraction division problems", () => {
    const problems = generateFractions({
      count: 10,
      operation: "divide",
      seed: 12345,
    });

    problems.forEach((problem) => {
      expect(problem.problem).toContain("÷");
      expect(problem.operator).toBe("÷");
    });
  });

  it("should have correct answer structure", () => {
    const problems = generateFractions({ count: 10, seed: 12345 });

    problems.forEach((problem) => {
      expect(problem.answer).toHaveProperty("numerator");
      expect(problem.answer).toHaveProperty("denominator");
      expect(problem).toHaveProperty("decimal");
      expect(typeof problem.decimal).toBe("number");
    });
  });

  it("should calculate correct decimal values", () => {
    const problems = generateFractions({ count: 20, seed: 12345 });

    problems.forEach((problem) => {
      const expectedDecimal = problem.answer.numerator / problem.answer.denominator;
      expect(problem.decimal).toBeCloseTo(expectedDecimal, 10);
    });
  });

  it("should simplify fractions when requested", () => {
    const problems = generateFractions({
      count: 50,
      simplify: true,
      seed: 12345,
    });

    // Check that at least some fractions are simplified
    // (GCD > 1 for at least some answers)
    const allUnsimplified = problems.every((p) => {
      const { numerator, denominator } = p.answer;
      // A fraction is simplified if gcd(num, den) === 1
      return gcd(Math.abs(numerator), Math.abs(denominator)) === 1;
    });

    expect(allUnsimplified).toBe(true);
  });

  it("should respect maxDenominator constraint", () => {
    const maxDen = 8;
    const problems = generateFractions({
      count: 50,
      maxDenominator: maxDen,
      seed: 12345,
    });

    problems.forEach((problem) => {
      const [, den1, , den2] = problem.operands;
      expect(den1).toBeLessThanOrEqual(maxDen);
      expect(den2).toBeLessThanOrEqual(maxDen);
    });
  });

  it("should not have duplicate problems", () => {
    const problems = generateFractions({ count: 50, seed: 12345 });
    expect(hasDuplicates(problems)).toBe(false);
  });

  it("should be deterministic with same seed", () => {
    const problems1 = generateFractions({ count: 10, seed: 12345 });
    const problems2 = generateFractions({ count: 10, seed: 12345 });

    expect(problems1).toEqual(problems2);
  });

  it("should verify addition calculation", () => {
    const problems = generateFractions({
      count: 10,
      operation: "add",
      simplify: false,
      seed: 12345,
    });

    problems.forEach((problem) => {
      const [num1, den1, num2, den2] = problem.operands;
      const expectedNum = num1 * den2 + num2 * den1;
      const expectedDen = den1 * den2;
      const expectedDecimal = expectedNum / expectedDen;

      expect(problem.decimal).toBeCloseTo(expectedDecimal, 10);
    });
  });

  it("should verify multiplication calculation", () => {
    const problems = generateFractions({
      count: 10,
      operation: "multiply",
      simplify: false,
      seed: 12345,
    });

    problems.forEach((problem) => {
      const [num1, den1, num2, den2] = problem.operands;
      const expectedNum = num1 * num2;
      const expectedDen = den1 * den2;
      const expectedDecimal = expectedNum / expectedDen;

      expect(problem.decimal).toBeCloseTo(expectedDecimal, 10);
    });
  });
});

describe("utility functions", () => {
  describe("hasDuplicates", () => {
    it("should detect duplicates", () => {
      const problems: MathProblem[] = [
        { problem: "1 + 2", answer: 3, operands: [1, 2], operator: "+" },
        { problem: "3 + 4", answer: 7, operands: [3, 4], operator: "+" },
        { problem: "1 + 2", answer: 3, operands: [1, 2], operator: "+" },
      ];

      expect(hasDuplicates(problems)).toBe(true);
    });

    it("should return false for unique problems", () => {
      const problems: MathProblem[] = [
        { problem: "1 + 2", answer: 3, operands: [1, 2], operator: "+" },
        { problem: "3 + 4", answer: 7, operands: [3, 4], operator: "+" },
        { problem: "5 + 6", answer: 11, operands: [5, 6], operator: "+" },
      ];

      expect(hasDuplicates(problems)).toBe(false);
    });
  });

  describe("verifyConstraints", () => {
    it("should verify all operands are within range", () => {
      const problems: MathProblem[] = [
        { problem: "5 + 10", answer: 15, operands: [5, 10], operator: "+" },
        { problem: "3 + 7", answer: 10, operands: [3, 7], operator: "+" },
      ];

      expect(verifyConstraints(problems, 1, 10)).toBe(true);
      expect(verifyConstraints(problems, 1, 5)).toBe(false);
    });
  });
});

describe("integration tests", () => {
  it("should generate mixed problem sets", () => {
    const seed = 12345;
    const count = 10;

    const addition = generateAddition({ count, seed });
    const subtraction = generateSubtraction({ count, seed });
    const multiplication = generateMultiplication({ count, seed });
    const division = generateDivision({ count, seed });
    const fractions = generateFractions({ count, seed });

    expect(addition).toHaveLength(count);
    expect(subtraction).toHaveLength(count);
    expect(multiplication).toHaveLength(count);
    expect(division).toHaveLength(count);
    expect(fractions).toHaveLength(count);
  });

  it("should maintain determinism across all generators", () => {
    const seed = 99999;
    const count = 5;

    const run1 = {
      addition: generateAddition({ count, seed }),
      subtraction: generateSubtraction({ count, seed }),
      multiplication: generateMultiplication({ count, seed }),
      division: generateDivision({ count, seed }),
      fractions: generateFractions({ count, seed }),
    };

    const run2 = {
      addition: generateAddition({ count, seed }),
      subtraction: generateSubtraction({ count, seed }),
      multiplication: generateMultiplication({ count, seed }),
      division: generateDivision({ count, seed }),
      fractions: generateFractions({ count, seed }),
    };

    expect(run1.addition).toEqual(run2.addition);
    expect(run1.subtraction).toEqual(run2.subtraction);
    expect(run1.multiplication).toEqual(run2.multiplication);
    expect(run1.division).toEqual(run2.division);
    expect(run1.fractions).toEqual(run2.fractions);
  });
});

// Helper function for GCD (used in fraction simplification tests)
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
