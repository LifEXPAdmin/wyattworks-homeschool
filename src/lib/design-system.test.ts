import { describe, it, expect, beforeEach, vi } from 'vitest';
import { THEMES, ThemeManager, AnimationManager, InteractiveManager } from './design-system';

// Mock DOM APIs
const mockDocument = {
  documentElement: {
    style: {
      setProperty: vi.fn(),
    },
  },
  body: {
    className: '',
    classList: {
      replace: vi.fn(),
      add: vi.fn(),
    },
  },
};

const mockWindow = {
  localStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
};

// Mock global objects
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('Design System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset ThemeManager instance
    (ThemeManager as unknown as { instance: undefined }).instance = undefined;
  });

  describe('THEMES', () => {
    it('should have all required themes', () => {
      expect(THEMES).toHaveLength(6);
      expect(THEMES.map(t => t.id)).toEqual([
        'default',
        'warm',
        'nature',
        'ocean',
        'sunset',
        'midnight',
      ]);
    });

    it('should have valid theme structure', () => {
      THEMES.forEach(theme => {
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('description');
        expect(theme).toHaveProperty('colors');
        expect(theme).toHaveProperty('fonts');
        expect(theme).toHaveProperty('animations');
        expect(theme).toHaveProperty('preview');
      });
    });

    it('should have all required color properties', () => {
      const requiredColors = [
        'primary', 'secondary', 'accent', 'background', 'surface',
        'text', 'textSecondary', 'border', 'success', 'warning',
        'error', 'info',
      ];

      THEMES.forEach(theme => {
        requiredColors.forEach(color => {
          expect(theme.colors).toHaveProperty(color);
          expect(theme.colors[color as keyof typeof theme.colors]).toBeTruthy();
        });
      });
    });

    it('should have all required font properties', () => {
      const requiredFonts = ['heading', 'body', 'mono'];

      THEMES.forEach(theme => {
        requiredFonts.forEach(font => {
          expect(theme.fonts).toHaveProperty(font);
          expect(theme.fonts[font as keyof typeof theme.fonts]).toBeTruthy();
        });
      });
    });

    it('should have all required animation properties', () => {
      const requiredDurations = ['fast', 'normal', 'slow'];
      const requiredEasings = ['ease', 'easeIn', 'easeOut', 'easeInOut'];

      THEMES.forEach(theme => {
        requiredDurations.forEach(duration => {
          expect(theme.animations.duration).toHaveProperty(duration);
        });
        requiredEasings.forEach(easing => {
          expect(theme.animations.easing).toHaveProperty(easing);
        });
      });
    });
  });

  describe('ThemeManager', () => {
    it('should be a singleton', () => {
      const instance1 = ThemeManager.getInstance();
      const instance2 = ThemeManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should load default theme when no saved theme', () => {
      mockWindow.localStorage.getItem.mockReturnValue(null);
      const manager = ThemeManager.getInstance();
      expect(manager.getCurrentTheme().id).toBe('default');
    });

    it('should load saved theme', () => {
      mockWindow.localStorage.getItem.mockReturnValue('warm');
      const manager = ThemeManager.getInstance();
      expect(manager.getCurrentTheme().id).toBe('warm');
    });

    it('should set theme correctly', () => {
      const manager = ThemeManager.getInstance();
      manager.setTheme('nature');
      
      expect(manager.getCurrentTheme().id).toBe('nature');
      expect(mockWindow.localStorage.setItem).toHaveBeenCalledWith('astra-academy-theme', 'nature');
    });

    it('should warn when setting invalid theme', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const manager = ThemeManager.getInstance();
      
      manager.setTheme('invalid-theme');
      
      expect(consoleSpy).toHaveBeenCalledWith('Theme invalid-theme not found');
      consoleSpy.mockRestore();
    });

    it('should notify listeners when theme changes', () => {
      const manager = ThemeManager.getInstance();
      const listener = vi.fn();
      
      manager.addListener(listener);
      manager.setTheme('ocean');
      
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ id: 'ocean' }));
    });

    it('should remove listeners correctly', () => {
      const manager = ThemeManager.getInstance();
      const listener = vi.fn();
      
      manager.addListener(listener);
      manager.removeListener(listener);
      manager.setTheme('sunset');
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should apply theme styles to document', () => {
      const manager = ThemeManager.getInstance();
      manager.setTheme('midnight');
      
      // Check that setProperty was called for colors
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--color-primary', expect.any(String));
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--color-background', expect.any(String));
      
      // Check that setProperty was called for fonts
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--font-heading', expect.any(String));
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--font-body', expect.any(String));
      
      // Check that setProperty was called for animations
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--duration-fast', expect.any(String));
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith('--easing-ease', expect.any(String));
    });
  });

  describe('AnimationManager', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
    mockElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      style: {
        setProperty: vi.fn(),
      },
    } as unknown as HTMLElement;
    });

    it('should animate element with fade animation', async () => {
      const promise = AnimationManager.animate(mockElement, {
        type: 'fade',
        direction: 'up',
        duration: 'normal',
      });

      expect(mockElement.classList.add).toHaveBeenCalledWith('animate-fade-in');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--animation-duration', 'var(--duration-normal)');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--animation-delay', '0ms');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--animation-iteration', '1');

      await promise;
      expect(mockElement.classList.remove).toHaveBeenCalledWith('animate-fade-in');
    });

    it('should animate element with slide animation', async () => {
      await AnimationManager.animate(mockElement, {
        type: 'slide',
        direction: 'up',
        duration: 'fast',
        delay: 100,
      });

      expect(mockElement.classList.add).toHaveBeenCalledWith('animate-slide-up');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--animation-duration', 'var(--duration-fast)');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--animation-delay', '100ms');
    });

    it('should animate element with scale animation', async () => {
      await AnimationManager.animate(mockElement, {
        type: 'scale',
        duration: 'slow',
        iteration: 'infinite',
      });

      expect(mockElement.classList.add).toHaveBeenCalledWith('animate-scale');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--animation-iteration', 'infinite');
    });

    it('should stagger animations correctly', async () => {
      const elements = [mockElement, mockElement, mockElement];
      
      await AnimationManager.stagger(elements, {
        type: 'fade',
        direction: 'up',
        duration: 'normal',
      }, 50);

      // Each element should have been animated with increasing delay
      expect(mockElement.classList.add).toHaveBeenCalledTimes(3);
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--animation-delay', '0ms');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--animation-delay', '50ms');
      expect(mockElement.style.setProperty).toHaveBeenCalledWith('--animation-delay', '100ms');
    });

    it('should handle different animation types', async () => {
      const animationTypes = ['bounce', 'shake', 'pulse', 'glow'] as const;
      
      for (const type of animationTypes) {
        await AnimationManager.animate(mockElement, { type });
        expect(mockElement.classList.add).toHaveBeenCalledWith(`animate-${type}`);
      }
    });
  });

  describe('InteractiveManager', () => {
    let mockElement: HTMLElement;

    beforeEach(() => {
    mockElement = {
      classList: {
        add: vi.fn(),
      },
      addEventListener: vi.fn(),
      getBoundingClientRect: vi.fn(() => ({
        left: 100,
        top: 100,
        width: 200,
        height: 50,
      })),
    } as unknown as HTMLElement;
    });

    it('should add hover effects', () => {
      InteractiveManager.addHoverEffect(mockElement, 'lift');
      expect(mockElement.classList.add).toHaveBeenCalledWith('interactive-lift');

      InteractiveManager.addHoverEffect(mockElement, 'glow');
      expect(mockElement.classList.add).toHaveBeenCalledWith('interactive-glow');
    });

    it('should add click effects', () => {
      InteractiveManager.addClickEffect(mockElement, 'ripple');
      expect(mockElement.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    });

    it('should add scroll reveal', () => {
      const mockObserver = {
        observe: vi.fn(),
        unobserve: vi.fn(),
      };
      
      // Mock IntersectionObserver
      global.IntersectionObserver = vi.fn().mockImplementation((callback) => {
        // Simulate intersection
        setTimeout(() => {
          callback([{ isIntersecting: true, target: mockElement }]);
        }, 0);
        return mockObserver;
      });

      InteractiveManager.addScrollReveal(mockElement, { threshold: 0.5 });
      
      expect(global.IntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        { threshold: 0.5 }
      );
      expect(mockObserver.observe).toHaveBeenCalledWith(mockElement);
    });

    it('should create click effect elements', () => {
      const mockBody = {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      };
      
      Object.defineProperty(global, 'document', {
        value: {
          ...mockDocument,
          body: mockBody,
          createElement: vi.fn(() => ({
            className: '',
            style: {},
          })),
        },
        writable: true,
      });

      const clickHandler = (mockElement.addEventListener as unknown as { mock: { calls: unknown[][] } }).mock.calls[0][1];
      (clickHandler as (event: { target: HTMLElement }) => void)({ target: mockElement });

      expect(mockBody.appendChild).toHaveBeenCalled();
    });
  });
});
