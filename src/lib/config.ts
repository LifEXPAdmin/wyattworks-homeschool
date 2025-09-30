/**
 * Worksheet Configuration Schema and Utilities
 *
 * Provides Zod schema validation for worksheet configurations
 * and utilities for generating stable hashes of configurations.
 */

import { z } from "zod";
import crypto from "crypto";

/**
 * Worksheet Subject Enum
 */
export const WorksheetSubject = z.enum([
  "math",
  "science",
  "language_arts",
  "social_studies",
  "art",
  "music",
  "physical_education",
  "other",
]);

export type WorksheetSubjectType = z.infer<typeof WorksheetSubject>;

/**
 * Worksheet Type Enum
 */
export const WorksheetType = z.enum([
  "practice",
  "quiz",
  "test",
  "homework",
  "project",
  "worksheet",
  "handout",
  "template",
]);

export type WorksheetTypeType = z.infer<typeof WorksheetType>;

/**
 * Layout Configuration Schema
 */
export const LayoutSchema = z.object({
  orientation: z.enum(["portrait", "landscape"]).default("portrait"),
  pageSize: z.enum(["letter", "a4", "legal"]).default("letter"),
  margins: z
    .object({
      top: z.number().min(0).default(1),
      right: z.number().min(0).default(1),
      bottom: z.number().min(0).default(1),
      left: z.number().min(0).default(1),
    })
    .optional()
    .default({ top: 1, right: 1, bottom: 1, left: 1 }),
  columns: z.number().int().min(1).max(4).default(1),
  spacing: z.number().min(0).default(1),
});

export type Layout = z.infer<typeof LayoutSchema>;

/**
 * Worksheet Options Schema
 */
export const OptionsSchema = z.object({
  showAnswerKey: z.boolean().default(false),
  showInstructions: z.boolean().default(true),
  showHeader: z.boolean().default(true),
  showFooter: z.boolean().default(false),
  includeStudentName: z.boolean().default(true),
  includeDate: z.boolean().default(true),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  problemCount: z.number().int().min(1).max(100).optional(),
  timeLimit: z.number().int().min(1).optional(), // in minutes
  allowCalculator: z.boolean().optional(),
  showWorkSpace: z.boolean().default(true),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
  colorScheme: z.enum(["default", "colorful", "grayscale"]).default("default"),
});

export type Options = z.infer<typeof OptionsSchema>;

/**
 * Complete Worksheet Configuration Schema
 */
export const WorksheetConfigSchema = z.object({
  subject: WorksheetSubject,
  type: WorksheetType,
  options: OptionsSchema.partial().optional(),
  layout: LayoutSchema.partial().optional(),
  seed: z.number().int().min(0).optional(), // For reproducible random generation
  metadata: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      gradeLevel: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })
    .optional(),
});

export type WorksheetConfig = z.infer<typeof WorksheetConfigSchema>;

/**
 * Validates a worksheet configuration against the schema
 *
 * @param config - Configuration object to validate
 * @returns Validated and normalized configuration
 * @throws ZodError if validation fails
 */
export function validateConfig(config: unknown): WorksheetConfig {
  return WorksheetConfigSchema.parse(config);
}

/**
 * Safely validates a worksheet configuration
 *
 * @param config - Configuration object to validate
 * @returns Success object with data or error object with details
 */
export function safeValidateConfig(
  config: unknown
): ReturnType<typeof WorksheetConfigSchema.safeParse> {
  return WorksheetConfigSchema.safeParse(config);
}

/**
 * Generates a stable, deterministic JSON string from a configuration
 *
 * This ensures that equivalent configurations always produce the same hash,
 * regardless of property order in the original object.
 *
 * @param config - Configuration object
 * @returns Stable JSON string with sorted keys
 */
export function stableStringify(config: unknown): string {
  if (config === null) return "null";
  if (config === undefined) return "undefined";
  if (typeof config !== "object") return JSON.stringify(config);

  if (Array.isArray(config)) {
    return "[" + config.map(stableStringify).join(",") + "]";
  }

  const sortedKeys = Object.keys(config).sort();
  const pairs = sortedKeys.map((key) => {
    const value = (config as Record<string, unknown>)[key];
    return JSON.stringify(key) + ":" + stableStringify(value);
  });

  return "{" + pairs.join(",") + "}";
}

/**
 * Generates a SHA-256 hash of a worksheet configuration
 *
 * The hash is deterministic and will be the same for equivalent configurations,
 * regardless of property order. This is used to detect duplicate exports.
 *
 * @param config - Worksheet configuration object
 * @returns Hexadecimal SHA-256 hash string
 *
 * @example
 * ```typescript
 * const config: WorksheetConfig = {
 *   subject: "math",
 *   type: "practice",
 *   options: { showAnswerKey: true },
 *   layout: { orientation: "portrait" },
 * };
 *
 * const hash = hashConfig(config);
 * // => "a1b2c3d4e5f6..."
 * ```
 */
export function hashConfig(config: WorksheetConfig): string {
  // Validate config first to ensure consistency
  const validatedConfig = validateConfig(config);

  // Generate stable JSON representation
  const stableJson = stableStringify(validatedConfig);

  // Create SHA-256 hash
  const hash = crypto.createHash("sha256");
  hash.update(stableJson);

  return hash.digest("hex");
}

/**
 * Checks if two configurations would produce the same hash
 *
 * @param config1 - First configuration
 * @param config2 - Second configuration
 * @returns True if configurations are equivalent
 */
export function configsAreEquivalent(config1: WorksheetConfig, config2: WorksheetConfig): boolean {
  try {
    return hashConfig(config1) === hashConfig(config2);
  } catch {
    return false;
  }
}

/**
 * Creates a partial configuration with defaults
 *
 * @param partial - Partial configuration object
 * @returns Complete configuration with defaults applied
 */
export function createConfig(partial: Partial<WorksheetConfig>): WorksheetConfig {
  return WorksheetConfigSchema.parse({
    subject: partial.subject ?? "math",
    type: partial.type ?? "worksheet",
    options: partial.options ?? {},
    layout: partial.layout ?? {},
    seed: partial.seed,
    metadata: partial.metadata,
  });
}
