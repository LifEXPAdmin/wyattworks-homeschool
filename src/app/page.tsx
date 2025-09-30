import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      {/* Navbar */}
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-primary text-2xl font-bold">
                Wyatt Works
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button>Start Building</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-foreground mb-6 text-4xl font-bold sm:text-6xl">
            Build Amazing Worksheets
            <span className="text-primary block">for Your Homeschool</span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
            Create custom worksheets, track progress, and make learning fun with our intuitive
            worksheet builder designed specifically for homeschooling parents.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard">
              <Button size="lg" className="px-8 py-6 text-lg">
                Start Building
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
              Everything You Need to Create
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Powerful tools designed specifically for homeschooling parents to create engaging
              educational content.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Easy Worksheet Builder</CardTitle>
                <CardDescription>
                  Drag and drop interface to create custom worksheets in minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  No design skills needed. Choose from templates or start from scratch with our
                  intuitive builder.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject-Specific Templates</CardTitle>
                <CardDescription>
                  Pre-made templates for math, science, language arts, and more
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Save time with professionally designed templates that align with educational
                  standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your child&apos;s learning progress with built-in analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Track completion rates, identify areas for improvement, and celebrate
                  achievements.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Print & Digital</CardTitle>
                <CardDescription>
                  Export worksheets for printing or use them digitally
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Flexible delivery options to fit your teaching style and your child&apos;s
                  learning preferences.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Age-Appropriate Content</CardTitle>
                <CardDescription>
                  Content tailored to different age groups and skill levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  From kindergarten to high school, find the right level of challenge for your
                  student.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collaborative Features</CardTitle>
                <CardDescription>
                  Share worksheets with other homeschooling families
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Build a community by sharing your creations and discovering worksheets from other
                  parents.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
            Ready to Transform Your Homeschooling?
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
            Join thousands of homeschooling parents who are already creating amazing worksheets with
            Wyatt Works.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="px-8 py-6 text-lg">
              Start Building Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-muted-foreground container mx-auto text-center">
          <p>&copy; 2024 Wyatt Works. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
