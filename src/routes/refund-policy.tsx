import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/Section";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: `Refund & Cancellation Policy | ${COMPANY.name}` },
      {
        name: "description",
        content: `Refund and Cancellation Policy for ${COMPANY.name} internship programs and services.`,
      },
      { property: "og:title", content: `Refund Policy — ${COMPANY.name}` },
      {
        property: "og:description",
        content: `Understand the refund and cancellation terms for ${COMPANY.name} services.`,
      },
    ],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Legal"
        title="Refund & Cancellation Policy"
        description="Last updated: September 2026"
      />

      <div className="max-w-3xl mx-auto space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This Refund & Cancellation Policy outlines the terms under which
            refunds or cancellations may be requested for services provided by{" "}
            {COMPANY.name}. We aim to handle all refund requests fairly and
            transparently.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Internship Program</h2>
          <h3 className="text-lg font-medium mb-2 mt-4">2.1 Free Internship Registration</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Registration for {COMPANY.name} internship programs is free of charge.
            There is no fee to apply, register, or participate in the internship
            program itself.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">2.2 Certificate Processing Fee</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A certificate processing fee may apply for the generation and delivery
            of internship completion certificates. This fee covers the cost of
            certificate production, verification infrastructure, and secure digital
            delivery. The fee amount is communicated clearly before payment.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">2.3 Certificate Fee Refunds</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Refunds for certificate processing fees may be considered in the following
            circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li><strong>Duplicate payment:</strong> If you were charged more than once for the same certificate, we will refund the duplicate amount.</li>
            <li><strong>Technical failure:</strong> If a certificate was not generated or delivered due to a technical issue on our end, you may request a refund or re-issuance.</li>
            <li><strong>Incorrect certificate details:</strong> If the certificate contains errors due to our mistake, we will reissue the certificate at no additional cost.</li>
          </ul>

          <h3 className="text-lg font-medium mb-2 mt-4">2.4 Non-Refundable Scenarios</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Refunds will not be issued in the following cases:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>Change of mind after certificate payment and successful generation.</li>
            <li>Dissatisfaction with the internship program after completion.</li>
            <li>Account suspension or termination due to violation of our Terms & Conditions (including plagiarism or false information).</li>
            <li>Failure to complete internship tasks within the specified duration.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Software Development Services</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Refund and cancellation terms for custom software development projects
            are defined in individual project agreements between {COMPANY.name} and
            the client. These terms vary based on project scope, milestones, and
            deliverables. If you have questions about a specific project agreement,
            please contact us directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. How to Request a Refund</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            To request a refund, please contact us with the following information:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>Your full name and registered email address</li>
            <li>Internship ID or transaction reference number</li>
            <li>Reason for the refund request</li>
            <li>Any supporting evidence (screenshots, receipts)</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            Send your request to{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>
            . We will review your request and respond within 7 business days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Refund Processing</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Approved refunds will be processed within 10–15 business days. Refunds
            will be credited to the original payment method used for the transaction.
            Processing times may vary depending on your bank or payment provider.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Cancellation</h2>
          <h3 className="text-lg font-medium mb-2 mt-4">6.1 Internship Cancellation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You may discontinue your internship at any time by contacting us. However,
            partial completion does not entitle you to a certificate. If you wish to
            rejoin the program later, a new registration may be required.
          </p>

          <h3 className="text-lg font-medium mb-2 mt-4">6.2 Account Cancellation</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You may request deletion of your account by contacting us at{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>
            . Account deletion will remove your personal data in accordance with our{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For any questions about this policy, contact us at{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>
            .
          </p>
        </section>
      </div>
    </Section>
  );
}
