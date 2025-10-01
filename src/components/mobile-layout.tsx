"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  X, 
  Search, 
  Settings, 
  Home, 
  BookOpen, 
  BarChart3,
  ArrowLeft,
  Palette,
  PieChart
} from "lucide-react";
import { 
  mobileDetector, 
  TouchGestureDetector, 
  responsiveUtils, 
  mobileOptimizations,
  type MobileConfig,
  type TouchGesture 
} from "@/lib/mobile-utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
  const [mobileConfig, setMobileConfig] = useState<MobileConfig>(mobileDetector.getConfig());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const layoutRef = useRef<HTMLDivElement>(null);
  const gestureDetectorRef = useRef<TouchGestureDetector | null>(null);

  useEffect(() => {
    // Add mobile optimizations
    mobileOptimizations.preventZoomOnFocus();
    mobileOptimizations.addTouchStyles();

    // Listen for mobile config changes
    const handleConfigChange = (config: MobileConfig) => {
      setMobileConfig(config);
    };

    mobileDetector.addListener(handleConfigChange);

    // Setup gesture detection
    if (layoutRef.current && mobileConfig.touchSupport) {
      gestureDetectorRef.current = new TouchGestureDetector(layoutRef.current);
      
      gestureDetectorRef.current.addListener(handleGesture);
    }

    return () => {
      mobileDetector.removeListener(handleConfigChange);
      if (gestureDetectorRef.current) {
        gestureDetectorRef.current.destroy();
      }
    };
  }, [mobileConfig.touchSupport]);

  const handleGesture = React.useCallback((gesture: TouchGesture) => {
    switch (gesture.type) {
      case 'swipe':
        if (gesture.direction === 'left' && isMenuOpen) {
          setIsMenuOpen(false);
        } else if (gesture.direction === 'right' && !isMenuOpen) {
          setIsMenuOpen(true);
        }
        break;
      case 'tap':
        // Close menu on tap outside
        if (isMenuOpen) {
          setIsMenuOpen(false);
        }
        break;
    }
  }, [isMenuOpen]);

  const responsiveClasses = responsiveUtils.getResponsiveClasses(mobileConfig);
  const fontSizes = responsiveUtils.getFontSizes(mobileConfig);
  const spacing = responsiveUtils.getSpacing(mobileConfig);
  const buttonSizes = responsiveUtils.getButtonSizes(mobileConfig);

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Create Worksheet", href: "/dashboard/create" },
    { icon: BarChart3, label: "Progress", href: "/dashboard/progress" },
    { icon: PieChart, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Palette, label: "Design", href: "/dashboard/design" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div 
      ref={layoutRef}
      className={`min-h-screen bg-background ${responsiveClasses} ${className}`}
    >
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <span className={`text-primary font-bold ${fontSizes['2xl']}`}>
                <span className="flex items-center gap-2">
                  <span className="text-3xl">✨</span>
                  <span>Astra Academy</span>
                </span>
              </span>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2">
              {mobileConfig.isMobile && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="touch-friendly"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="touch-friendly"
                  >
                    {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && mobileConfig.isMobile && (
            <div className="pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search worksheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${spacing.md} pl-10 pr-4 border rounded-lg mobile-input touch-friendly`}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && mobileConfig.isMobile && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed left-0 top-0 h-full w-80 bg-background border-r shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${spacing.lg}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`font-semibold ${fontSizes.lg}`}>Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMenuOpen(false)}
                  className="touch-friendly"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className={`w-full justify-start ${buttonSizes.md} touch-friendly`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      // In a real app, you'd navigate here
                    }}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                  </Button>
                ))}
              </nav>

              {/* Mobile-specific quick actions */}
              <div className="mt-8">
                <h3 className={`font-medium mb-4 ${fontSizes.sm} text-muted-foreground`}>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className={`w-full ${buttonSizes.sm} touch-friendly`}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    New Math Worksheet
                  </Button>
                  <Button
                    variant="outline"
                    className={`w-full ${buttonSizes.sm} touch-friendly`}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Progress
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`container mx-auto px-4 py-6 sm:px-6 lg:px-8 ${mobileConfig.isMobile ? 'mobile-scroll' : ''}`}>
        {/* Mobile-specific content adjustments */}
        {mobileConfig.isMobile && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                📱 Mobile View
              </Badge>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Swipe</span>
                <ArrowLeft className="h-3 w-3" />
                <span>for menu</span>
              </div>
            </div>
          </div>
        )}

        {/* Responsive content */}
        <div className={`${mobileConfig.isMobile ? 'space-y-4' : 'space-y-6'}`}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {mobileConfig.isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-40">
          <div className="flex items-center justify-around py-2">
            {navigationItems.slice(0, 4).map((item, index) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center ${spacing.sm} touch-friendly`}
                onClick={() => {
                  // In a real app, you'd navigate here
                }}
              >
                <item.icon className="h-4 w-4 mb-1" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </nav>
      )}

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-scroll {
          padding-bottom: ${mobileConfig.isMobile ? '80px' : '0'};
        }
        
        .touch-friendly {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        
        .touch-friendly:active {
          transform: scale(0.98);
          transition: transform 0.1s ease;
        }
        
        @media (max-width: 768px) {
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

// Mobile-optimized Card component
interface MobileCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ title, description, children, className, onClick }: MobileCardProps) {
  const [mobileConfig] = useState<MobileConfig>(mobileDetector.getConfig());
  const spacing = responsiveUtils.getSpacing(mobileConfig);
  const fontSizes = responsiveUtils.getFontSizes(mobileConfig);

  return (
    <Card 
      className={`${mobileConfig.isMobile ? 'touch-friendly' : ''} ${className}`}
      onClick={onClick}
    >
      <CardHeader className={`${spacing.md}`}>
        <CardTitle className={fontSizes.lg}>{title}</CardTitle>
        {description && (
          <CardDescription className={fontSizes.sm}>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className={`${spacing.md}`}>
        {children}
      </CardContent>
    </Card>
  );
}

// Mobile-optimized Button component
interface MobileButtonProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function MobileButton({ 
  children, 
  variant = "default", 
  size = "md", 
  className, 
  onClick, 
  disabled 
}: MobileButtonProps) {
  const [mobileConfig] = useState<MobileConfig>(mobileDetector.getConfig());
  const buttonSizes = responsiveUtils.getButtonSizes(mobileConfig);

  return (
    <Button
      variant={variant}
      className={`${buttonSizes[size]} ${mobileConfig.isMobile ? 'touch-friendly' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

// Mobile-optimized Grid component
interface MobileGridProps {
  children: React.ReactNode;
  columns?: number;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function MobileGrid({ children, columns = 2, gap = "md", className }: MobileGridProps) {
  const [mobileConfig] = useState<MobileConfig>(mobileDetector.getConfig());
  const responsiveColumns = responsiveUtils.getGridColumns(mobileConfig, columns);
  
  const gapClasses = {
    sm: "gap-2",
    md: "gap-4", 
    lg: "gap-6",
  };

  return (
    <div 
      className={`grid grid-cols-${responsiveColumns} ${gapClasses[gap]} ${className}`}
    >
      {children}
    </div>
  );
}
