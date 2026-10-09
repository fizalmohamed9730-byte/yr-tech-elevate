import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/company";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Award,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: `Terms & Conditions | ${COMPANY.name}` },
      {
        name: "description",
        content:
          "Terms and Conditions governing use of the YR NOVATECH website, accounts, services, internship participation, task submissions, and certificates.",
      },
      { property: "og:title", content: `Terms & Conditions — ${COMPANY.name}` },
      {
        property: "og:description",
        content:
          "Rules governing use of the YR NOVATECH website, internship program, submissions, and certificates.",
      },
      { property: "og:url", content: "https://www.yrnovatech.in/terms-and-conditions" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/terms-and-conditions" }],
  }),
  component: TermsAndConditions,
});

function TermsAndConditions() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "MSME Registered",
      desc: `Recognized enterprise under Govt. of India (Udyam: ${COMPANY.udyam}).`,
    },
    {
      icon: FileText,
      title: "Original Submissions",
      desc: "All code and deliverables must be authentic, original work.",
    },
    {
      icon: Award,
      title: "Verifiable Credential",
      desc: "Certificates feature tamper-proof public verification codes.",
    },
    {
      icon: CheckCircle2,
      title: "Free Program",
      desc: "No registration, participation or certificate fees at any stage.",
    },
  ];

  return (
    <Section className="py-12 md:py-20">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
          <Scale className="h-3.5 w-3.5 text-primary" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          Terms &amp; Conditions
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The legal guidelines, user rights, participation conditions, and evaluation standards for {COMPANY.name}.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs font-normal border-border">
            Last updated: October 2026
          </Badge>
          <span>•</span>
          <span>Version 3.0</span>
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
        <Card className="p-6 md:p-10 border border-border bg-card/90 shadow-sm rounded-2xl space-y-9">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">1</span>
              Introduction
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms &amp; Conditions ("Terms") govern your access to and use of the {COMPANY.name}{" "}
              website (www.yrnovatech.in) and the services provided through it, including account
              registration, the internship program, task submissions, and certificates.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing or using this website or any of our services, you agree to be bound by
              these Terms. If you do not agree with any part of these Terms, you should not use our
              website or services. {COMPANY.name} is a Micro, Small &amp; Medium Enterprise registered
              under the Government of India (Udyam Registration: {COMPANY.udyam}).
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
              Use of Website
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This website is provided for informative and functional purposes, including learning
              more about our company, applying for internships, managing accounts, submitting
              internship work, verifying certificates, and contacting us. You agree to use the website
              only for lawful purposes and in a manner that does not restrict or inhibit any other
              user's use and enjoyment of the website.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
              User Accounts
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To participate in our internship program you must create an account by providing
              accurate and complete information. You are responsible for maintaining the
              confidentiality of your account credentials and for all activity that occurs under your
              account. You must notify us immediately if you become aware of any unauthorized use of
              your account. We may suspend or terminate accounts that violate these Terms or engage in
              fraudulent activity.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">4</span>
              Registration Information
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you register, we collect information including your name, email address, phone
              number, educational institution, department, year of study, and country of residence,
              along with the internship domain and duration you select. You agree that the information
              you provide is truthful and accurate. Providing false or misleading information may
              result in rejection of your application or termination of your account.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">5</span>
              Internship Program
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {COMPANY.name} internship programs are project-based learning experiences. They are not
              employment, and participation does not create an employment relationship. Interns select
              a domain and a duration (1 month, 2 months, or 3 months) at the time of registration.
              Internships follow a structured flow: registration, offer letter, project tasks,
              submission, review, and, upon successful completion, a certificate.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">6</span>
              Task Submission
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Interns are assigned project tasks that must be completed and submitted through the
              platform using the method specified (such as a GitHub repository, documented project, or
              other required deliverable). All submissions must be your original work. Plagiarism,
              submitting someone else's work, or copying content without attribution may result in
              rejection of the submission and, in serious cases, termination of the internship.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">7</span>
              Task Review and Approval
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Submitted tasks are reviewed by our team. Tasks may be approved, rejected, or returned
              with feedback. Interns are expected to incorporate feedback and resubmit where required.
              Approval is based on the quality, completeness, and originality of the submitted work.
              Progress towards completion is determined by approved tasks.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">8</span>
              Certificate Eligibility
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Certificates are issued to interns who successfully complete all required tasks for
              their selected duration and receive approval for those tasks. Certificate eligibility is
              at the discretion of {COMPANY.name}, based on the completeness and quality of the
              submitted work. Completing a program does not guarantee a certificate, employment, or any
              specific career outcome.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">9</span>
              Certificate Issuance
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              On successful completion, {COMPANY.name} may issue a certificate with a unique
              certificate code. Each certificate includes a verification code that can be checked
              publicly on our website to confirm authenticity. Issued certificates may be revoked if
              they were issued in error or if the issuing conditions were not met.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">10</span>
              Fees
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The {COMPANY.name} internship program is free. There is no registration fee, no
              participation fee and no certificate fee. Interns are never asked to make a payment,
              transfer money, provide a transaction reference, or upload a payment screenshot. Any
              request for payment that claims to come from {COMPANY.name} is not authorised by us.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">11</span>
              User Responsibilities
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As a user of our website or internship program, you agree to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>Provide accurate and truthful registration and submission information.</li>
              <li>Keep your account credentials secure and confidential.</li>
              <li>Complete and submit your own, original work.</li>
              <li>Follow the tasks, deadlines, and review feedback communicated in the program.</li>
              <li>Use the website in compliance with applicable laws.</li>
            </ul>
          </section>

          <hr className="border-border" />

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">12</span>
              Prohibited Activities
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li>Use the website for any unlawful purpose.</li>
              <li>Attempt to gain unauthorized access to other users' accounts, systems, or data.</li>
              <li>Submit false, misleading, or plagiarized information or work.</li>
              <li>Upload malicious files, viruses, or harmful code.</li>
              <li>Scrape, crawl, or harvest content from the website without permission.</li>
              <li>Interfere with the proper functioning of the website or its infrastructure.</li>
            </ul>
          </section>

          <hr className="border-border" />

          {/* Section 13 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">13</span>
              Intellectual Property
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All content on the {COMPANY.name} website — including text, graphics, logos, images,
              design, layout, and software — is the property of {COMPANY.name} or its content
              suppliers and is protected by applicable intellectual property laws. You may not
              reproduce, distribute, modify, or create derivative works from our content without prior
              written consent.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 14 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">14</span>
              Website Content
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We publish content such as articles, resources, internship details, and company
              information for general informational purposes. While we strive for accuracy, content
              may be updated from time to time and is provided without warranty of any kind. Nothing
              on this website constitutes a promise or guarantee of employment, placement, or
              certification.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 15 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">15</span>
              Third-Party Services
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This website relies on third-party infrastructure providers, including but not limited
              to a cloud database and authentication platform (Supabase) for data storage,
              authentication, and file storage, and an email delivery service for sending
              notifications such as offer letters and certificates. These providers have their own
              terms and privacy policies, which we encourage you to review.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 16 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">16</span>
              Service Availability
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              While we aim to keep the website available, we do not guarantee uninterrupted or
              error-free operation. The website and services may be temporarily unavailable for
              maintenance, upgrades, or reasons beyond our control. We reserve the right to modify,
              suspend, or discontinue parts of the website or services at any time.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 17 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">17</span>
              Disclaimer
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {COMPANY.name} provides this website and its services on an "as is" and "as available"
              basis. Our internship programs are independent learning experiences. Completion of a
              program does not guarantee employment, university credit, placement, or any specific
              career outcome. Any career benefits depend on individual effort, skill development, and
              market conditions.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 18 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">18</span>
              Limitation of Liability
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, {COMPANY.name} shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of the
              website or services, including loss of data, loss of opportunity, or interruption of
              service.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 19 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">19</span>
              Changes to Terms
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update these Terms &amp; Conditions from time to time. Material changes will be
              reflected by an updated "Last updated" date on this page. Continued use of the website
              or services after changes are posted constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 20 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">20</span>
              Contact Information
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have questions about these Terms &amp; Conditions, you can reach us on our{" "}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                contact page
              </Link>{" "}
              or via email at{" "}
              <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline font-medium">
                {COMPANY.email}
              </a>
              .
            </p>

            <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Related documentation:</span>
              <div className="flex items-center gap-4">
                <Link to="/privacy-policy" className="text-primary hover:underline flex items-center gap-1">
                  Privacy Policy <ArrowRight className="h-3 w-3" />
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
