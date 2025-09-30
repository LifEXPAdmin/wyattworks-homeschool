/**
 * Math Problem Generators
 *
 * Generates math problems with configurable difficulty and constraints.
 * Uses seeded PRNG for reproducible problem sets.
 */

/**
 * Seeded Pseudo-Random Number Generator
 * Based on the Mulberry32 algorithm for fast, high-quality pseudo-random numbers
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Generates the next random number between 0 and 1
   */
  next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a random integer between min and max (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Resets the seed
   */
  reset(seed: number): void {
    this.seed = seed;
  }

  /**
   * Gets the current seed
   */
  getSeed(): number {
    return this.seed;
  }
}

/**
 * Math problem interface
 */
export interface MathProblem {
  problem: string;
  answer: number;
  operands: number[];
  operator: string;
}

/**
 * Options for problem generation
 */
export interface ProblemOptions {
  count?: number;
  minValue?: number;
  maxValue?: number;
  allowNegatives?: boolean;
  seed?: number;
}

/**
 * Addition problem options
 */
export interface AdditionOptions extends ProblemOptions {
  operandCount?: number; // Number of numbers to add (default: 2)
}

/**
 * Subtraction problem options
 */
export interface SubtractionOptions extends ProblemOptions {
  allowNegativeResults?: boolean;
}

/**
 * Multiplication problem options
 */
export interface MultiplicationOptions extends ProblemOptions {
  maxProduct?: number;
}

/**
 * Division problem options
 */
export interface DivisionOptions extends ProblemOptions {
  requireWholeNumbers?: boolean; // Only generate problems with whole number answers
}

/**
 * Fraction problem options
 */
export interface FractionOptions extends ProblemOptions {
  operation?: "add" | "subtract" | "multiply" | "divide";
  maxDenominator?: number;
  simplify?: boolean;
}

/**
 * Fraction result interface
 */
export interface FractionProblem extends Omit<MathProblem, "answer"> {
  answer: { numerator: number; denominator: number };
  decimal: number;
}

/**
 * Generates addition problems
 *
 * @param options - Configuration options
 * @returns Array of addition problems with answers
 *
 * @example
 * ```typescript
 * const problems = generateAddition({
 *   count: 10,
 *   minValue: 1,
 *   maxValue: 20,
 *   operandCount: 2,
 *   seed: 12345
 * });
 * // => [{ problem: "5 + 7", answer: 12, operands: [5, 7], operator: "+" }, ...]
 * ```
 */
export function generateAddition(options: AdditionOptions = {}): MathProblem[] {
  const { count = 10, minValue = 1, maxValue = 20, operandCount = 2, seed = Date.now() } = options;

  const rng = new SeededRandom(seed);
  const problems: MathProblem[] = [];
  const seen = new Set<string>();

  while (problems.length < count) {
    const operands: number[] = [];
    for (let i = 0; i < operandCount; i++) {
      operands.push(rng.nextInt(minValue, maxValue));
    }

    const answer = operands.reduce((sum, n) => sum + n, 0);
    const problem = operands.join(" + ");
    const key = operands.sort((a, b) => a - b).join(",");

    // Avoid duplicates
    if (!seen.has(key)) {
      seen.add(key);
      problems.push({
        problem,
        answer,
        operands,
        operator: "+",
      });
    }
  }

  return problems;
}

/**
 * Generates subtraction problems
 *
 * @param options - Configuration options
 * @returns Array of subtraction problems with answers
 *
 * @example
 * ```typescript
 * const problems = generateSubtraction({
 *   count: 10,
 *   minValue: 1,
 *   maxValue: 50,
 *   allowNegativeResults: false,
 *   seed: 12345
 * });
 * // => [{ problem: "15 - 7", answer: 8, operands: [15, 7], operator: "-" }, ...]
 * ```
 */
export function generateSubtraction(options: SubtractionOptions = {}): MathProblem[] {
  const {
    count = 10,
    minValue = 1,
    maxValue = 20,
    allowNegativeResults = false,
    seed = Date.now(),
  } = options;

  const rng = new SeededRandom(seed);
  const problems: MathProblem[] = [];
  const seen = new Set<string>();

  while (problems.length < count) {
    let a = rng.nextInt(minValue, maxValue);
    let b = rng.nextInt(minValue, maxValue);

    // Ensure a >= b if negative results not allowed
    if (!allowNegativeResults && b > a) {
      [a, b] = [b, a];
    }

    const answer = a - b;
    const problem = `${a} - ${b}`;
    const key = `${a},${b}`;

    // Avoid duplicates
    if (!seen.has(key)) {
      seen.add(key);
      problems.push({
        problem,
        answer,
        operands: [a, b],
        operator: "-",
      });
    }
  }

  return problems;
}

/**
 * Generates multiplication problems
 *
 * @param options - Configuration options
 * @returns Array of multiplication problems with answers
 *
 * @example
 * ```typescript
 * const problems = generateMultiplication({
 *   count: 10,
 *   minValue: 2,
 *   maxValue: 12,
 *   maxProduct: 144,
 *   seed: 12345
 * });
 * // => [{ problem: "6 × 7", answer: 42, operands: [6, 7], operator: "×" }, ...]
 * ```
 */
