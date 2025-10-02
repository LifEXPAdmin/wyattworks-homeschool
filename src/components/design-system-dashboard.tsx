"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Sparkles,
  Zap,
  Eye,
  Download,
  Settings,
  Wand2,
  Star,
  Heart,
  Leaf,
  Waves,
  Sunset,
  Moon,
} from "lucide-react";
// import { THEMES, themeManager, AnimationManager, InteractiveManager } from '@/lib/design-system';

interface ThemeSelectorProps {
  onThemeChange?: (themeId: string) => void;
  className?: string;
}

export function ThemeSelector({ onThemeChange, className }: ThemeSelectorProps) {
  const [currentTheme, setCurrentTheme] = useState(themeManager.getCurrentTheme());
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const handleThemeChange = (theme: (typeof THEMES)[0]) => {
      setCurrentTheme(theme);
      onThemeChange?.(theme.id);
    };

    themeManager.addListener(handleThemeChange);
    return () => themeManager.removeListener(handleThemeChange);
  }, [onThemeChange]);

  const handleThemeSelect = async (themeId: string) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setPreviewTheme(themeId);

    // Animate theme change
    const themeElement = document.getElementById(`theme-${themeId}`);
    if (themeElement) {
      await AnimationManager.animate(themeElement, {
        type: "scale",
        duration: "fast",
      });
    }

    themeManager.setTheme(themeId);
    setPreviewTheme(null);
    setIsAnimating(false);
  };

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case "default":
        return <Palette className="h-4 w-4" />;
      case "warm":
        return <Heart className="h-4 w-4" />;
      case "nature":
        return <Leaf className="h-4 w-4" />;
      case "ocean":
        return <Waves className="h-4 w-4" />;
      case "sunset":
        return <Sunset className="h-4 w-4" />;
      case "midnight":
        return <Moon className="h-4 w-4" />;
      default:
        return <Palette className="h-4 w-4" />;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Selector
          </CardTitle>
          <CardDescription>
            Choose a theme that matches your teaching style and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {THEMES.map((theme) => (
              <div
                key={theme.id}
                id={`theme-${theme.id}`}
                className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                  currentTheme.id === theme.id ? "ring-primary ring-2" : ""
                } ${previewTheme === theme.id ? "opacity-75" : ""}`}
                onClick={() => handleThemeSelect(theme.id)}
              >
                <Card className={`h-full ${theme.preview}`}>
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getThemeIcon(theme.id)}
                        <h3 className="font-semibold">{theme.name}</h3>
                      </div>
                      {currentTheme.id === theme.id && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground mb-4 text-sm">{theme.description}</p>

                    {/* Color preview */}
                    <div className="mb-3 flex gap-1">
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent"
                      />
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: theme.colors.success }}
                        title="Success"
                      />
                    </div>

                    {/* Font preview */}
                    <div className="text-xs" style={{ fontFamily: theme.fonts.heading }}>
                      Sample Text
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface AnimationDemoProps {
  className?: string;
}

export function AnimationDemo({ className }: AnimationDemoProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animationType, setAnimationType] = useState<"fade" | "slide" | "scale" | "bounce">("fade");

  const triggerAnimation = async () => {
    const element = document.getElementById("demo-element");
    if (!element) return;

    setIsVisible(false);
    await new Promise((resolve) => setTimeout(resolve, 100));

    setIsVisible(true);
    await AnimationManager.animate(element, {
      type: animationType,
      direction: "up",
      duration: "normal",
    });
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Animation Demo
          </CardTitle>
          <CardDescription>See how animations enhance the user experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["fade", "slide", "scale", "bounce"] as const).map((type) => (
              <Button
                key={type}
                variant={animationType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setAnimationType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="flex justify-center">
            <Button onClick={triggerAnimation} className="gap-2">
              <Zap className="h-4 w-4" />
              Trigger Animation
            </Button>
          </div>

          <div className="flex justify-center">
            <div
              id="demo-element"
              className={`bg-primary text-primary-foreground flex h-32 w-32 items-center justify-center rounded-lg font-semibold transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <Star className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface InteractiveElementsProps {
  className?: string;
}

export function InteractiveElements({ className }: InteractiveElementsProps) {
  useEffect(() => {
    // Add interactive effects to demo elements
    const liftElements = document.querySelectorAll(".demo-lift");
    const glowElements = document.querySelectorAll(".demo-glow");
    const rippleElements = document.querySelectorAll(".demo-ripple");

    liftElements.forEach((el) => InteractiveManager.addHoverEffect(el as HTMLElement, "lift"));
    glowElements.forEach((el) => InteractiveManager.addHoverEffect(el as HTMLElement, "glow"));
    rippleElements.forEach((el) => InteractiveManager.addClickEffect(el as HTMLElement, "ripple"));
  }, []);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Interactive Elements
          </CardTitle>
          <CardDescription>
            Hover and click effects that make the interface feel alive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2 text-center">
              <h4 className="font-semibold">Hover Effects</h4>
              <div className="space-y-2">
                <Button className="demo-lift w-full">Lift Effect</Button>
                <Button className="demo-glow w-full">Glow Effect</Button>
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h4 className="font-semibold">Click Effects</h4>
              <div className="space-y-2">
                <Button className="demo-ripple w-full">Ripple Effect</Button>
                <Button className="w-full">Standard Button</Button>
              </div>
            </div>

            <div className="space-y-2 text-center">
              <h4 className="font-semibold">Scroll Reveal</h4>
              <div className="space-y-2">
                <div className="bg-muted flex h-20 items-center justify-center rounded-lg">
                  Scroll to reveal
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function DesignSystemDashboard() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Design System</h1>
        <p className="text-muted-foreground">Customize the look and feel of Astra Academy</p>
      </div>

      <Tabs defaultValue="themes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="themes">Themes</TabsTrigger>
          <TabsTrigger value="animations">Animations</TabsTrigger>
          <TabsTrigger value="interactive">Interactive</TabsTrigger>
        </TabsList>

        <TabsContent value="themes" className="space-y-6">
          <ThemeSelector />
        </TabsContent>

        <TabsContent value="animations" className="space-y-6">
          <AnimationDemo />
        </TabsContent>

        <TabsContent value="interactive" className="space-y-6">
          <InteractiveElements />
        </TabsContent>
      </Tabs>
    </div>
  );
}
