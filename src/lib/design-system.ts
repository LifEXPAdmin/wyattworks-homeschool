// Design system and theming for Astra Academy
// Handles themes, animations, and interactive elements

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  animations: ThemeAnimations;
  preview: string; // CSS class for preview
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface ThemeAnimations {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface AnimationConfig {
  type: 'fade' | 'slide' | 'scale' | 'bounce' | 'shake' | 'pulse' | 'glow';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: number;
  iteration?: 'once' | 'infinite' | number;
}

// Predefined themes
export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Classic',
    description: 'Clean and professional design',
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    preview: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'warm',
    name: 'Warm & Cozy',
    description: 'Homeschool-friendly warm colors',
    colors: {
      primary: '#d97706',
      secondary: '#92400e',
      accent: '#f59e0b',
      background: '#fef7ed',
      surface: '#fff7ed',
      text: '#92400e',
      textSecondary: '#a16207',
      border: '#fed7aa',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7',
    },
    fonts: {
      heading: 'Merriweather, serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    animations: {
      duration: {
        fast: '200ms',
        normal: '400ms',
        slow: '600ms',
      },
      easing: {
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      },
    },
    preview: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'nature',
    name: 'Nature',
    description: 'Inspired by the great outdoors',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      background: '#f0fdf4',
      surface: '#ecfdf5',
      text: '#064e3b',
      textSecondary: '#047857',
      border: '#bbf7d0',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7',
    },
    fonts: {
      heading: 'Poppins, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    animations: {
      duration: {
        fast: '180ms',
        normal: '350ms',
        slow: '550ms',
      },
      easing: {
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      },
    },
    preview: 'bg-green-50 border-green-200',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calming blue ocean vibes',
    colors: {
      primary: '#0284c7',
      secondary: '#0369a1',
      accent: '#0ea5e9',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7',
    },
    fonts: {
      heading: 'Nunito, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    animations: {
      duration: {
        fast: '160ms',
        normal: '320ms',
        slow: '480ms',
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    preview: 'bg-sky-50 border-sky-200',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm sunset colors',
    colors: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      accent: '#f97316',
      background: '#fef2f2',
      surface: '#fef7f7',
      text: '#991b1b',
      textSecondary: '#b91c1c',
      border: '#fecaca',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7',
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    animations: {
      duration: {
        fast: '170ms',
        normal: '340ms',
        slow: '510ms',
      },
      easing: {
        ease: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        easeIn: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        easeOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
        easeInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
      },
    },
    preview: 'bg-red-50 border-red-200',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark theme for night owls',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '450ms',
      },
      easing: {
        ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    preview: 'bg-slate-900 border-slate-700',
  },
];

// Theme management utilities
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme;
  private listeners: Array<(theme: Theme) => void> = [];

  private constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  setTheme(themeId: string): void {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) {
      console.warn(`Theme ${themeId} not found`);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme(theme);
    this.saveTheme(themeId);
    this.notifyListeners();
  }

  addListener(callback: (theme: Theme) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (theme: Theme) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    Object.entries(theme.fonts).forEach(([key, value]) => {
      root.style.setProperty(`--font-${key}`, value);
    });

    Object.entries(theme.animations.duration).forEach(([key, value]) => {
      root.style.setProperty(`--duration-${key}`, value);
    });

    Object.entries(theme.animations.easing).forEach(([key, value]) => {
      root.style.setProperty(`--easing-${key}`, value);
    });

    // Apply theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id}`);
  }

  private loadTheme(): Theme {
    if (typeof window === 'undefined') return THEMES[0];
    
    const savedThemeId = localStorage.getItem('astra-academy-theme');
    const theme = THEMES.find(t => t.id === savedThemeId);
    return theme || THEMES[0];
  }

  private saveTheme(themeId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('astra-academy-theme', themeId);
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.currentTheme));
  }
}

// Animation utilities
export class AnimationManager {
  static animate(element: HTMLElement, config: AnimationConfig): Promise<void> {
    return new Promise((resolve) => {
      const duration = config.duration || 'normal';
      const delay = config.delay || 0;
      const iteration = config.iteration || 'once';

      // Create animation class
      const animationClass = this.generateAnimationClass(config);
      
      // Apply animation
      element.classList.add(animationClass);
      
      // Set CSS custom properties
      element.style.setProperty('--animation-duration', `var(--duration-${duration})`);
      element.style.setProperty('--animation-delay', `${delay}ms`);
      element.style.setProperty('--animation-iteration', iteration === 'infinite' ? 'infinite' : iteration.toString());

      // Clean up and resolve
      const animationDuration = this.getDuration(duration);
      setTimeout(() => {
        element.classList.remove(animationClass);
        resolve();
      }, animationDuration + delay);
    });
  }

  static stagger(children: HTMLElement[], config: AnimationConfig, staggerDelay: number = 100): Promise<void> {
    return new Promise((resolve) => {
      const promises = children.map((child, index) => {
        return this.animate(child, {
          ...config,
          delay: (config.delay || 0) + (index * staggerDelay),
        });
      });

      Promise.all(promises).then(() => resolve());
    });
  }

  private static generateAnimationClass(config: AnimationConfig): string {
    const { type, direction } = config;
    
    switch (type) {
      case 'fade':
        return `animate-fade-${direction || 'in'}`;
      case 'slide':
        return `animate-slide-${direction || 'up'}`;
      case 'scale':
        return 'animate-scale';
      case 'bounce':
        return 'animate-bounce';
      case 'shake':
        return 'animate-shake';
      case 'pulse':
        return 'animate-pulse';
      case 'glow':
        return 'animate-glow';
      default:
        return 'animate-fade-in';
    }
  }

  private static getDuration(duration: string): number {
    switch (duration) {
      case 'fast': return 150;
      case 'normal': return 300;
      case 'slow': return 500;
      default: return 300;
    }
  }
}

// Interactive element utilities
export class InteractiveManager {
  static addHoverEffect(element: HTMLElement, effect: 'lift' | 'glow' | 'scale' | 'tilt'): void {
    element.classList.add(`interactive-${effect}`);
  }

  static addClickEffect(element: HTMLElement, effect: 'ripple' | 'bounce' | 'shake'): void {
    element.addEventListener('click', (e) => {
      this.createClickEffect(e.target as HTMLElement, effect);
    });
  }

  static addScrollReveal(element: HTMLElement, config: { threshold?: number; delay?: number } = {}): void {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            AnimationManager.animate(entry.target as HTMLElement, {
              type: 'fade',
              direction: 'up',
              duration: 'normal',
              delay: config.delay || 0,
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: config.threshold || 0.1 }
    );

    observer.observe(element);
  }

  private static createClickEffect(element: HTMLElement, effect: string): void {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const effectElement = document.createElement('div');
    effectElement.className = `click-effect-${effect}`;
    effectElement.style.position = 'fixed';
    effectElement.style.left = `${x}px`;
    effectElement.style.top = `${y}px`;
    effectElement.style.pointerEvents = 'none';
    effectElement.style.zIndex = '9999';

    document.body.appendChild(effectElement);

    setTimeout(() => {
      document.body.removeChild(effectElement);
    }, 600);
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance();
