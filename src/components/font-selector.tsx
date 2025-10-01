"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, X, Eye, Download } from "lucide-react";
import { 
  BUILT_IN_FONTS, 
  FONT_CATEGORIES, 
  FontStorage, 
  generateFontPreview,
  createFontFromUpload,
  validateFontFile,
  type FontInfo,
  type FontUpload,
} from "@/lib/fonts";

interface FontSelectorProps {
  selectedFont: FontInfo;
  onFontSelect: (font: FontInfo) => void;
  className?: string;
}

export function FontSelector({ selectedFont, onFontSelect, className }: FontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customFonts, setCustomFonts] = useState<FontInfo[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load custom fonts on mount
  useEffect(() => {
    setCustomFonts(FontStorage.getCustomFonts());
  }, []);

  const allFonts = [...BUILT_IN_FONTS, ...customFonts];

  const handleFontUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const validation = validateFontFile(file);
      if (!validation.valid) {
        setUploadError(validation.error || "Invalid font file");
        return;
      }

      const upload: FontUpload = {
        file,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        category: "custom",
      };

      const font = await createFontFromUpload(upload);
      FontStorage.saveCustomFont(font);
      setCustomFonts(prev => [...prev, font]);
      onFontSelect(font);
      setIsOpen(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Failed to upload font");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveCustomFont = (fontId: string) => {
    FontStorage.removeCustomFont(fontId);
    setCustomFonts(prev => prev.filter(font => font.id !== fontId));
    
    // If the removed font was selected, switch to default
    if (selectedFont.id === fontId) {
      onFontSelect(BUILT_IN_FONTS[0]);
    }
  };

  const handleDownloadFont = (font: FontInfo) => {
    if (font.url) {
      const link = document.createElement("a");
      link.href = font.url;
      link.download = `${font.name}.woff2`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderFontCard = (font: FontInfo, isCustom = false) => (
    <Card 
      key={font.id}
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedFont.id === font.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
      }`}
      onClick={() => {
        onFontSelect(font);
        setIsOpen(false);
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{font.name}</CardTitle>
          {isCustom && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadFont(font);
                }}
                className="h-6 w-6 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveCustomFont(font.id);
                }}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <CardDescription className="text-xs">{font.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div 
          className="text-sm leading-relaxed"
          style={{ fontFamily: font.family }}
          dangerouslySetInnerHTML={{ 
            __html: generateFontPreview(font, "Aa Bb Cc 123") 
          }}
        />
      </CardContent>
    </Card>
  );

  const renderFontCategory = (category: keyof typeof FONT_CATEGORIES) => {
    const fonts = allFonts.filter(font => font.category === category);
    if (fonts.length === 0) return null;

    return (
      <div key={category} className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{FONT_CATEGORIES[category].icon}</span>
          <h3 className="font-semibold text-sm">{FONT_CATEGORIES[category].name}</h3>
          <p className="text-xs text-gray-500">{FONT_CATEGORIES[category].description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fonts.map(font => renderFontCard(font, font.category === "custom"))}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <span style={{ fontFamily: selectedFont.family }}>Aa</span>
              {selectedFont.name}
            </span>
            <Eye className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Choose Font</DialogTitle>
            <DialogDescription>
              Select a font for your worksheet. You can use built-in fonts or upload your own.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="built-in" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="built-in">Built-in Fonts</TabsTrigger>
              <TabsTrigger value="custom">Custom Fonts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="built-in" className="space-y-4 max-h-[50vh] overflow-y-auto">
              {Object.keys(FONT_CATEGORIES).map(category => 
                renderFontCategory(category as keyof typeof FONT_CATEGORIES)
              )}
            </TabsContent>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload your own font files (.woff, .woff2, .ttf, .otf)
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Choose Font File"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf"
                  onChange={handleFontUpload}
                  className="hidden"
                />
                {uploadError && (
                  <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                )}
              </div>
              
              {customFonts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Your Custom Fonts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customFonts.map(font => renderFontCard(font, true))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Font Preview Component for standalone use
interface FontPreviewProps {
  font: FontInfo;
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FontPreview({ font, text = font.preview, size = "md", className }: FontPreviewProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base", 
    lg: "text-lg",
  };

  return (
    <div 
      className={`${sizeClasses[size]} ${className}`}
      style={{ fontFamily: font.family }}
    >
      {text}
    </div>
  );
}

// Font Upload Component for standalone use
interface FontUploadProps {
  onFontUploaded: (font: FontInfo) => void;
  className?: string;
}

export function FontUpload({ onFontUploaded, className }: FontUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const validation = validateFontFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid font file");
        return;
      }

      const upload: FontUpload = {
        file,
        name: file.name.replace(/\.[^/.]+$/, ""),
        category: "custom",
      };

      const font = await createFontFromUpload(upload);
      FontStorage.saveCustomFont(font);
      onFontUploaded(font);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload font");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={className}>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">
          Upload font file (.woff, .woff2, .ttf, .otf)
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Choose File"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf"
          onChange={handleUpload}
          className="hidden"
        />
        {error && (
          <p className="text-red-500 text-xs mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}
