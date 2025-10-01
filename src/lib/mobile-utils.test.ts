import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  MobileDetector,
  TouchGestureDetector,
  responsiveUtils,
  mobileOptimizations,
  type MobileConfig,
} from "./mobile-utils";

// Mock window and navigator
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  devicePixelRatio: 1,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

const mockNavigator = {
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  maxTouchPoints: 0,
};

Object.defineProperty(global, "window", {
  value: mockWindow,
  writable: true,
});

Object.defineProperty(global, "navigator", {
  value: mockNavigator,
  writable: true,
});

// Mock document
const mockDocument = {
  querySelector: vi.fn(),
  createElement: vi.fn(),
  head: {
    appendChild: vi.fn(),
  },
};

Object.defineProperty(global, "document", {
  value: mockDocument,
  writable: true,
});

describe("MobileDetector", () => {
  let detector: MobileDetector;

  beforeEach(() => {
    // Reset mocks
    mockWindow.innerWidth = 1024;
    mockWindow.innerHeight = 768;
    mockWindow.devicePixelRatio = 1;
    mockNavigator.userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    mockNavigator.maxTouchPoints = 0;
    
    // Get fresh instance
    detector = MobileDetector.getInstance();
  });

  describe("Desktop Detection", () => {
    it("should detect desktop correctly", () => {
      const config = detector.getConfig();
      
      expect(config.isDesktop).toBe(true);
      expect(config.isMobile).toBe(false);
      expect(config.isTablet).toBe(false);
      expect(config.screenWidth).toBe(1024);
      expect(config.screenHeight).toBe(768);
      expect(config.orientation).toBe("landscape");
      expect(config.touchSupport).toBe(false);
    });

    it("should detect portrait orientation", () => {
      mockWindow.innerWidth = 768;
      mockWindow.innerHeight = 1024;
      
      const config = detector.getConfig();
      expect(config.orientation).toBe("portrait");
    });
  });

  describe("Mobile Detection", () => {
    it("should detect mobile by user agent", () => {
      mockNavigator.userAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)";
      
      const config = detector.getConfig();
      expect(config.isMobile).toBe(true);
      expect(config.isDesktop).toBe(false);
    });

    it("should detect mobile by screen width", () => {
      mockWindow.innerWidth = 375;
      mockWindow.innerHeight = 667;
      
      const config = detector.getConfig();
      expect(config.isMobile).toBe(true);
      expect(config.isDesktop).toBe(false);
    });

    it("should detect touch support", () => {
      mockNavigator.maxTouchPoints = 5;
      
      const config = detector.getConfig();
      expect(config.touchSupport).toBe(true);
    });
  });

  describe("Tablet Detection", () => {
    it("should detect tablet by user agent", () => {
      mockNavigator.userAgent = "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)";
      
      const config = detector.getConfig();
      expect(config.isTablet).toBe(true);
      expect(config.isMobile).toBe(false);
      expect(config.isDesktop).toBe(false);
    });

    it("should detect tablet by screen width", () => {
      mockWindow.innerWidth = 768;
      mockWindow.innerHeight = 1024;
      
      const config = detector.getConfig();
      expect(config.isTablet).toBe(true);
    });
  });

  describe("Screen Size Classification", () => {
    it("should classify screen sizes correctly", () => {
      const testCases = [
        { width: 320, expected: "xs" },
        { width: 640, expected: "sm" },
        { width: 768, expected: "md" },
        { width: 1024, expected: "lg" },
        { width: 1280, expected: "xl" },
        { width: 1536, expected: "2xl" },
      ];

      testCases.forEach(({ width, expected }) => {
        mockWindow.innerWidth = width;
        const size = detector.getScreenSize();
        expect(size).toBe(expected);
      });
    });
  });

  describe("Event Listeners", () => {
    it("should add and remove listeners", () => {
      const callback = vi.fn();
      
      detector.addListener(callback);
      expect(detector["listeners"]).toContain(callback);
      
      detector.removeListener(callback);
      expect(detector["listeners"]).not.toContain(callback);
    });

    it("should notify listeners on resize", () => {
      const callback = vi.fn();
      detector.addListener(callback);
      
      // Simulate resize
      mockWindow.innerWidth = 375;
      detector["notifyListeners"]();
      
      expect(callback).toHaveBeenCalledWith(detector.getConfig());
    });
  });
});

