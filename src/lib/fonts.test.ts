import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BUILT_IN_FONTS,
  FONT_CATEGORIES,
  generateFontCSS,
  generateFontClass,
  validateFontFile,
  fontFileToDataURL,
  createFontFromUpload,
  FontStorage,
  generateFontPreview,
  applyFontToWorksheet,
  loadFont,
  loadFonts,
  type FontInfo,
  type FontUpload,
} from "./fonts";

// Mock FileReader for testing
const mockFileReader = {
  readAsDataURL: vi.fn(),
  result: "data:font/woff2;base64,mockFontData",
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
};

vi.stubGlobal("FileReader", vi.fn(() => mockFileReader));

// Mock FontFace for testing
const mockFontFace = {
  load: vi.fn().mockResolvedValue(undefined),
};

vi.stubGlobal("FontFace", vi.fn(() => mockFontFace));

// Mock document.fonts
Object.defineProperty(document, "fonts", {
  value: {
    add: vi.fn(),
  },
  writable: true,
});

describe("Font Management System", () => {
  describe("BUILT_IN_FONTS", () => {
    it("should have valid font structure", () => {
      BUILT_IN_FONTS.forEach((font) => {
        expect(font).toHaveProperty("id");
        expect(font).toHaveProperty("name");
        expect(font).toHaveProperty("family");
        expect(font).toHaveProperty("category");
        expect(font).toHaveProperty("description");
        expect(font).toHaveProperty("preview");
        expect(typeof font.id).toBe("string");
        expect(typeof font.name).toBe("string");
        expect(typeof font.family).toBe("string");
        expect(typeof font.category).toBe("string");
        expect(typeof font.description).toBe("string");
        expect(typeof font.preview).toBe("string");
      });
    });

    it("should have unique IDs", () => {
      const ids = BUILT_IN_FONTS.map((font) => font.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have valid categories", () => {
      const validCategories = ["handwriting", "print", "decorative", "custom"];
      BUILT_IN_FONTS.forEach((font) => {
        expect(validCategories).toContain(font.category);
      });
    });
  });

  describe("FONT_CATEGORIES", () => {
    it("should have all required categories", () => {
      expect(FONT_CATEGORIES).toHaveProperty("handwriting");
      expect(FONT_CATEGORIES).toHaveProperty("print");
      expect(FONT_CATEGORIES).toHaveProperty("decorative");
      expect(FONT_CATEGORIES).toHaveProperty("custom");
    });

    it("should have proper category structure", () => {
      Object.values(FONT_CATEGORIES).forEach((category) => {
        expect(category).toHaveProperty("name");
        expect(category).toHaveProperty("description");
        expect(category).toHaveProperty("icon");
        expect(typeof category.name).toBe("string");
        expect(typeof category.description).toBe("string");
        expect(typeof category.icon).toBe("string");
      });
    });
  });

  describe("generateFontCSS", () => {
    it("should return empty string for fonts without URLs", () => {
      const fonts: FontInfo[] = [
        {
          id: "test",
          name: "Test Font",
          family: "Test, sans-serif",
          category: "print",
          description: "Test font",
          preview: "Test preview",
        },
      ];
      expect(generateFontCSS(fonts)).toBe("");
    });

    it("should generate CSS for fonts with URLs", () => {
      const fonts: FontInfo[] = [
        {
          id: "test",
          name: "Test Font",
          family: "Test, sans-serif",
          url: "data:font/woff2;base64,test",
          category: "print",
          description: "Test font",
          preview: "Test preview",
        },
      ];
      const css = generateFontCSS(fonts);
      expect(css).toContain("@font-face");
      expect(css).toContain("font-family: 'Test'");
      expect(css).toContain("src: url('data:font/woff2;base64,test')");
    });

    it("should handle multiple fonts", () => {
      const fonts: FontInfo[] = [
        {
          id: "test1",
          name: "Test Font 1",
          family: "Test1, sans-serif",
          url: "data:font/woff2;base64,test1",
          category: "print",
          description: "Test font 1",
          preview: "Test preview 1",
        },
        {
          id: "test2",
          name: "Test Font 2",
          family: "Test2, sans-serif",
          url: "data:font/woff2;base64,test2",
          category: "print",
          description: "Test font 2",
          preview: "Test preview 2",
        },
      ];
      const css = generateFontCSS(fonts);
      expect(css).toContain("Test1");
      expect(css).toContain("Test2");
      expect((css.match(/@font-face/g) || []).length).toBe(2);
    });
  });

  describe("generateFontClass", () => {
    it("should generate correct CSS class", () => {
      const font: FontInfo = {
        id: "test-font",
        name: "Test Font",
        family: "Test, sans-serif",
        category: "print",
        description: "Test font",
        preview: "Test preview",
      };
      const cssClass = generateFontClass(font);
      expect(cssClass).toBe(
        `.font-test-font { font-family: Test, sans-serif; }`
      );
    });
  });

  describe("validateFontFile", () => {
    it("should validate correct font files", () => {
      const validFile = new File(["test"], "test.woff2", {
        type: "font/woff2",
      });
      const result = validateFontFile(validFile);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject invalid file types", () => {
      const invalidFile = new File(["test"], "test.txt", {
        type: "text/plain",
      });
      const result = validateFontFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("valid font file");
    });

    it("should reject files that are too large", () => {
      const largeFile = new File(["x".repeat(6 * 1024 * 1024)], "test.woff2", {
        type: "font/woff2",
      });
      const result = validateFontFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("too large");
    });

    it("should accept files with valid extensions even without MIME type", () => {
      const fileWithExtension = new File(["test"], "test.ttf", {
        type: "",
      });
      const result = validateFontFile(fileWithExtension);
      expect(result.valid).toBe(true);
    });
  });

  describe("fontFileToDataURL", () => {
    it("should convert font file to data URL", async () => {
      const file = new File(["test"], "test.woff2", {
        type: "font/woff2",
      });
      
      mockFileReader.readAsDataURL.mockImplementation(function(this: typeof mockFileReader) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      });

      const result = await fontFileToDataURL(file);
      expect(result).toBe("data:font/woff2;base64,mockFontData");
    });

    it("should handle file reading errors", async () => {
      const file = new File(["test"], "test.woff2", {
        type: "font/woff2",
      });
      
      mockFileReader.readAsDataURL.mockImplementation(function(this: typeof mockFileReader) {
        setTimeout(() => {
          if (this.onerror) this.onerror();
        }, 0);
      });

      await expect(fontFileToDataURL(file)).rejects.toThrow(
        "Failed to read font file"
      );
    });
  });

  describe("createFontFromUpload", () => {
    it("should create font info from valid upload", async () => {
      const file = new File(["test"], "MyFont.woff2", {
        type: "font/woff2",
      });
      const upload: FontUpload = {
        file,
        name: "My Custom Font",
        category: "handwriting",
      };

      mockFileReader.readAsDataURL.mockImplementation(function(this: typeof mockFileReader) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      });

      const font = await createFontFromUpload(upload);
      expect(font.name).toBe("My Custom Font");
      expect(font.category).toBe("handwriting");
      expect(font.family).toBe('"My Custom Font", sans-serif');
      expect(font.url).toBe("data:font/woff2;base64,mockFontData");
      expect(font.id).toMatch(/^custom-/);
    });

    it("should throw error for invalid file", async () => {
      const file = new File(["test"], "test.txt", {
        type: "text/plain",
      });
      const upload: FontUpload = {
        file,
        name: "Invalid Font",
        category: "handwriting",
      };

      await expect(createFontFromUpload(upload)).rejects.toThrow(
        "Please upload a valid font file"
      );
    });
  });

  describe("FontStorage", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("should save and retrieve custom fonts", () => {
      const font: FontInfo = {
        id: "custom-1",
        name: "Custom Font",
        family: "Custom, sans-serif",
        category: "handwriting",
        description: "Custom font",
        preview: "Custom preview",
      };

      FontStorage.saveCustomFont(font);
      const retrieved = FontStorage.getCustomFonts();
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toEqual(font);
    });

    it("should remove custom fonts", () => {
      const font: FontInfo = {
        id: "custom-1",
        name: "Custom Font",
        family: "Custom, sans-serif",
        category: "handwriting",
        description: "Custom font",
        preview: "Custom preview",
      };

      FontStorage.saveCustomFont(font);
      expect(FontStorage.getCustomFonts()).toHaveLength(1);

      FontStorage.removeCustomFont("custom-1");
      expect(FontStorage.getCustomFonts()).toHaveLength(0);
    });

    it("should return all fonts including built-in and custom", () => {
      const customFont: FontInfo = {
        id: "custom-1",
        name: "Custom Font",
        family: "Custom, sans-serif",
        category: "handwriting",
        description: "Custom font",
        preview: "Custom preview",
      };

      FontStorage.saveCustomFont(customFont);
      const allFonts = FontStorage.getAllFonts();
      
      expect(allFonts.length).toBeGreaterThan(BUILT_IN_FONTS.length);
      expect(allFonts).toContain(customFont);
      expect(allFonts).toEqual(expect.arrayContaining(BUILT_IN_FONTS));
    });
  });

  describe("generateFontPreview", () => {
    it("should generate HTML preview", () => {
      const font: FontInfo = {
        id: "test",
        name: "Test Font",
        family: "Test, sans-serif",
        category: "print",
        description: "Test font",
        preview: "Test preview text",
      };

      const preview = generateFontPreview(font);
      expect(preview).toContain("font-family: Test, sans-serif");
      expect(preview).toContain("Test preview text");
      expect(preview).toContain("<div");
    });

    it("should use custom text when provided", () => {
      const font: FontInfo = {
        id: "test",
        name: "Test Font",
        family: "Test, sans-serif",
        category: "print",
        description: "Test font",
        preview: "Default preview",
      };

      const preview = generateFontPreview(font, "Custom text");
      expect(preview).toContain("Custom text");
      expect(preview).not.toContain("Default preview");
    });
  });

  describe("applyFontToWorksheet", () => {
    it("should generate CSS for worksheet font application", () => {
      const font: FontInfo = {
        id: "test",
        name: "Test Font",
        family: "Test, sans-serif",
        category: "print",
        description: "Test font",
        preview: "Test preview",
      };

      const css = applyFontToWorksheet(font);
      expect(css).toContain("<style>");
      expect(css).toContain("font-family: Test, sans-serif !important");
      expect(css).toContain(".worksheet-content");
      expect(css).toContain(".problem");
      expect(css).toContain(".answer-key");
    });
  });

  describe("loadFont", () => {
    it("should load font with URL", async () => {
      const font: FontInfo = {
        id: "test",
        name: "Test Font",
        family: "Test, sans-serif",
        url: "data:font/woff2;base64,test",
        category: "print",
        description: "Test font",
        preview: "Test preview",
      };

      await loadFont(font);
      expect(mockFontFace).toHaveBeenCalledWith("Test, sans-serif", "url(data:font/woff2;base64,test)");
      expect(mockFontFace.load).toHaveBeenCalled();
      expect(document.fonts.add).toHaveBeenCalledWith(mockFontFace);
    });

    it("should resolve immediately for fonts without URL", async () => {
      const font: FontInfo = {
        id: "test",
        name: "Test Font",
        family: "Test, sans-serif",
        category: "print",
        description: "Test font",
        preview: "Test preview",
      };

      await loadFont(font);
      expect(mockFontFace).not.toHaveBeenCalled();
    });
  });

  describe("loadFonts", () => {
    it("should load multiple fonts", async () => {
      const fonts: FontInfo[] = [
        {
          id: "test1",
          name: "Test Font 1",
          family: "Test1, sans-serif",
          url: "data:font/woff2;base64,test1",
          category: "print",
          description: "Test font 1",
          preview: "Test preview 1",
        },
        {
          id: "test2",
          name: "Test Font 2",
          family: "Test2, sans-serif",
          url: "data:font/woff2;base64,test2",
          category: "print",
          description: "Test font 2",
          preview: "Test preview 2",
        },
      ];

      await loadFonts(fonts);
      expect(mockFontFace).toHaveBeenCalledTimes(2);
      expect(document.fonts.add).toHaveBeenCalledTimes(2);
    });
  });
});
