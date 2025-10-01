// Mobile optimization utilities for Astra Academy
// Handles responsive design, touch interactions, and mobile-specific features

export interface MobileConfig {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupport: boolean;
  devicePixelRatio: number;
}

export interface TouchGesture {
  type: 'swipe' | 'pinch' | 'tap' | 'longpress';
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  duration?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
}

// Mobile detection utilities
export class MobileDetector {
  private static instance: MobileDetector;
  private config: MobileConfig;

  private constructor() {
    this.config = this.detectMobile();
    this.setupResizeListener();
  }

  static getInstance(): MobileDetector {
    if (!MobileDetector.instance) {
      MobileDetector.instance = new MobileDetector();
    }
    return MobileDetector.instance;
  }

  private detectMobile(): MobileConfig {
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape',
        touchSupport: false,
        devicePixelRatio: 1,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Mobile detection
    const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width < 768;
    const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent) || (width >= 768 && width < 1024);
    const isDesktop = !isMobile && !isTablet;
    
    // Touch support detection
    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Orientation detection
    const orientation = height > width ? 'portrait' : 'landscape';
    
    // Device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;

    return {
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: width,
      screenHeight: height,
      orientation,
      touchSupport,
      devicePixelRatio,
    };
  }

  private setupResizeListener(): void {
    if (typeof window === 'undefined') return;
    
    let resizeTimeout: NodeJS.Timeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.config = this.detectMobile();
        this.notifyListeners();
      }, 150);
    });
  }

  private listeners: Array<(config: MobileConfig) => void> = [];

  addListener(callback: (config: MobileConfig) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (config: MobileConfig) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.config));
  }

  getConfig(): MobileConfig {
    return { ...this.config };
  }

  isMobile(): boolean {
    return this.config.isMobile;
  }

  isTablet(): boolean {
    return this.config.isTablet;
  }

  isDesktop(): boolean {
    return this.config.isDesktop;
  }

  getScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
    const width = this.config.screenWidth;
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  }

  getBreakpoint(): string {
    const size = this.getScreenSize();
    return size;
  }
}

// Touch gesture detection
export class TouchGestureDetector {
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private isTracking = false;
  private listeners: Array<(gesture: TouchGesture) => void> = [];

  constructor(private element: HTMLElement) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
  }

  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
      this.startTime = Date.now();
      this.isTracking = true;
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.isTracking || event.touches.length !== 1) return;
    
    const currentX = event.touches[0].clientX;
    const currentY = event.touches[0].clientY;
    
    const deltaX = currentX - this.startX;
    const deltaY = currentY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Detect swipe gestures
    if (distance > 50) {
      const duration = Date.now() - this.startTime;
      const direction = Math.abs(deltaX) > Math.abs(deltaY) 
        ? (deltaX > 0 ? 'right' : 'left')
        : (deltaY > 0 ? 'down' : 'up');
      
      this.emitGesture({
        type: 'swipe',
        direction,
        distance,
        duration,
        startX: this.startX,
        startY: this.startY,
        endX: currentX,
        endY: currentY,
      });
      
      this.isTracking = false;
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!this.isTracking) return;
    
    const duration = Date.now() - this.startTime;
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < 10) {
      // Tap gesture
      if (duration < 300) {
        this.emitGesture({
          type: 'tap',
          duration,
          startX: this.startX,
          startY: this.startY,
          endX,
          endY,
        });
      } else {
        // Long press
        this.emitGesture({
          type: 'longpress',
          duration,
          startX: this.startX,
          startY: this.startY,
          endX,
          endY,
        });
      }
    }
    
    this.isTracking = false;
  }

  private emitGesture(gesture: TouchGesture): void {
    this.listeners.forEach(callback => callback(gesture));
  }

  addListener(callback: (gesture: TouchGesture) => void): void {
    this.listeners.push(callback);
  }

  removeListener(callback: (gesture: TouchGesture) => void): void {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  destroy(): void {
    this.element.removeEventListener('touchstart', this.handleTouchStart);
    this.element.removeEventListener('touchmove', this.handleTouchMove);
    this.element.removeEventListener('touchend', this.handleTouchEnd);
    this.listeners = [];
  }
}

// Responsive utilities
export const responsiveUtils = {
  // Get responsive classes based on screen size
  getResponsiveClasses: (config: MobileConfig) => {
    const classes = [];
    
    if (config.isMobile) {
      classes.push('mobile-layout');
    } else if (config.isTablet) {
      classes.push('tablet-layout');
    } else {
      classes.push('desktop-layout');
    }
    
    if (config.orientation === 'portrait') {
      classes.push('portrait-orientation');
    } else {
      classes.push('landscape-orientation');
    }
    
    return classes.join(' ');
  },

  // Get appropriate font sizes
  getFontSizes: (config: MobileConfig) => {
    if (config.isMobile) {
      return {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
      };
    } else if (config.isTablet) {
      return {
        xs: 'text-sm',
        sm: 'text-base',
        base: 'text-lg',
        lg: 'text-xl',
        xl: 'text-2xl',
        '2xl': 'text-3xl',
        '3xl': 'text-4xl',
      };
    } else {
      return {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
      };
    }
  },

  // Get appropriate spacing
  getSpacing: (config: MobileConfig) => {
    if (config.isMobile) {
      return {
        xs: 'p-2',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      };
    } else if (config.isTablet) {
      return {
        xs: 'p-3',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      };
    } else {
      return {
        xs: 'p-2',
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
        xl: 'p-8',
      };
    }
  },

  // Get appropriate grid columns
  getGridColumns: (config: MobileConfig, baseColumns: number) => {
    if (config.isMobile) {
      return Math.min(baseColumns, 1);
    } else if (config.isTablet) {
      return Math.min(baseColumns, 2);
    } else {
      return baseColumns;
    }
  },

  // Get appropriate button sizes
  getButtonSizes: (config: MobileConfig) => {
    if (config.isMobile) {
      return {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      };
    } else if (config.isTablet) {
      return {
        sm: 'h-10 px-4 text-sm',
        md: 'h-12 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
      };
    } else {
      return {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-8 text-base',
      };
    }
  },
};

// Mobile-specific optimizations
export const mobileOptimizations = {
  // Prevent zoom on input focus (iOS)
  preventZoomOnFocus: () => {
    if (typeof window === 'undefined') return;
    
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  },

  // Add touch-friendly styles
  addTouchStyles: () => {
    if (typeof document === 'undefined') return;
    
    const style = document.createElement('style');
    style.textContent = `
      .touch-friendly {
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
        user-select: none;
      }
      
      .touch-friendly:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
      }
      
      .mobile-scroll {
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }
      
      .mobile-input {
        font-size: 16px; /* Prevents zoom on iOS */
      }
    `;
    document.head.appendChild(style);
  },

  // Optimize images for mobile
  getOptimizedImageSrc: (src: string, config: MobileConfig): string => {
    if (config.devicePixelRatio > 1) {
      // Return high-res version for retina displays
      return src.replace(/\.(jpg|jpeg|png|webp)$/, '@2x.$1');
    }
    return src;
  },

  // Get appropriate image sizes
  getImageSizes: (config: MobileConfig) => {
    if (config.isMobile) {
      return {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48',
      };
    } else if (config.isTablet) {
      return {
        sm: 'w-20 h-20',
        md: 'w-32 h-32',
        lg: 'w-40 h-40',
        xl: 'w-56 h-56',
      };
    } else {
      return {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32',
      };
    }
  },
};

// Export singleton instance
export const mobileDetector = MobileDetector.getInstance();