describe("TouchGestureDetector", () => {
  let mockElement: HTMLElement;
  let detector: TouchGestureDetector;

  beforeEach(() => {
    mockElement = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as HTMLElement;
    
    detector = new TouchGestureDetector(mockElement);
  });

  afterEach(() => {
    detector.destroy();
  });

  it("should setup event listeners on construction", () => {
    expect(mockElement.addEventListener).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function),
      { passive: true }
    );
    expect(mockElement.addEventListener).toHaveBeenCalledWith(
      "touchmove",
      expect.any(Function),
      { passive: true }
    );
    expect(mockElement.addEventListener).toHaveBeenCalledWith(
      "touchend",
      expect.any(Function),
      { passive: true }
    );
  });

  it("should detect tap gestures", () => {
    const callback = vi.fn();
    detector.addListener(callback);

    // Simulate tap
    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as unknown as TouchEvent;
    
    const touchEndEvent = {
      changedTouches: [{ clientX: 105, clientY: 105 }],
    } as unknown as TouchEvent;

    detector["handleTouchStart"](touchStartEvent);
    
    // Small delay to simulate quick tap
    setTimeout(() => {
      detector["handleTouchEnd"](touchEndEvent);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "tap",
          startX: 100,
          startY: 100,
          endX: 105,
          endY: 105,
        })
      );
    }, 100);
  });

  it("should detect swipe gestures", () => {
    const callback = vi.fn();
    detector.addListener(callback);

    // Simulate swipe right
    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as unknown as TouchEvent;
    
    const touchMoveEvent = {
      touches: [{ clientX: 200, clientY: 100 }],
    } as unknown as TouchEvent;

    detector["handleTouchStart"](touchStartEvent);
    detector["handleTouchMove"](touchMoveEvent);

    expect(callback).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "swipe",
        direction: "right",
        distance: 100,
        startX: 100,
        startY: 100,
        endX: 200,
        endY: 100,
      })
    );
  });

  it("should detect long press gestures", () => {
    const callback = vi.fn();
    detector.addListener(callback);

    // Simulate long press
    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 100 }],
    } as unknown as TouchEvent;
    
    const touchEndEvent = {
      changedTouches: [{ clientX: 100, clientY: 100 }],
    } as unknown as TouchEvent;

    detector["handleTouchStart"](touchStartEvent);
    
    // Simulate long press duration
    setTimeout(() => {
      detector["handleTouchEnd"](touchEndEvent);
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "longpress",
          startX: 100,
          startY: 100,
        })
      );
    }, 500);
  });

  it("should add and remove listeners", () => {
    const callback = vi.fn();
    
    detector.addListener(callback);
    expect(detector["listeners"]).toContain(callback);
    
    detector.removeListener(callback);
    expect(detector["listeners"]).not.toContain(callback);
  });

  it("should destroy properly", () => {
    detector.destroy();
    expect(mockElement.removeEventListener).toHaveBeenCalled();
    expect(detector["listeners"]).toHaveLength(0);
  });
});

describe("Responsive Utils", () => {
  const mobileConfig: MobileConfig = {
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    screenWidth: 375,
    screenHeight: 667,
    orientation: "portrait",
    touchSupport: true,
    devicePixelRatio: 2,
  };

  const tabletConfig: MobileConfig = {
    isMobile: false,
    isTablet: true,
    isDesktop: false,
    screenWidth: 768,
    screenHeight: 1024,
    orientation: "portrait",
    touchSupport: true,
    devicePixelRatio: 2,
  };

  const desktopConfig: MobileConfig = {
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1920,
    screenHeight: 1080,
    orientation: "landscape",
    touchSupport: false,
    devicePixelRatio: 1,
  };

  describe("getResponsiveClasses", () => {
    it("should return mobile classes for mobile config", () => {
      const classes = responsiveUtils.getResponsiveClasses(mobileConfig);
      expect(classes).toContain("mobile-layout");
      expect(classes).toContain("portrait-orientation");
    });

    it("should return tablet classes for tablet config", () => {
      const classes = responsiveUtils.getResponsiveClasses(tabletConfig);
      expect(classes).toContain("tablet-layout");
      expect(classes).toContain("portrait-orientation");
    });

    it("should return desktop classes for desktop config", () => {
      const classes = responsiveUtils.getResponsiveClasses(desktopConfig);
      expect(classes).toContain("desktop-layout");
      expect(classes).toContain("landscape-orientation");
    });
  });

  describe("getFontSizes", () => {
    it("should return appropriate font sizes for mobile", () => {
      const fontSizes = responsiveUtils.getFontSizes(mobileConfig);
      expect(fontSizes.base).toBe("text-base");
      expect(fontSizes.lg).toBe("text-lg");
    });

    it("should return appropriate font sizes for tablet", () => {
      const fontSizes = responsiveUtils.getFontSizes(tabletConfig);
      expect(fontSizes.base).toBe("text-lg");
      expect(fontSizes.lg).toBe("text-xl");
    });

    it("should return appropriate font sizes for desktop", () => {
      const fontSizes = responsiveUtils.getFontSizes(desktopConfig);
      expect(fontSizes.base).toBe("text-base");
      expect(fontSizes.lg).toBe("text-lg");
    });
  });

  describe("getSpacing", () => {
    it("should return appropriate spacing for mobile", () => {
      const spacing = responsiveUtils.getSpacing(mobileConfig);
      expect(spacing.md).toBe("p-4");
      expect(spacing.lg).toBe("p-6");
    });

    it("should return appropriate spacing for tablet", () => {
      const spacing = responsiveUtils.getSpacing(tabletConfig);
      expect(spacing.md).toBe("p-6");
      expect(spacing.lg).toBe("p-8");
    });
  });

  describe("getGridColumns", () => {
    it("should limit columns for mobile", () => {
      const columns = responsiveUtils.getGridColumns(mobileConfig, 4);
      expect(columns).toBe(1);
    });

    it("should limit columns for tablet", () => {
      const columns = responsiveUtils.getGridColumns(tabletConfig, 4);
      expect(columns).toBe(2);
    });

    it("should allow all columns for desktop", () => {
      const columns = responsiveUtils.getGridColumns(desktopConfig, 4);
      expect(columns).toBe(4);
    });
  });

  describe("getButtonSizes", () => {
    it("should return touch-friendly button sizes for mobile", () => {
      const buttonSizes = responsiveUtils.getButtonSizes(mobileConfig);
      expect(buttonSizes.md).toBe("h-12 px-6 text-base");
    });

    it("should return appropriate button sizes for tablet", () => {
      const buttonSizes = responsiveUtils.getButtonSizes(tabletConfig);
      expect(buttonSizes.md).toBe("h-12 px-6 text-base");
    });

    it("should return compact button sizes for desktop", () => {
      const buttonSizes = responsiveUtils.getButtonSizes(desktopConfig);
      expect(buttonSizes.md).toBe("h-10 px-4 text-sm");
    });
  });
});

