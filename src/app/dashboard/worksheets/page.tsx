"use client";

import { useState, useEffect } from "react";
import { MobileLayout, MobileCard, MobileButton, MobileGrid } from "@/components/mobile-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, Download, Eye } from "lucide-react";

interface Worksheet {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  gradeLevel: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  exportLogs: Array<{
    id: string;
    format: string;
    createdAt: string;
  }>;
}

export default function WorksheetsPage() {
  const [worksheets, setWorksheets] = useState<Worksheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    loadWorksheets();
  }, [filter]);

  const loadWorksheets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("subject", filter);
      }
      
      const response = await fetch(`/api/worksheets?${params}`);
      if (!response.ok) {
        throw new Error("Failed to load worksheets");
      }
      
      const data = await response.json();
      setWorksheets(data.worksheets || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load worksheets");
    } finally {
      setLoading(false);
    }
  };

  const deleteWorksheet = async (id: string) => {
    if (!confirm("Are you sure you want to delete this worksheet?")) {
      return;
    }

    try {
      const response = await fetch(`/api/worksheets/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete worksheet");
      }
      
      setWorksheets(worksheets.filter(w => w.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete worksheet");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  if (error) {
    return (
      <MobileLayout>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadWorksheets}>Try Again</Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">My Worksheets</h1>
          <p className="text-muted-foreground">
            View and manage all your created worksheets
          </p>
        </div>

        <div className="flex gap-4 flex-wrap">
          <Button 
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All ({worksheets.length})
          </Button>
          <Button 
            variant={filter === "math" ? "default" : "outline"}
            onClick={() => setFilter("math")}
          >
            Math ({worksheets.filter(w => w.subject === "math").length})
          </Button>
          <Button 
            variant={filter === "language_arts" ? "default" : "outline"}
            onClick={() => setFilter("language_arts")}
          >
            Language Arts ({worksheets.filter(w => w.subject === "language_arts").length})
          </Button>
          <Button 
            variant={filter === "science" ? "default" : "outline"}
            onClick={() => setFilter("science")}
          >
            Science ({worksheets.filter(w => w.subject === "science").length})
          </Button>
        </div>

        {worksheets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">No worksheets found</p>
              <MobileButton onClick={() => window.location.href = "/dashboard/create"}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Worksheet
              </MobileButton>
            </CardContent>
          </Card>
        ) : (
          <MobileGrid columns={1} gap="md">
            {worksheets.map((worksheet) => (
              <MobileCard
                key={worksheet.id}
                title={worksheet.title}
                description={worksheet.description || `${worksheet.subject} • ${worksheet.gradeLevel}`}
                className="cursor-pointer transition-shadow hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Created {formatDate(worksheet.createdAt)}
                    </span>
                    <Badge className={getStatusColor(worksheet.status)}>
                      {worksheet.status}
                    </Badge>
                  </div>
                  
                  {worksheet.exportLogs.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {worksheet.exportLogs.length} export{worksheet.exportLogs.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <MobileButton 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.location.href = `/dashboard/worksheets/${worksheet.id}`}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </MobileButton>
                    <MobileButton 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.location.href = `/dashboard/create?edit=${worksheet.id}`}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </MobileButton>
                    <MobileButton 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => deleteWorksheet(worksheet.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </MobileButton>
                  </div>
                </div>
              </MobileCard>
            ))}
          </MobileGrid>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common worksheet management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <MobileButton 
              className="w-full"
              onClick={() => window.location.href = "/dashboard/create"}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create New Worksheet
            </MobileButton>
            <MobileButton variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export All Worksheets
            </MobileButton>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
