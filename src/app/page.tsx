"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import {
  Menu,
  X,
  Home as HomeIcon,
  Settings,
  BarChart3,
  FileText,
  Users,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
                <Link href="/dashboard/build">
                  <Button>Start Building</Button>
                </Link>
              </SignedOut>
              <SignedIn>
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                {/* Desktop Navigation */}
                <div className="hidden items-center space-x-2 md:flex">
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
                </div>

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

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
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
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        {/* Warm background gradient */}
        <div className="bg-warm-gradient absolute inset-0"></div>

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f2760a' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>

        <div className="relative z-10 container mx-auto text-center">
          <div className="mb-8">
            <div className="edu-icon mx-auto mb-6">📚</div>
          </div>

          <h1 className="text-foreground mb-6 text-4xl font-bold sm:text-6xl">
            Build Amazing Worksheets
            <span className="text-primary block">for Your Homeschool</span>
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-xl">
            Create custom worksheets, track progress, and make learning fun with our intuitive
            worksheet builder designed specifically for homeschooling parents.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/dashboard/build">
              <Button size="lg" className="homeschool-button px-8 py-6 text-lg">
                Start Building
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="homeschool-button-secondary px-8 py-6 text-lg"
              onClick={() => {
                const featuresSection = document.getElementById("features");
                featuresSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-cool-gradient px-4 py-20 sm:px-6 lg:px-8">
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
            <Card className="homeschool-card shadow-homeschool">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="edu-icon">🧮</div>
                  <CardTitle>Easy Worksheet Builder</CardTitle>
                </div>
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

            <Card className="homeschool-card shadow-homeschool">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="edu-icon">📚</div>
                  <CardTitle>Subject-Specific Templates</CardTitle>
                </div>
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

            <Card className="homeschool-card shadow-homeschool">
              <CardHeader>
                <div className="mb-2 flex items-center gap-3">
                  <div className="edu-icon">📊</div>
                  <CardTitle>Progress Tracking</CardTitle>
                </div>
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
                  <div className="text-4xl font-bold">Free</div>
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
                  <div className="text-4xl font-bold">$9.99</div>
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
                  <div className="text-4xl font-bold">$29.99</div>
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
              All paid plans include a 14-day free trial. Cancel anytime with no long-term
              commitments.
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
          <Link href="/dashboard/build">
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
