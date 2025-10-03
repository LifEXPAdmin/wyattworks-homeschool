"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/logo";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
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
  PieChart,
  UserCircle,
  Crown,
  Brain,
  FileText,
  Home as HomeIcon,
} from "lucide-react";
import {
  MobileDetector,
  TouchGestureDetector,
  responsiveUtils,
  mobileOptimizations,
  type MobileConfig,
  type TouchGesture,
} from "@/lib/mobile-utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ children, className }: MobileLayoutProps) {
  const [mobileConfig, setMobileConfig] = useState<MobileConfig>(() => {
    try {
      return MobileDetector.getInstance().getConfig();
    } catch (error) {
      console.error("Error initializing mobile config:", error);
      // Fallback config
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: "landscape",
        touchSupport: false,
        devicePixelRatio: 1,
      };
    }
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const layoutRef = useRef<HTMLDivElement>(null);
  const gestureDetectorRef = useRef<TouchGestureDetector | null>(null);

  useEffect(() => {
    try {
      // Add mobile optimizations
      mobileOptimizations.preventZoomOnFocus();
      mobileOptimizations.addTouchStyles();

      // Listen for mobile config changes
      const handleConfigChange = (config: MobileConfig) => {
        setMobileConfig(config);
      };

      MobileDetector.getInstance().addListener(handleConfigChange);

      // Setup gesture detection
      if (layoutRef.current && mobileConfig.touchSupport) {
        gestureDetectorRef.current = new TouchGestureDetector(layoutRef.current);

        gestureDetectorRef.current.addListener(handleGesture);
      }

      return () => {
        MobileDetector.getInstance().removeListener(handleConfigChange);
        if (gestureDetectorRef.current) {
          gestureDetectorRef.current.destroy();
        }
      };
    } catch (error) {
      console.error("Error in MobileLayout useEffect:", error);
    }
  }, [mobileConfig.touchSupport]);

  const handleGesture = React.useCallback(
    (gesture: TouchGesture) => {
      switch (gesture.type) {
        case "swipe":
          if (gesture.direction === "left" && isMenuOpen) {
            setIsMenuOpen(false);
          } else if (gesture.direction === "right" && !isMenuOpen) {
            setIsMenuOpen(true);
          }
          break;
        case "tap":
          // Close menu on tap outside
          if (isMenuOpen) {
            setIsMenuOpen(false);
          }
          break;
      }
    },
    [isMenuOpen]
  );

  const responsiveClasses = responsiveUtils.getResponsiveClasses(mobileConfig);
  const fontSizes = responsiveUtils.getFontSizes(mobileConfig);
  const spacing = responsiveUtils.getSpacing(mobileConfig);
  const buttonSizes = responsiveUtils.getButtonSizes(mobileConfig);

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Start Building", href: "/dashboard/build" },
    { icon: FileText, label: "Create Worksheet", href: "/dashboard/create" },
    { icon: Brain, label: "Test Knowledge", href: "/dashboard/quiz" },
    { icon: BarChart3, label: "Progress", href: "/dashboard/progress" },
    { icon: PieChart, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Palette, label: "Design", href: "/dashboard/design" },
    { icon: Crown, label: "Subscription", href: "/dashboard/subscription" },
    { icon: UserCircle, label: "Profile", href: "/dashboard/profile" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  return (
    <div ref={layoutRef} className={`bg-background min-h-screen ${responsiveClasses} ${className}`}>
      {/* Mobile Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="text-primary hover:text-primary/80 font-bold transition-colors"
              >
                <Logo size="md" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-2 md:flex">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/dashboard/build">
                  <Button>Start Building</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/build">
                  <Button variant="ghost" size="sm">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Create
                  </Button>
                </Link>
                <Link href="/dashboard/worksheets">
                  <Button variant="ghost" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Worksheets
                  </Button>
                </Link>
                <Link href="/dashboard/analytics">
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/dashboard/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </SignedIn>
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

              {/* Desktop Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Desktop User Button */}
              <div className="hidden md:block">
                <SignedIn>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10",
                      },
                    }}
                  />
                </SignedIn>
              </div>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && mobileConfig.isMobile && (
            <div className="pb-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search worksheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${spacing.md} mobile-input touch-friendly rounded-lg border pr-4 pl-10`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Desktop Mobile Menu Dropdown */}
        {isMenuOpen && !mobileConfig.isMobile && (
          <div className="bg-background/95 border-t backdrop-blur md:hidden">
            <div className="container mx-auto space-y-2 px-4 py-4">
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/build" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create Worksheets
                </Button>
              </Link>
              <Link href="/dashboard/worksheets" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  My Worksheets
                </Button>
              </Link>
              <Link href="/dashboard/analytics" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/dashboard/settings" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Overlay */}
      {isMenuOpen && mobileConfig.isMobile && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div
            className="bg-background fixed top-0 left-0 h-full w-80 border-r shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`${spacing.lg}`}>
              <div className="mb-6 flex items-center justify-between">
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
                  <Link key={item.label} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start ${buttonSizes.md} touch-friendly`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>

              {/* Mobile-specific quick actions */}
              <div className="mt-8">
                <h3 className={`mb-4 font-medium ${fontSizes.sm} text-muted-foreground`}>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link href="/dashboard/create">
                    <Button
                      variant="outline"
                      className={`w-full ${buttonSizes.sm} touch-friendly`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      New Math Worksheet
                    </Button>
                  </Link>
                  <Link href="/dashboard/subscription">
                    <Button
                      variant="outline"
                      className={`w-full ${buttonSizes.sm} touch-friendly border-blue-200 text-blue-700`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Manage Subscription
                    </Button>
                  </Link>
                  <Link href="/dashboard/progress">
                    <Button
                      variant="outline"
                      className={`w-full ${buttonSizes.sm} touch-friendly`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Progress
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`container mx-auto px-4 py-6 sm:px-6 lg:px-8 ${mobileConfig.isMobile ? "mobile-scroll" : ""}`}
      >
        {/* Mobile-specific content adjustments */}
        {mobileConfig.isMobile && (
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                📱 Mobile View
              </Badge>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>Swipe</span>
                <ArrowLeft className="h-3 w-3" />
                <span>for menu</span>
              </div>
            </div>
          </div>
        )}

        {/* Responsive content */}
        <div className={`${mobileConfig.isMobile ? "space-y-4" : "space-y-6"}`}>{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      {mobileConfig.isMobile && (
        <nav className="bg-background fixed right-0 bottom-0 left-0 z-40 border-t">
          <div className="flex items-center justify-around py-2">
            {navigationItems.slice(0, 4).map((item) => (
              <Link key={item.label} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex flex-col items-center ${spacing.sm} touch-friendly`}
                >
                  <item.icon className="mb-1 h-4 w-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Mobile-specific styles */}
      <style jsx>{`
        .mobile-scroll {
          padding-bottom: ${mobileConfig.isMobile ? "80px" : "0"};
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
  const [mobileConfig] = useState<MobileConfig>(() => {
    try {
      return MobileDetector.getInstance().getConfig();
    } catch (error) {
      console.error("Error initializing mobile config in MobileCard:", error);
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: "landscape",
        touchSupport: false,
        devicePixelRatio: 1,
      };
    }
  });
  const spacing = responsiveUtils.getSpacing(mobileConfig);
  const fontSizes = responsiveUtils.getFontSizes(mobileConfig);

  return (
    <Card
      className={`${mobileConfig.isMobile ? "touch-friendly" : ""} ${className}`}
      onClick={onClick}
    >
      <CardHeader className={`${spacing.md}`}>
        <CardTitle className={fontSizes.lg}>{title}</CardTitle>
        {description && <CardDescription className={fontSizes.sm}>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={`${spacing.md}`}>{children}</CardContent>
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
  disabled,
}: MobileButtonProps) {
  const [mobileConfig] = useState<MobileConfig>(() => {
    try {
      return MobileDetector.getInstance().getConfig();
    } catch (error) {
      console.error("Error initializing mobile config in MobileButton:", error);
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: "landscape",
        touchSupport: false,
        devicePixelRatio: 1,
      };
    }
  });
  const buttonSizes = responsiveUtils.getButtonSizes(mobileConfig);

  return (
    <Button
      variant={variant}
      className={`${buttonSizes[size]} ${mobileConfig.isMobile ? "touch-friendly" : ""} ${className}`}
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
  const [mobileConfig] = useState<MobileConfig>(() => {
    try {
      return MobileDetector.getInstance().getConfig();
    } catch (error) {
      console.error("Error initializing mobile config in MobileGrid:", error);
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: "landscape",
        touchSupport: false,
        devicePixelRatio: 1,
      };
    }
  });
  const responsiveColumns = responsiveUtils.getGridColumns(mobileConfig, columns);

  const gapClasses = {
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <div className={`grid grid-cols-${responsiveColumns} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}
