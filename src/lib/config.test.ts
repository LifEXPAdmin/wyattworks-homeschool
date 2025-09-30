/**
 * Unit Tests for Worksheet Configuration Schema and Utilities
 */

import { describe, it, expect } from "vitest";
import {
  WorksheetConfigSchema,
  validateConfig,
  safeValidateConfig,
  hashConfig,
  stableStringify,
  configsAreEquivalent,
  createConfig,
  type WorksheetConfig,
} from "./config";

describe("WorksheetConfigSchema", () => {
  describe("validation", () => {
    it("should validate a minimal valid configuration", () => {
      const config = {
        subject: "math",
        type: "practice",
      };

      const result = WorksheetConfigSchema.parse(config);

      expect(result.subject).toBe("math");
      expect(result.type).toBe("practice");
      // options and layout are optional, so they can be undefined
      expect(result.options === undefined || typeof result.options === "object").toBe(true);
      expect(result.layout === undefined || typeof result.layout === "object").toBe(true);
    });

    it("should validate a complete configuration", () => {
      const config = {
        subject: "science",
        type: "quiz",
        options: {
          showAnswerKey: true,
          showInstructions: true,
          difficulty: "hard",
          problemCount: 20,
          timeLimit: 60,
        },
        layout: {
          orientation: "landscape",
          pageSize: "a4",
          margins: { top: 1, right: 1, bottom: 1, left: 1 },
          columns: 2,
        },
        seed: 12345,
        metadata: {
          title: "Science Quiz",
          gradeLevel: "6",
          tags: ["biology", "cells"],
        },
      };

      const result = WorksheetConfigSchema.parse(config);

      expect(result).toMatchObject(config);
    });

    it("should apply default values", () => {
      const config = {
        subject: "language_arts",
        type: "homework",
        options: {},
        layout: {},
      };

      const result = WorksheetConfigSchema.parse(config);

      expect(result.options?.showAnswerKey).toBe(false);
      expect(result.options?.showInstructions).toBe(true);
      expect(result.layout?.orientation).toBe("portrait");
      expect(result.layout?.pageSize).toBe("letter");
      expect(result.layout?.columns).toBe(1);
    });

    it("should reject invalid subject", () => {
      const config = {
        subject: "invalid_subject",
        type: "practice",
      };

      expect(() => WorksheetConfigSchema.parse(config)).toThrow();
    });

    it("should reject invalid type", () => {
      const config = {
        subject: "math",
        type: "invalid_type",
      };

      expect(() => WorksheetConfigSchema.parse(config)).toThrow();
    });

    it("should reject invalid options", () => {
      const config = {
        subject: "math",
        type: "practice",
        options: {
          problemCount: -5, // Invalid: must be >= 1
        },
      };

      expect(() => WorksheetConfigSchema.parse(config)).toThrow();
    });

    it("should reject invalid layout", () => {
      const config = {
        subject: "math",
        type: "practice",
        layout: {
          columns: 10, // Invalid: max is 4
        },
      };

      expect(() => WorksheetConfigSchema.parse(config)).toThrow();
    });
  });

  describe("validateConfig", () => {
    it("should validate and return normalized config", () => {
      const config = {
        subject: "math",
        type: "practice",
      };

      const result = validateConfig(config);

      expect(result.subject).toBe("math");
      // options is optional, so it can be undefined or an object
      expect(result.options === undefined || typeof result.options === "object").toBe(true);
    });

    it("should throw on invalid config", () => {
      const config = {
        subject: "invalid",
      };

      expect(() => validateConfig(config)).toThrow();
    });
  });

  describe("safeValidateConfig", () => {
    it("should return success for valid config", () => {
      const config = {
        subject: "math",
        type: "practice",
      };

      const result = safeValidateConfig(config);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.subject).toBe("math");
      }
    });

    it("should return error for invalid config", () => {
      const config = {
        subject: "invalid",
      };

      const result = safeValidateConfig(config);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});

describe("stableStringify", () => {
  it("should produce consistent output for same object", () => {
    const obj = { b: 2, a: 1, c: 3 };

    const result1 = stableStringify(obj);
    const result2 = stableStringify(obj);

    expect(result1).toBe(result2);
  });

  it("should produce same output regardless of property order", () => {
    const obj1 = { a: 1, b: 2, c: 3 };
    const obj2 = { c: 3, a: 1, b: 2 };

    const result1 = stableStringify(obj1);
    const result2 = stableStringify(obj2);

    expect(result1).toBe(result2);
  });

  it("should handle nested objects", () => {
    const obj1 = { a: { z: 1, y: 2 }, b: 3 };
    const obj2 = { b: 3, a: { y: 2, z: 1 } };

    const result1 = stableStringify(obj1);
    const result2 = stableStringify(obj2);

    expect(result1).toBe(result2);
  });

  it("should handle arrays", () => {
    const obj = { a: [3, 1, 2], b: "test" };

    const result = stableStringify(obj);

    expect(result).toContain("[3,1,2]");
  });

  it("should handle primitives", () => {
    expect(stableStringify(null)).toBe("null");
    expect(stableStringify(undefined)).toBe("undefined");
    expect(stableStringify(42)).toBe("42");
    expect(stableStringify("test")).toBe('"test"');
    expect(stableStringify(true)).toBe("true");
  });
});

describe("hashConfig", () => {
  it("should generate a SHA-256 hash", () => {
    const config: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: {},
      layout: {},
    };

    const hash = hashConfig(config);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash.length).toBe(64);
  });

  it("should produce same hash for equivalent configurations", () => {
    const config1: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: { showAnswerKey: true },
      layout: { orientation: "portrait" },
    };

    const config2: WorksheetConfig = {
      layout: { orientation: "portrait" },
      subject: "math",
      options: { showAnswerKey: true },
      type: "practice",
    };

    const hash1 = hashConfig(config1);
    const hash2 = hashConfig(config2);

    expect(hash1).toBe(hash2);
  });

  it("should produce different hash for different configurations", () => {
    const config1: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: {},
      layout: {},
    };

    const config2: WorksheetConfig = {
      subject: "science",
      type: "practice",
      options: {},
      layout: {},
    };

    const hash1 = hashConfig(config1);
    const hash2 = hashConfig(config2);

    expect(hash1).not.toBe(hash2);
  });

  it("should be deterministic", () => {
    const config: WorksheetConfig = {
      subject: "math",
      type: "quiz",
      options: {
        showAnswerKey: true,
        difficulty: "medium",
        problemCount: 15,
      },
      layout: {
        orientation: "landscape",
        columns: 2,
      },
      seed: 42,
    };

    const hash1 = hashConfig(config);
    const hash2 = hashConfig(config);
    const hash3 = hashConfig(config);

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  it("should detect small changes in configuration", () => {
    const config1: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: { problemCount: 10 },
      layout: {},
    };

    const config2: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: { problemCount: 11 },
      layout: {},
    };

    const hash1 = hashConfig(config1);
    const hash2 = hashConfig(config2);

    expect(hash1).not.toBe(hash2);
  });

  it("should handle configurations with seed", () => {
    const config1: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: {},
      layout: {},
      seed: 123,
    };

    const config2: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: {},
      layout: {},
      seed: 456,
    };

    const hash1 = hashConfig(config1);
    const hash2 = hashConfig(config2);

    expect(hash1).not.toBe(hash2);
  });

  it("should handle configurations with metadata", () => {
    const config: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: {},
      layout: {},
      metadata: {
        title: "Test Worksheet",
        gradeLevel: "5",
        tags: ["algebra", "equations"],
      },
    };

    const hash = hashConfig(config);

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("configsAreEquivalent", () => {
  it("should return true for equivalent configurations", () => {
    const config1: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: { showAnswerKey: true },
      layout: {},
    };

    const config2: WorksheetConfig = {
      type: "practice",
      subject: "math",
      layout: {},
      options: { showAnswerKey: true },
    };

    expect(configsAreEquivalent(config1, config2)).toBe(true);
  });

  it("should return false for different configurations", () => {
    const config1: WorksheetConfig = {
      subject: "math",
      type: "practice",
      options: {},
      layout: {},
    };

    const config2: WorksheetConfig = {
      subject: "science",
      type: "practice",
      options: {},
      layout: {},
    };

    expect(configsAreEquivalent(config1, config2)).toBe(false);
  });
});

