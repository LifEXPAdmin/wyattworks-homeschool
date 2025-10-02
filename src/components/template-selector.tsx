"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Star,
  Download,
  Clock,
  Heart,
  Filter,
  Grid,
  List,
  BookOpen,
  Users,
  TrendingUp,
} from "lucide-react";
import { TemplateManager, TEMPLATE_CATEGORIES, type WorksheetTemplate } from "@/lib/templates";

interface TemplateSelectorProps {
  onTemplateSelect: (template: WorksheetTemplate) => void;
  selectedTemplate?: WorksheetTemplate | null;
  className?: string;
}

export function TemplateSelector({
  onTemplateSelect,
  selectedTemplate,
  className,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [templates, setTemplates] = useState<WorksheetTemplate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    setFavorites(TemplateManager.getFavoriteTemplates());
    loadTemplates();
  }, [selectedCategory, searchQuery]);

  const loadTemplates = () => {
    let filteredTemplates: WorksheetTemplate[];

    if (searchQuery) {
      filteredTemplates = TemplateManager.searchTemplates(searchQuery);
    } else if (selectedCategory === "all") {
      filteredTemplates = TemplateManager.getAllTemplates();
    } else if (selectedCategory === "favorites") {
      const favoriteIds = TemplateManager.getFavoriteTemplates();
      filteredTemplates = TemplateManager.getAllTemplates().filter((t) =>
        favoriteIds.includes(t.id)
      );
    } else {
      filteredTemplates = TemplateManager.getTemplatesByCategory(selectedCategory);
    }

    setTemplates(filteredTemplates);
  };

  const handleFavoriteToggle = (templateId: string) => {
    if (favorites.includes(templateId)) {
      TemplateManager.removeFromFavorites(templateId);
    } else {
      TemplateManager.addToFavorites(templateId);
    }
    setFavorites(TemplateManager.getFavoriteTemplates());
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case "math":
        return "📐";
      case "language_arts":
        return "📖";
      case "science":
        return "🔬";
      default:
        return "📄";
    }
  };

  const renderTemplateCard = (template: WorksheetTemplate) => (
    <Card
      key={template.id}
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedTemplate?.id === template.id ? "bg-blue-50 ring-2 ring-blue-500" : ""
      }`}
      onClick={() => onTemplateSelect(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getSubjectIcon(template.subject)}</span>
            <div>
              <CardTitle className="line-clamp-1 text-sm font-medium">{template.name}</CardTitle>
              <CardDescription className="text-xs">
                {template.gradeLevel} • {template.estimatedTime}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteToggle(template.id);
            }}
            className="h-6 w-6 p-0"
          >
            <Heart
              className={`h-3 w-3 ${
                favorites.includes(template.id) ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-3 line-clamp-2 text-xs text-gray-600">{template.description}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
              {template.difficulty}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {template.rating}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Download className="h-3 w-3" />
              {template.downloads}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplateList = (template: WorksheetTemplate) => (
    <div
      key={template.id}
      className={`flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-all hover:shadow-sm ${
        selectedTemplate?.id === template.id
          ? "bg-blue-50 ring-2 ring-blue-500"
          : "hover:bg-gray-50"
      }`}
      onClick={() => onTemplateSelect(template)}
    >
      <span className="text-2xl">{getSubjectIcon(template.subject)}</span>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{template.name}</h3>
          <Badge className={`text-xs ${getDifficultyColor(template.difficulty)}`}>
            {template.difficulty}
          </Badge>
        </div>
        <p className="mb-2 line-clamp-1 text-xs text-gray-600">{template.description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>{template.gradeLevel}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {template.estimatedTime}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {template.rating}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            {template.downloads}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleFavoriteToggle(template.id);
        }}
        className="h-8 w-8 p-0"
      >
        <Heart
          className={`h-4 w-4 ${
            favorites.includes(template.id) ? "fill-red-500 text-red-500" : "text-gray-400"
          }`}
        />
      </Button>
    </div>
  );

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Choose a Template</h2>
            <p className="text-sm text-gray-600">
              Start with a pre-made template or create from scratch
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="popular" className="text-xs">
              Popular
            </TabsTrigger>
            <TabsTrigger value="math" className="text-xs">
              Math
            </TabsTrigger>
            <TabsTrigger value="language_arts" className="text-xs">
              Language
            </TabsTrigger>
            <TabsTrigger value="science" className="text-xs">
              Science
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            {templates.length === 0 ? (
              <div className="py-8 text-center">
                <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">No templates found</h3>
                <p className="text-gray-600">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "No templates available in this category"}
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    : "space-y-2"
                }
              >
                {templates.map((template) =>
                  viewMode === "grid" ? renderTemplateCard(template) : renderTemplateList(template)
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 border-t pt-4">
          <div className="text-center">
            <div className="text-lg font-semibold">{templates.length}</div>
            <div className="text-xs text-gray-600">Templates</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{favorites.length}</div>
            <div className="text-xs text-gray-600">Favorites</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {Math.round(
                (templates.reduce((acc, t) => acc + t.rating, 0) / templates.length) * 10
              ) / 10 || 0}
            </div>
            <div className="text-xs text-gray-600">Avg Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
