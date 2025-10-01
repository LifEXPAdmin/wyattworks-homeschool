import { MobileLayout, MobileCard, MobileButton, MobileGrid } from "@/components/mobile-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TemplatesPage() {
  const templates = [
    {
      id: "math-basic",
      title: "Basic Math",
      description: "Addition, subtraction, multiplication, division",
      category: "Math",
      gradeLevel: "K-5"
    },
    {
      id: "math-advanced",
      title: "Advanced Math",
      description: "Fractions, decimals, word problems",
      category: "Math", 
      gradeLevel: "3-8"
    },
    {
      id: "language-spelling",
      title: "Spelling Practice",
      description: "Grade-appropriate spelling words",
      category: "Language Arts",
      gradeLevel: "K-8"
    },
    {
      id: "science-basic",
      title: "Science Basics",
      description: "Plants, animals, weather, seasons",
      category: "Science",
      gradeLevel: "K-3"
    },
    {
      id: "science-advanced",
      title: "Advanced Science",
      description: "Biology, chemistry, physics concepts",
      category: "Science",
      gradeLevel: "6-12"
    },
    {
      id: "writing-prompts",
      title: "Writing Prompts",
      description: "Creative and structured writing exercises",
      category: "Language Arts",
      gradeLevel: "2-8"
    }
  ];

  return (
    <MobileLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">Worksheet Templates</h1>
          <p className="text-muted-foreground">
            Choose from our collection of pre-made worksheet templates
          </p>
        </div>

        <MobileGrid columns={2} gap="md">
          {templates.map((template) => (
            <MobileCard
              key={template.id}
              title={template.title}
              description={template.description}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{template.category}</span>
                  <span className="text-muted-foreground">{template.gradeLevel}</span>
                </div>
                <MobileButton className="w-full">Use Template</MobileButton>
              </div>
            </MobileCard>
          ))}
        </MobileGrid>

        <Card>
          <CardHeader>
            <CardTitle>Custom Templates</CardTitle>
            <CardDescription>Create your own reusable templates</CardDescription>
          </CardHeader>
          <CardContent>
            <MobileButton variant="outline" className="w-full">
              Create Custom Template
            </MobileButton>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
