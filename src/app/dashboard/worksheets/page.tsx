import { MobileLayout, MobileCard, MobileButton, MobileGrid } from "@/components/mobile-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function WorksheetsPage() {
  const worksheets = [
    {
      id: "1",
      title: "Math Practice - Addition",
      subject: "Math",
      type: "Addition",
      difficulty: "Easy",
      createdAt: "2 days ago",
      status: "Completed"
    },
    {
      id: "2", 
      title: "Science Quiz - Plants",
      subject: "Science",
      type: "Biology",
      difficulty: "Medium",
      createdAt: "1 week ago",
      status: "Draft"
    },
    {
      id: "3",
      title: "Reading Comprehension",
      subject: "Language Arts", 
      type: "Reading",
      difficulty: "Medium",
      createdAt: "2 weeks ago",
      status: "Completed"
    },
    {
      id: "4",
      title: "Spelling Practice - Grade 3",
      subject: "Language Arts",
      type: "Spelling", 
      difficulty: "Easy",
      createdAt: "3 weeks ago",
      status: "Completed"
    }
  ];

  return (
    <MobileLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-bold">My Worksheets</h1>
          <p className="text-muted-foreground">
            View and manage all your created worksheets
          </p>
        </div>

        <div className="flex gap-4">
          <Button variant="outline">All</Button>
          <Button variant="ghost">Math</Button>
          <Button variant="ghost">Language Arts</Button>
          <Button variant="ghost">Science</Button>
        </div>

        <MobileGrid columns={1} gap="md">
          {worksheets.map((worksheet) => (
            <MobileCard
              key={worksheet.id}
              title={worksheet.title}
              description={`${worksheet.subject} • ${worksheet.type} • ${worksheet.difficulty}`}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created {worksheet.createdAt}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    worksheet.status === 'Completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {worksheet.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <MobileButton variant="outline" className="flex-1">
                    Edit
                  </MobileButton>
                  <MobileButton variant="outline" className="flex-1">
                    Duplicate
                  </MobileButton>
                  <MobileButton variant="outline" className="flex-1">
                    Export
                  </MobileButton>
                </div>
              </div>
            </MobileCard>
          ))}
        </MobileGrid>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common worksheet management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <MobileButton variant="outline" className="w-full">
              Create New Worksheet
            </MobileButton>
            <MobileButton variant="outline" className="w-full">
              Import Worksheets
            </MobileButton>
            <MobileButton variant="outline" className="w-full">
              Export All Worksheets
            </MobileButton>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