describe("Mobile Optimizations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("preventZoomOnFocus", () => {
    it("should update viewport meta tag", () => {
      const mockViewport = {
        setAttribute: vi.fn(),
      };
      mockDocument.querySelector.mockReturnValue(mockViewport);

      mobileOptimizations.preventZoomOnFocus();

      expect(mockDocument.querySelector).toHaveBeenCalledWith('meta[name="viewport"]');
      expect(mockViewport.setAttribute).toHaveBeenCalledWith(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
      );
    });
  });

  describe("addTouchStyles", () => {
    it("should add touch-friendly styles to document", () => {
      const mockStyle = {
        textContent: "",
      };
      mockDocument.createElement.mockReturnValue(mockStyle);

      mobileOptimizations.addTouchStyles();

      expect(mockDocument.createElement).toHaveBeenCalledWith("style");
      expect(mockStyle.textContent).toContain(".touch-friendly");
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(mockStyle);
    });
  });

  describe("getOptimizedImageSrc", () => {
    it("should return high-res version for retina displays", () => {
      const config: MobileConfig = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenWidth: 375,
        screenHeight: 667,
        orientation: "portrait",
        touchSupport: true,
        devicePixelRatio: 2,
      };

      const src = mobileOptimizations.getOptimizedImageSrc("image.jpg", config);
      expect(src).toBe("image@2x.jpg");
    });

    it("should return original src for non-retina displays", () => {
      const config: MobileConfig = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenWidth: 375,
        screenHeight: 667,
        orientation: "portrait",
        touchSupport: true,
        devicePixelRatio: 1,
      };

      const src = mobileOptimizations.getOptimizedImageSrc("image.jpg", config);
      expect(src).toBe("image.jpg");
    });
  });

  describe("getImageSizes", () => {
    it("should return appropriate image sizes for mobile", () => {
      const config: MobileConfig = {
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        screenWidth: 375,
        screenHeight: 667,
        orientation: "portrait",
        touchSupport: true,
        devicePixelRatio: 2,
      };

      const sizes = mobileOptimizations.getImageSizes(config);
      expect(sizes.md).toBe("w-24 h-24");
    });

    it("should return appropriate image sizes for tablet", () => {
      const config: MobileConfig = {
        isMobile: false,
        isTablet: true,
        isDesktop: false,
        screenWidth: 768,
        screenHeight: 1024,
        orientation: "portrait",
        touchSupport: true,
        devicePixelRatio: 2,
      };

      const sizes = mobileOptimizations.getImageSizes(config);
      expect(sizes.md).toBe("w-32 h-32");
    });

    it("should return appropriate image sizes for desktop", () => {
      const config: MobileConfig = {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: "landscape",
        touchSupport: false,
        devicePixelRatio: 1,
      };

      const sizes = mobileOptimizations.getImageSizes(config);
      expect(sizes.md).toBe("w-16 h-16");
    });
  });
});

describe("MobileDetector Singleton", () => {
  it("should return the same instance", () => {
    const instance1 = MobileDetector.getInstance();
    const instance2 = MobileDetector.getInstance();
    
    expect(instance1).toBe(instance2);
  });
});
