// Font management utilities for Astra Academy
// Handles custom font uploads, font previews, and font application

export interface FontInfo {
  id: string;
  name: string;
  family: string;
  url?: string; // For uploaded fonts
  category: 'handwriting' | 'print' | 'decorative' | 'custom';
  description: string;
  preview: string; // Sample text
}

export interface FontUpload {
  file: File;
  name: string;
  category: 'handwriting' | 'print' | 'decorative' | 'custom';
}

// Built-in fonts that work well for worksheets
export const BUILT_IN_FONTS: FontInfo[] = [
  {
    id: 'default',
    name: 'Default (System)',
    family: 'system-ui, -apple-system, sans-serif',
    category: 'print',
    description: 'Clean, readable system font',
    preview: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    id: 'handwriting-1',
    name: 'Handwriting Style',
    family: '"Kalam", cursive',
    category: 'handwriting',
    description: 'Friendly handwriting font',
    preview: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    id: 'handwriting-2',
    name: 'Cursive Practice',
    family: '"Dancing Script", cursive',
    category: 'handwriting',
    description: 'Elegant cursive for practice',
    preview: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    id: 'print-1',
    name: 'Clear Print',
    family: '"Open Sans", sans-serif',
    category: 'print',
    description: 'Very clear and readable',
    preview: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    id: 'print-2',
    name: 'Classic Serif',
    family: '"Times New Roman", serif',
    category: 'print',
    description: 'Traditional serif font',
    preview: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    id: 'decorative-1',
    name: 'Fun Display',
    family: '"Fredoka One", cursive',
    category: 'decorative',
    description: 'Playful display font',
    preview: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    id: 'decorative-2',
    name: 'Bubble Letters',
    family: '"Bubblegum Sans", cursive',
    category: 'decorative',
    description: 'Fun bubble-style letters',
    preview: 'The quick brown fox jumps over the lazy dog.',
  },
];

// Font categories for organization
export const FONT_CATEGORIES = {
  handwriting: {
    name: 'Handwriting Fonts',
    description: 'Perfect for tracing and handwriting practice',
    icon: '✍️',
  },
  print: {
    name: 'Print Fonts',
    description: 'Clear, readable fonts for reading practice',
    icon: '📖',
  },
  decorative: {
    name: 'Decorative Fonts',
    description: 'Fun fonts for titles and special worksheets',
    icon: '🎨',
  },
  custom: {
    name: 'Custom Fonts',
    description: 'Your uploaded fonts',
    icon: '📁',
  },
};

// Generate CSS for font loading
export function generateFontCSS(fonts: FontInfo[]): string {
  const customFonts = fonts.filter(font => font.url);
  
  if (customFonts.length === 0) {
    return '';
  }

  return customFonts
    .map(font => {
      const fontFamily = font.family.replace(/['"]/g, '');
      return `
@font-face {
  font-family: '${fontFamily}';
  src: url('${font.url}');
  font-display: swap;
}`;
    })
    .join('\n');
}

// Generate CSS class for applying font
export function generateFontClass(font: FontInfo): string {
  return `.font-${font.id} { font-family: ${font.family}; }`;
}

// Validate font file
export function validateFontFile(file: File): { valid: boolean; error?: string } {
  const validTypes = [
    'font/woff',
    'font/woff2',
    'font/ttf',
    'font/otf',
    'application/font-woff',
    'application/font-woff2',
  ];
  
  const validExtensions = ['.woff', '.woff2', '.ttf', '.otf'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Please upload a valid font file (.woff, .woff2, .ttf, .otf)',
    };
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    return {
      valid: false,
      error: 'Font file is too large. Please keep it under 5MB.',
    };
  }
  
  return { valid: true };
}

// Convert font file to data URL
export function fontFileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read font file'));
    reader.readAsDataURL(file);
  });
}

// Create font info from upload
export async function createFontFromUpload(upload: FontUpload): Promise<FontInfo> {
  const validation = validateFontFile(upload.file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const dataURL = await fontFileToDataURL(upload.file);
  const fontFamily = upload.name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ');
  
  return {
    id: `custom-${Date.now()}`,
    name: upload.name,
    family: `"${fontFamily}", sans-serif`,
    url: dataURL,
    category: upload.category,
    description: `Custom ${upload.category} font`,
    preview: 'The quick brown fox jumps over the lazy dog.',
  };
}

// Font storage utilities (using localStorage for now)
export const FontStorage = {
  saveCustomFont(font: FontInfo): void {
    const customFonts = this.getCustomFonts();
    customFonts.push(font);
    localStorage.setItem('astra-academy-custom-fonts', JSON.stringify(customFonts));
  },
  
  getCustomFonts(): FontInfo[] {
    const stored = localStorage.getItem('astra-academy-custom-fonts');
    return stored ? JSON.parse(stored) : [];
  },
  
  removeCustomFont(fontId: string): void {
    const customFonts = this.getCustomFonts();
    const filtered = customFonts.filter(font => font.id !== fontId);
    localStorage.setItem('astra-academy-custom-fonts', JSON.stringify(filtered));
  },
  
  getAllFonts(): FontInfo[] {
    return [...BUILT_IN_FONTS, ...this.getCustomFonts()];
  },
};

// Font preview utilities
export function generateFontPreview(font: FontInfo, text: string = font.preview): string {
  return `
    <div style="font-family: ${font.family}; font-size: 18px; line-height: 1.4; padding: 10px; border: 1px solid #e5e7eb; border-radius: 6px; background: white;">
      ${text}
    </div>
  `;
}

// Font application utilities for worksheets
export function applyFontToWorksheet(font: FontInfo): string {
  return `
    <style>
      .worksheet-content {
        font-family: ${font.family} !important;
      }
      .worksheet-content h1,
      .worksheet-content h2,
      .worksheet-content h3 {
        font-family: ${font.family} !important;
      }
      .worksheet-content .problem {
        font-family: ${font.family} !important;
      }
      .worksheet-content .answer-key {
        font-family: ${font.family} !important;
      }
    </style>
  `;
}

// Font loading utilities
export function loadFont(font: FontInfo): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!font.url) {
      resolve();
      return;
    }
    
    const fontFace = new FontFace(font.family, `url(${font.url})`);
    
    fontFace.load()
      .then(() => {
        document.fonts.add(fontFace);
        resolve();
      })
      .catch(reject);
  });
}

// Batch load multiple fonts
export async function loadFonts(fonts: FontInfo[]): Promise<void> {
  const loadPromises = fonts.map(font => loadFont(font));
  await Promise.all(loadPromises);
}
