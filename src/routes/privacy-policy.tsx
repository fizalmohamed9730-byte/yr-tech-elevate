import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/company";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileCheck2,
  Database,
  Cookie,
  UserCheck,
  Mail,
  ArrowRight,
  Globe,
  Building2,
} from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy | ${COMPANY.name}` },
      {
        name: "description",
        content: `Privacy Policy for ${COMPANY.name}. Learn how we collect, use, store, and protect your personal information.`,
      },
      { property: "og:title", content: `Privacy Policy — ${COMPANY.name}` },
      {
        property: "og:description",
        content: `How ${COMPANY.name} handles your data, cookies, and personal information.`,
      },
      { property: "og:url", content: "https://www.yrnovatech.in/privacy-policy" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/privacy-policy" }],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  const highlights = [
    {
      icon: Lock,
      title: "Encrypted Storage",
      desc: "All traffic encrypted via TLS/SSL with Row-Level Security in Supabase.",
    },
    {
      icon: Eye,
      title: "No Data Selling",
      desc: "We never monetize, rent, or trade your personal records to third parties.",
    },
    {
      icon: Cookie,
      title: "Essential Cookies",
      desc: "Cookies used strictly for authentication, theme preference & security.",
    },
    {
      icon: UserCheck,
      title: "User Data Rights",
      desc: "Full rights to access, review, correct, or request deletion of your account.",
    },
  ];

  return (
    <Section className="py-12 md:py-20">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
          <FileCheck2 className="h-3.5 w-3.5 text-primary" />
          <span>Legal &amp; Data Governance</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          Privacy Policy
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          How {COMPANY.name} collects, protects, stores, and manages your personal information across our website and applications.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs font-normal border-border">
            Last updated: September 2026
          </Badge>
          <span>•</span>
          <span>Version 2.0</span>
        </div>
      </div>

      {/* Quick Summary Highlights */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {highlights.map((h) => (
          <Card key={h.title} className="p-4 border border-border bg-card/60 backdrop-blur-sm rounded-xl">
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
              <h.icon className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">{h.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
          </Card>
        ))}
      </div>

      {/* Main Document Body */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-10 border border-border bg-card/90 shadow-sm rounded-2xl space-y-10">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">1</span>
              Introduction
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {COMPANY.name} ("we," "our," or "us") is committed to protecting the privacy of visitors
              to our website and users of our services. This Privacy Policy explains what personal
              information we collect, why we collect it, how we use and protect it, and your rights
              regarding your data. This policy applies to our website at{" "}
              <a href="https://www.yrnovatech.in" className="text-primary hover:underline font-medium">
                www.yrnovatech.in
              </a>{" "}
              and all services provided through it.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
              Information We Collect
            </h2>

            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">2.1 Information You Provide</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you register for an internship, submit a contact form, or create an account, we may
                collect:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Full name, email address, and phone number</li>
                <li>Educational details (college name, department, year of study)</li>
                <li>Country of residence</li>
                <li>Profile photograph (if uploaded during registration)</li>
                <li>Resume or CV (if uploaded)</li>
                <li>Internship domain and duration preferences</li>
                <li>Project submissions and task responses</li>
                <li>Feedback and messages submitted through contact forms</li>
              </ul>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="text-base font-semibold text-foreground">2.2 Automatically Collected Information</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you visit our website, technical information such as the following may be received
                as part of standard internet and hosting operations:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Browser type and version</li>
                <li>Device information (operating system, screen resolution)</li>
                <li>IP address</li>
                <li>Advertising cookies served by Google AdSense (see Section 5)</li>
              </ul>
            </div>
          </section>

          <hr className="border-border" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
              How We Use Your Information
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use collected information for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Internship administration:</strong> Processing applications, assigning tasks,
                tracking progress, issuing offer letters and certificates.
              </li>
              <li>
                <strong className="text-foreground">Account management:</strong> Creating and maintaining your user account,
                authenticating logins, managing your profile.
              </li>
              <li>
                <strong className="text-foreground">Communication:</strong> Responding to inquiries, sending internship updates,
                task assignments, and certificate notifications.
              </li>
              <li>
                <strong className="text-foreground">Service improvement:</strong> Understanding how our website is used so we can
                improve functionality and user experience.
              </li>
              <li>
                <strong className="text-foreground">Legal compliance:</strong> Meeting our obligations under applicable Indian law
                and regulations.
              </li>
            </ul>
            <div className="p-3.5 rounded-xl bg-accent/40 border border-border mt-3">
              <p className="text-xs text-foreground/90 font-medium">
                Strict Guarantee: We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
            </div>
          </section>

          <hr className="border-border" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">4</span>
              Data Storage and Security
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your data is stored securely using Supabase, a cloud database platform, with servers
              hosted in compliance with industry-standard security practices. We implement the
              following safeguards:
            </p>
            <div className="grid gap-2.5 pt-1">
              {[
                "All data transmitted between your browser and our servers is encrypted using TLS/SSL.",
                "Database access is controlled through Row Level Security (RLS) policies, ensuring users can only access their own data.",
                "Authentication is handled via secure session management with automatic token rotation.",
                "Passwords are hashed using industry-standard algorithms — we never store passwords in plain text.",
                "File uploads (photos, resumes) are stored in secure, access-controlled storage buckets.",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs text-foreground/90">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic pt-1">
              While we take reasonable precautions to protect your data, no method of electronic
              storage or transmission is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">5</span>
              Cookies and Tracking
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our website uses cookies and similar technologies for:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Essential cookies:</strong> Required for authentication, session management,
                and basic site functionality.
              </li>
              <li>
                <strong className="text-foreground">Preference storage:</strong> Storing your theme preference (light/dark mode).
              </li>
              <li>
                <strong className="text-foreground">Advertising:</strong> We use Google AdSense, which may use cookies to serve
                relevant advertisements. Google's use of advertising cookies is governed by their own
                privacy policies.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can manage cookie preferences through your browser settings. Note that disabling
              essential cookies may affect site functionality.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">6</span>
              Third-Party Services
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We use the following third-party infrastructure providers that may process technical data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Supabase:</strong> Database hosting, authentication, and file storage.
              </li>
              <li>
                <strong className="text-foreground">Google AdSense:</strong> Advertising platform that may collect browsing data
                for ad personalization.
              </li>
              <li>
                <strong className="text-foreground">Vercel:</strong> Website hosting, edge routing, and deployment.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Each of these services has its own privacy policy governing how they handle data. We
              recommend reviewing their policies for full details.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">7</span>
              Your Rights
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Access:</strong> You can request a copy of the personal data we hold about you.
              </li>
              <li>
                <strong className="text-foreground">Correction:</strong> You can request corrections to inaccurate or incomplete
                data through your profile settings or by contacting us.
              </li>
              <li>
                <strong className="text-foreground">Deletion:</strong> You can request deletion of your account and associated
                data by contacting us at {COMPANY.email}.
              </li>
              <li>
                <strong className="text-foreground">Data portability:</strong> You can request your data in a structured,
                machine-readable format.
              </li>
              <li>
                <strong className="text-foreground">Withdraw consent:</strong> You can withdraw consent for data processing at any
                time, though this may affect your ability to use certain services.
              </li>
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To exercise any of these rights, please contact us at{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline font-medium">
                {COMPANY.email}
              </a>
              . We will respond within 30 days of receiving your request.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">8</span>
              Data Retention
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your personal data for as long as necessary to provide our services and
              fulfill the purposes described in this policy. Internship records, certificates, and
              verification data are retained to enable ongoing certificate verification. If you
              request account deletion, we will remove your personal data within 30 days, though we
              may retain certain anonymized records for legitimate business purposes.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">9</span>
              Children's Privacy
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our services are intended for individuals aged 16 and above. We do not knowingly collect
              personal information from children under 16. If we become aware that we have collected
              data from a child under 16, we will take steps to delete it promptly.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">10</span>
              Changes to This Policy
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. Material changes will be posted on
              this page with an updated "Last updated" date. We encourage you to review this page
              periodically.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 11 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">11</span>
              Contact Information
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or how we handle your data, please contact our data compliance desk:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-card border border-border flex items-start gap-3">
                <Building2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Entity</div>
                  <div className="text-xs font-semibold text-foreground">{COMPANY.name}</div>
                  <div className="text-[11px] text-muted-foreground">{COMPANY.udyam}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-card border border-border flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground">Privacy Desk</div>
                  <a href={`mailto:${COMPANY.email}`} className="text-xs font-semibold text-primary hover:underline">
                    {COMPANY.email}
                  </a>
                  <div className="text-[11px] text-muted-foreground">30-day response SLA</div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Related documentation:</span>
              <div className="flex items-center gap-4">
                <Link to="/terms-and-conditions" className="text-primary hover:underline flex items-center gap-1">
                  Terms &amp; Conditions <ArrowRight className="h-3 w-3" />
                </Link>
                <Link to="/refund-policy" className="text-primary hover:underline flex items-center gap-1">
                  Refund &amp; Cancellation Policy <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>
        </Card>
      </div>
    </Section>
  );
}
