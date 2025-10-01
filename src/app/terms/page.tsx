import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navbar */}
      <nav className="border-b bg-white/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-3xl">✨</span>
                <span className="text-primary text-2xl font-bold">Astra Academy</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">← Back to Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h1 className="text-foreground mb-4 text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            <strong>Effective Date:</strong> January 1, 2025
            <br />
            <strong>Last Updated:</strong> January 1, 2025
          </p>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                Welcome to Astra Academy, operated by Wyatt Works. By accessing or using our website
                and services, you agree to be bound by these Terms of Service (&quot;Terms&quot;).
                If you do not agree to these Terms, please do not use our service.
              </p>
              <p className="text-muted-foreground mt-2">
                These Terms constitute a legally binding agreement between you and Wyatt Works.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Astra Academy provides a web-based worksheet builder that allows parents and
                educators to create, customize, and print educational worksheets for homeschool and
                educational purposes. Our service includes:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Math problem generators (addition, subtraction, multiplication, division)</li>
                <li>
                  Language Arts content (spelling words, vocabulary, writing prompts) by grade level
                </li>
                <li>Customizable worksheet templates and styling options</li>
                <li>PDF export and printing capabilities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">3. User Accounts</h2>

              <h3 className="text-foreground mt-4 mb-2 text-xl font-semibold">3.1 Registration</h3>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You are responsible for all activities under your account</li>
              </ul>

              <h3 className="text-foreground mt-4 mb-2 text-xl font-semibold">
                3.2 Account Security
              </h3>
              <p className="text-muted-foreground">
                You agree to notify us immediately of any unauthorized use of your account. We are
                not liable for losses caused by unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">4. Acceptable Use Policy</h2>
              <p className="text-muted-foreground">You agree NOT to:</p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Use the service for any unlawful purpose</li>
                <li>Violate any intellectual property rights</li>
                <li>
                  Attempt to gain unauthorized access to our systems or other users&apos; accounts
                </li>
                <li>Upload malicious code, viruses, or any harmful content</li>
                <li>Use automated systems (bots, scrapers) without permission</li>
                <li>Resell or redistribute our service without authorization</li>
                <li>Create worksheets containing inappropriate, offensive, or harmful content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                5. Intellectual Property Rights
              </h2>

              <h3 className="text-foreground mt-4 mb-2 text-xl font-semibold">5.1 Our Content</h3>
              <p className="text-muted-foreground">
                The Astra Academy platform, including its design, code, logos, and branding, is
                owned by Wyatt Works and protected by copyright, trademark, and other intellectual
                property laws.
              </p>

              <h3 className="text-foreground mt-4 mb-2 text-xl font-semibold">5.2 Your Content</h3>
              <p className="text-muted-foreground">
                You retain all rights to the worksheets you create using our service. By using Astra
                Academy, you grant us a limited license to:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Store and process your worksheet configurations</li>
                <li>Generate and export worksheets on your behalf</li>
                <li>Display anonymized examples for marketing purposes (with your consent)</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>Educational Use:</strong> Worksheets created are for personal, homeschool,
                or classroom use. Commercial distribution requires a commercial license.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                6. Subscription and Payment Terms
              </h2>
              <p className="text-muted-foreground">
                Astra Academy offers both free and paid subscription tiers:
              </p>

              <h3 className="text-foreground mt-4 mb-2 text-xl font-semibold">6.1 Free Tier</h3>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Limited to specified number of worksheet exports per month</li>
                <li>Access to core features and templates</li>
                <li>Subject to fair use limitations</li>
              </ul>

              <h3 className="text-foreground mt-4 mb-2 text-xl font-semibold">
                6.2 Paid Subscriptions
              </h3>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Billed monthly or annually</li>
                <li>Automatic renewal unless cancelled</li>
                <li>Refunds subject to our refund policy</li>
                <li>Price changes will be communicated 30 days in advance</li>
              </ul>

              <p className="text-muted-foreground mt-4">
                <em>Note: Currently, the service operates with unlimited exports during beta.</em>
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                7. Disclaimer of Warranties
              </h2>
              <p className="text-muted-foreground">
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
                WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Warranties of merchantability or fitness for a particular purpose</li>
                <li>Warranties of accuracy, reliability, or completeness of content</li>
                <li>Warranties of uninterrupted or error-free service</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                While we strive for educational accuracy, you are responsible for reviewing all
                generated content before use.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                8. Limitation of Liability
              </h2>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WYATT WORKS SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, or goodwill</li>
                <li>Service interruptions or errors</li>
                <li>Third-party actions or content</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Our total liability shall not exceed the amount you paid us in the 12 months
                preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">9. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless Wyatt Works from any claims, damages, or
                expenses arising from:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Your use of the service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights</li>
                <li>Content you create or upload</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">10. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate your account at any time for:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>Request from law enforcement</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You may cancel your account at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the
                United States, without regard to conflict of law principles.
              </p>
              <p className="text-muted-foreground mt-2">
                Any disputes shall be resolved through binding arbitration in accordance with the
                rules of the American Arbitration Association.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                12. Changes to Terms of Service
              </h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will provide notice of
                material changes by:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the &quot;Last Updated&quot; date</li>
                <li>Sending email notification for significant changes (to registered users)</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Your continued use after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">13. Severability</h2>
              <p className="text-muted-foreground">
                If any provision of these Terms is found to be unenforceable, the remaining
                provisions will continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">14. Entire Agreement</h2>
              <p className="text-muted-foreground">
                These Terms, together with our Privacy Policy, constitute the entire agreement
                between you and Wyatt Works regarding Astra Academy.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">15. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="text-muted-foreground mt-4 rounded-lg bg-blue-50 p-4">
                <p>
                  <strong>Wyatt Works</strong>
                  <br />
                  Email:{" "}
                  <a href="mailto:legal@wyattworks.com" className="text-primary underline">
                    legal@wyattworks.com
                  </a>
                  <br />
                  Product: Astra Academy
                  <br />
                  Website:{" "}
                  <a href="https://homeschool.lifexpapp.com" className="text-primary underline">
                    homeschool.lifexpapp.com
                  </a>
                </p>
              </div>
            </section>

            <section className="mt-8 border-t pt-6">
              <h2 className="text-foreground mb-3 text-2xl font-bold">Educational Use Notice</h2>
              <p className="text-muted-foreground">
                Astra Academy is an educational tool designed for homeschooling parents and
                educators. While we provide high-quality content generators:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>
                  You are responsible for reviewing all generated content for accuracy and
                  appropriateness
                </li>
                <li>We do not provide educational advice or curriculum guidance</li>
                <li>
                  Worksheets are tools to support your teaching, not replacements for instruction
                </li>
                <li>We are not liable for educational outcomes or student performance</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link href="/">
              <Button size="lg">Return to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
