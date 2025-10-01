import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
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
          <h1 className="text-foreground mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8 text-sm">
            <strong>Effective Date:</strong> January 1, 2025
            <br />
            <strong>Last Updated:</strong> January 1, 2025
          </p>

          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">1. Introduction</h2>
              <p className="text-muted-foreground">
                Astra Academy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a product of
                Wyatt Works, is committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you visit our
                website and use our homeschool worksheet builder service.
              </p>
              <p className="text-muted-foreground mt-4">
                We take the privacy of children seriously and comply with the Children&apos;s Online
                Privacy Protection Act (COPPA) and relevant state laws.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">2. Information We Collect</h2>

              <h3 className="text-foreground mt-4 mb-2 text-xl font-semibold">
                2.1 Personal Information
              </h3>
              <p className="text-muted-foreground">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>
                  <strong>Account Information:</strong> Name, email address, and password when you
                  create an account (via Clerk authentication)
                </li>
                <li>
                  <strong>Profile Information:</strong> Optional information you choose to provide
                </li>
                <li>
                  <strong>Worksheet Content:</strong> The worksheets you create and customize
                </li>
                <li>
                  <strong>Usage Data:</strong> Information about how you use our service
                </li>
              </ul>

              <h3 className="text-foreground mt-4 mb-2 text-xl font-semibold">
                2.2 Automatically Collected Information
              </h3>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>
                  <strong>Log Data:</strong> IP address, browser type, operating system, pages
                  visited, time spent on pages
                </li>
                <li>
                  <strong>Cookies and Tracking:</strong> We use cookies for authentication and user
                  experience (managed by Clerk)
                </li>
              </ul>

              <h3 className="text-foreground mt-4 mb-2 text-xl font-semibold">
                2.3 Children&apos;s Information (COPPA Compliance)
              </h3>
              <p className="text-muted-foreground">
                <strong>Important:</strong> Astra Academy is designed for use by parents and
                educators, not directly by children. We do NOT knowingly collect personal
                information from children under 13 years of age. Parents create accounts and
                generate worksheets for their children.
              </p>
              <p className="text-muted-foreground mt-2">
                If we discover that we have inadvertently collected personal information from a
                child under 13 without parental consent, we will delete that information
                immediately.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                3. How We Use Your Information
              </h2>
              <p className="text-muted-foreground">We use the information we collect to:</p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Provide, operate, and maintain our worksheet builder service</li>
                <li>Authenticate users and manage accounts</li>
                <li>Process worksheet generation and export requests</li>
                <li>Track usage quotas and subscription status</li>
                <li>Improve and personalize user experience</li>
                <li>Send service-related communications (e.g., account verification, updates)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Monitor and analyze usage patterns to improve our service</li>
                <li>Prevent fraud and ensure security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                4. How We Share Your Information
              </h2>
              <p className="text-muted-foreground">
                We do not sell your personal information. We may share information in the following
                circumstances:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>
                  <strong>Service Providers:</strong> With third-party vendors who help us operate
                  our service:
                  <ul className="list-circle mt-1 ml-6">
                    <li>Clerk (authentication services)</li>
                    <li>Vercel (hosting and deployment)</li>
                    <li>Database providers (for storing worksheet configurations)</li>
                  </ul>
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or
                  sale of assets
                </li>
                <li>
                  <strong>With Your Consent:</strong> When you explicitly agree to share information
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                5. Data Storage and Security
              </h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational security measures to protect
                your personal information:
              </p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Encrypted data transmission (HTTPS/SSL)</li>
                <li>Secure authentication via Clerk</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by authorized personnel only</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive
                to protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">6. Your Privacy Rights</h2>
              <p className="text-muted-foreground">You have the right to:</p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>
                  <strong>Access:</strong> Request a copy of the personal information we hold about
                  you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate or incomplete
                  information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal information (subject
                  to legal obligations)
                </li>
                <li>
                  <strong>Opt-Out:</strong> Unsubscribe from marketing communications
                </li>
                <li>
                  <strong>Data Portability:</strong> Request a copy of your data in a portable
                  format
                </li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, please contact us at{" "}
                <a href="mailto:privacy@wyattworks.com" className="text-primary underline">
                  privacy@wyattworks.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">7. FERPA Compliance</h2>
              <p className="text-muted-foreground">
                While Astra Academy is primarily a tool for parents creating worksheets (not a
                formal educational institution), we recognize that some users may be educators. We
                do not collect or maintain traditional &quot;education records&quot; as defined by
                FERPA.
              </p>
              <p className="text-muted-foreground mt-2">
                Worksheets created are not tied to specific student performance data or grades.
                Parents and educators maintain full control over their created content.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                8. Cookies and Tracking Technologies
              </h2>
              <p className="text-muted-foreground">We use cookies and similar technologies to:</p>
              <ul className="text-muted-foreground mt-2 ml-6 list-disc space-y-1">
                <li>Authenticate users and maintain sessions</li>
                <li>Remember user preferences</li>
                <li>Analyze website traffic and usage patterns</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You can control cookies through your browser settings. However, disabling cookies
                may affect functionality.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">9. Third-Party Links</h2>
              <p className="text-muted-foreground">
                Our website may contain links to third-party websites. We are not responsible for
                the privacy practices of these external sites. We encourage you to review their
                privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">10. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your personal information for as long as your account is active or as
                needed to provide services. You may request deletion of your account and data at any
                time.
              </p>
              <p className="text-muted-foreground mt-2">
                We may retain certain information as required by law or for legitimate business
                purposes (e.g., fraud prevention, resolving disputes).
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                11. International Data Transfers
              </h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and maintained on servers located outside
                your state, province, or country. By using Astra Academy, you consent to such
                transfers.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of
                significant changes by posting the new policy on this page and updating the
                &quot;Last Updated&quot; date.
              </p>
              <p className="text-muted-foreground mt-2">
                Continued use of the service after changes constitutes acceptance of the updated
                policy.
              </p>
            </section>

            <section>
              <h2 className="text-foreground mb-3 text-2xl font-bold">13. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="text-muted-foreground mt-4 rounded-lg bg-blue-50 p-4">
                <p>
                  <strong>Wyatt Works</strong>
                  <br />
                  Email:{" "}
                  <a href="mailto:privacy@wyattworks.com" className="text-primary underline">
                    privacy@wyattworks.com
                  </a>
                  <br />
                  Product: Astra Academy
                </p>
              </div>
            </section>

            <section className="mt-8 border-t pt-6">
              <h2 className="text-foreground mb-3 text-2xl font-bold">
                COPPA Safe Harbor Statement
              </h2>
              <p className="text-muted-foreground">
                Astra Academy is designed for use by adults (parents and educators) to create
                educational materials. Our service does not target children under 13, and we do not
                knowingly collect personal information from children.
              </p>
              <p className="text-muted-foreground mt-2">
                Parents are solely responsible for supervising their children&apos;s use of
                worksheets created through our platform. No student data or performance information
                is collected or stored by Astra Academy.
              </p>
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
