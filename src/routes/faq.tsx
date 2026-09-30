import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { COMPANY } from "@/lib/company";
import { HelpCircle, Mail } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: `Frequently Asked Questions | ${COMPANY.name}` },
      {
        name: "description",
        content:
          "Frequently asked questions about YR NOVATECH internships, domains, durations, task submissions, certificates, payment verification, and how to contact us.",
      },
      { property: "og:title", content: `FAQ — ${COMPANY.name}` },
      {
        property: "og:description",
        content:
          "Answers to common questions about YR NOVATECH's internship program, certificates, and payments.",
      },
      { property: "og:url", content: "https://www.yrnovatech.in/faq" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/faq" }],
  }),
  component: Faq,
});

const faqs = [
  {
    q: "What is YR NOVATECH?",
    a: "YR NOVATECH is a software development and technology company. We build custom software, web and mobile applications, and AI-powered solutions, and we also run structured, project-based internship programs for students and aspiring engineers.",
  },
  {
    q: "Is the internship a job?",
    a: "No. Our internship program is a project-based learning experience, not employment. Participating interns are not employees of YR NOVATECH, and the program does not guarantee employment, placement, or any specific career outcome.",
  },
  {
    q: "Which internship domains are available?",
    a: "Internship domains include Full Stack Development, UI/UX Design, C++ Programming, Python Programming, and Artificial Intelligence. You choose your preferred domain at registration.",
  },
  {
    q: "What are the internship durations?",
    a: "You can select a duration of 1 month, 2 months, or 3 months at the time of registration.",
  },
  {
    q: "Is registration free?",
    a: "Yes. Registration for the internship program is free, and there is no fee to apply or participate. A certificate processing fee may apply in certain flows and is shown in your account before payment.",
  },
  {
    q: "How does the internship program work?",
    a: "The program follows clear steps: register and pick a domain, receive your offer letter on approval, share your internship announcement, complete project tasks, submit your work for review, receive feedback and approval, and earn a verifiable certificate on successful completion.",
  },
  {
    q: "Will I definitely receive a certificate?",
    a: "Certificates are issued to interns who complete all required tasks for their selected duration and receive approval for those tasks. Where a certificate payment requirement applies, the payment must also be made and verified. Issuance is based on the completeness and quality of your submitted work.",
  },
  {
    q: "How are tasks submitted and reviewed?",
    a: "After registration, you receive project tasks inside your account dashboard. You submit your completed work (for example, a GitHub repository, project link, or other required deliverable) from the dashboard. Our team reviews submissions and either approves them or returns them with feedback for revision.",
  },
  {
    q: "Are certificates verifiable?",
    a: "Yes. Issued certificates include a unique verification code, and certificates can be checked publicly using the Internship Verification tool on our website.",
  },
  {
    q: "What payments are involved?",
    a: "Where a certificate processing fee applies, the amount is shown in your account before payment. Payment is made using the payment method displayed in your account (UPI), and you provide the transaction or UTR reference for verification. Payments are verified manually, so payment status is always subject to verification. See our Refund & Cancellation Policy for details.",
  },
  {
    q: "Can fees be refunded?",
    a: "Refunds are considered on a case-by-case basis, at our discretion and after verification. They are not guaranteed and are generally not available after a verified payment and successful certificate issuance. See our Refund & Cancellation Policy for the full details.",
  },
  {
    q: "How can I contact YR NOVATECH?",
    a: "You can reach us through our contact page or by emailing us directly.",
  },
];

function Faq() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Support"
        title="Frequently Asked Questions"
        description="Answers to the questions we hear most often about our company, internships, certificates, and payments."
      />

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, i) => (
          <Card key={faq.q} className="p-5 border border-border">
            <h3 className="font-semibold text-base mb-2 flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              {faq.q}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed pl-7">{faq.a}</p>
          </Card>
        ))}
      </div>

      <div className="max-w-3xl mx-auto text-center mt-10">
        <Card className="p-6 border border-border flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Mail className="h-4 w-4 text-primary shrink-0" />
            <span>
              Official Email:{" "}
              <a
                href={`mailto:${COMPANY.email}`}
                className="text-primary hover:underline font-medium"
              >
                {COMPANY.email}
              </a>
            </span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">·</span>
          <Link to="/contact" className="text-sm text-primary hover:underline font-medium">
            Contact Page
          </Link>
        </Card>
      </div>
    </Section>
  );
}
