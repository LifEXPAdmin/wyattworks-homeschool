import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      {/* Navbar */}
      <nav className="bg-background/95 supports-[backdrop-filter]:bg-background/60 border-b backdrop-blur">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <Logo size="lg" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <SignedOut>
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>Start Building</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
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

      {/* Pricing Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-xl">
              Start free and upgrade as your needs grow. All plans include our core worksheet
              builder.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">$0</div>
                  <div className="text-muted-foreground text-sm">forever</div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">15 worksheet exports per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Basic templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">PDF export</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-sm">Progress tracking</span>
                  </li>
                </ul>
                <Link href="/dashboard" className="mt-6 block">
                  <Button variant="outline" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-blue-200 bg-blue-50">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                <div className="rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                  Most Popular
                </div>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>For active homeschooling families</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">$9</div>
                  <div className="text-muted-foreground text-sm">per month</div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Unlimited worksheet exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Premium templates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Multiple export formats</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Advanced analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <Link href="/dashboard/subscription" className="mt-6 block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Upgrade to Pro</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="relative">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Premium</CardTitle>
                <CardDescription>For educators and co-ops</CardDescription>
                <div className="mt-4">
                  <div className="text-4xl font-bold">$19</div>
                  <div className="text-muted-foreground text-sm">per month</div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Custom branding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Team collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm">API access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    <span className="text-sm">White-label options</span>
                  </li>
                </ul>
                <Link href="/dashboard/subscription" className="mt-6 block">
                  <Button variant="outline" className="w-full">
                    Upgrade to Premium
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground text-sm">
              All plans include a 14-day free trial. Cancel anytime.
            </p>
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
        <div className="text-muted-foreground container mx-auto">
          <div className="mb-4 flex flex-wrap justify-center gap-6 text-sm">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <a
              href="mailto:support@wyattworks.com"
              className="hover:text-primary transition-colors"
            >
              Contact Us
            </a>
          </div>
          <p className="text-center">
            &copy; {new Date().getFullYear()} Astra Academy. Made with ❤️ by{" "}
            <strong>Wyatt Works</strong>.
          </p>
        </div>
      </footer>
    </div>
  );
}