export function generateMultiplication(options: MultiplicationOptions = {}): MathProblem[] {
  const { count = 10, minValue = 2, maxValue = 12, maxProduct, seed = Date.now() } = options;

  const rng = new SeededRandom(seed);
  const problems: MathProblem[] = [];
  const seen = new Set<string>();

  while (problems.length < count) {
    const a = rng.nextInt(minValue, maxValue);
    const b = rng.nextInt(minValue, maxValue);
    const answer = a * b;

    // Check max product constraint
    if (maxProduct && answer > maxProduct) {
      continue;
    }

    const problem = `${a} × ${b}`;
    const key = [a, b].sort((x, y) => x - y).join(",");

    // Avoid duplicates
    if (!seen.has(key)) {
      seen.add(key);
      problems.push({
        problem,
        answer,
        operands: [a, b],
        operator: "×",
      });
    }
  }

  return problems;
}

/**
 * Generates division problems
 *
 * @param options - Configuration options
 * @returns Array of division problems with answers
 *
 * @example
 * ```typescript
 * const problems = generateDivision({
 *   count: 10,
 *   minValue: 2,
 *   maxValue: 12,
 *   requireWholeNumbers: true,
 *   seed: 12345
 * });
 * // => [{ problem: "24 ÷ 6", answer: 4, operands: [24, 6], operator: "÷" }, ...]
 * ```
 */
export function generateDivision(options: DivisionOptions = {}): MathProblem[] {
  const {
    count = 10,
    minValue = 2,
    maxValue = 12,
    requireWholeNumbers = true,
    seed = Date.now(),
  } = options;

  const rng = new SeededRandom(seed);
  const problems: MathProblem[] = [];
  const seen = new Set<string>();

  while (problems.length < count) {
    const divisor = rng.nextInt(minValue, maxValue);
    const quotient = rng.nextInt(minValue, maxValue);
    const dividend = divisor * quotient;

    const answer = requireWholeNumbers ? quotient : dividend / divisor;
    const problem = `${dividend} ÷ ${divisor}`;
    const key = `${dividend},${divisor}`;

    // Avoid duplicates
    if (!seen.has(key)) {
      seen.add(key);
      problems.push({
        problem,
        answer,
        operands: [dividend, divisor],
        operator: "÷",
      });
    }
  }

  return problems;
}

/**
 * Greatest Common Divisor (GCD) using Euclidean algorithm
 */
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Simplifies a fraction to its lowest terms
 */
function simplifyFraction(
  numerator: number,
  denominator: number
): { numerator: number; denominator: number } {
  const divisor = gcd(Math.abs(numerator), Math.abs(denominator));
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

/**
 * Generates fraction problems
 *
 * @param options - Configuration options
 * @returns Array of fraction problems with answers
 *
 * @example
 * ```typescript
 * const problems = generateFractions({
 *   count: 10,
 *   operation: "add",
 *   maxDenominator: 12,
 *   simplify: true,
 *   seed: 12345
 * });
 * // => [{ problem: "1/2 + 1/3", answer: { numerator: 5, denominator: 6 }, ... }, ...]
 * ```
 */
export function generateFractions(options: FractionOptions = {}): FractionProblem[] {
  const {
    count = 10,
    operation = "add",
    minValue = 1,
    maxValue = 10,
    maxDenominator = 12,
    simplify = true,
    seed = Date.now(),
  } = options;

  const rng = new SeededRandom(seed);
  const problems: FractionProblem[] = [];
  const seen = new Set<string>();

  while (problems.length < count) {
    // Generate two fractions
    const num1 = rng.nextInt(minValue, maxValue);
    const den1 = rng.nextInt(Math.max(minValue, 2), maxDenominator);
    const num2 = rng.nextInt(minValue, maxValue);
    const den2 = rng.nextInt(Math.max(minValue, 2), maxDenominator);

    let answerNum: number;
    let answerDen: number;
    let operatorSymbol: string;

    switch (operation) {
      case "add":
        answerNum = num1 * den2 + num2 * den1;
        answerDen = den1 * den2;
        operatorSymbol = "+";
        break;
      case "subtract":
        answerNum = num1 * den2 - num2 * den1;
        answerDen = den1 * den2;
        operatorSymbol = "-";
        break;
      case "multiply":
        answerNum = num1 * num2;
        answerDen = den1 * den2;
        operatorSymbol = "×";
        break;
      case "divide":
        answerNum = num1 * den2;
        answerDen = den1 * num2;
        operatorSymbol = "÷";
        break;
    }

    // Simplify if requested
    const answer = simplify
      ? simplifyFraction(answerNum, answerDen)
      : { numerator: answerNum, denominator: answerDen };

    const problem = `${num1}/${den1} ${operatorSymbol} ${num2}/${den2}`;
    const key = `${num1}/${den1},${num2}/${den2},${operation}`;

    // Avoid duplicates
    if (!seen.has(key)) {
      seen.add(key);
      problems.push({
        problem,
        answer,
        decimal: answer.numerator / answer.denominator,
        operands: [num1, den1, num2, den2],
        operator: operatorSymbol,
      });
    }
  }

  return problems;
}

/**
 * Utility function to check for duplicate problems
 */
export function hasDuplicates<T extends MathProblem | FractionProblem>(problems: T[]): boolean {
  const seen = new Set<string>();
  for (const problem of problems) {
    if (seen.has(problem.problem)) {
      return true;
    }
    seen.add(problem.problem);
  }
  return false;
}

/**
 * Utility function to verify all problems meet constraints
 */
export function verifyConstraints(
  problems: MathProblem[],
  minValue: number,
  maxValue: number
): boolean {
  return problems.every((p) =>
    p.operands.every((operand) => operand >= minValue && operand <= maxValue)
  );
}