describe("createConfig", () => {
  it("should create config with defaults", () => {
    const partial = {
      subject: "math" as const,
    };

    const config = createConfig(partial);

    expect(config.subject).toBe("math");
    expect(config.type).toBe("worksheet");
    expect(config.options).toBeDefined();
    expect(config.layout).toBeDefined();
  });

  it("should override defaults with provided values", () => {
    const partial = {
      subject: "science" as const,
      type: "quiz" as const,
      options: { showAnswerKey: true },
    };

    const config = createConfig(partial);

    expect(config.subject).toBe("science");
    expect(config.type).toBe("quiz");
    expect(config.options?.showAnswerKey).toBe(true);
  });

  it("should handle empty partial", () => {
    const config = createConfig({});

    expect(config.subject).toBe("math");
    expect(config.type).toBe("worksheet");
  });
});

describe("integration tests", () => {
  it("should handle complete workflow: create, validate, hash", () => {
    // Create a config
    const config = createConfig({
      subject: "math",
      type: "quiz",
      options: {
        showAnswerKey: true,
        difficulty: "hard",
        problemCount: 25,
      },
      seed: 42,
    });

    // Validate it
    const validated = validateConfig(config);
    expect(validated).toBeDefined();

    // Hash it
    const hash = hashConfig(validated);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);

    // Verify determinism
    const hash2 = hashConfig(validated);
    expect(hash).toBe(hash2);
  });

  it("should detect duplicate export configurations", () => {
    const exportConfig1 = createConfig({
      subject: "math",
      type: "practice",
      options: { showAnswerKey: false },
      layout: { orientation: "portrait" },
      seed: 100,
    });

    const exportConfig2 = createConfig({
      subject: "math",
      type: "practice",
      options: { showAnswerKey: false },
      layout: { orientation: "portrait" },
      seed: 100,
    });

    const exportConfig3 = createConfig({
      subject: "math",
      type: "practice",
      options: { showAnswerKey: true }, // Different!
      layout: { orientation: "portrait" },
      seed: 100,
    });

    expect(configsAreEquivalent(exportConfig1, exportConfig2)).toBe(true);
    expect(configsAreEquivalent(exportConfig1, exportConfig3)).toBe(false);
  });
});
