import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/Section";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: `Refund & Cancellation Policy | ${COMPANY.name}` },
      {
        name: "description",
        content:
          "Refund and Cancellation Policy for YR NOVATECH — how certificate fee payments are verified, rejected, and handled, including refund eligibility and processing.",
      },
      { property: "og:title", content: `Refund Policy — ${COMPANY.name}` },
      {
        property: "og:description",
        content:
          "The applicable rules for YR NOVATECH payments, cancellation, verification, rejection, and refunds.",
      },
      { property: "og:url", content: "https://yrnovatech.in/refund-policy" },
    ],
    links: [{ rel: "canonical", href: "https://yrnovatech.in/refund-policy" }],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Legal"
        title="Refund & Cancellation Policy"
        description={`Last updated: September 2026`}
      />

      <div className="max-w-3xl mx-auto space-y-10">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Overview</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This Refund & Cancellation Policy explains how payments made through the {COMPANY.name}{" "}
            website are handled, including payment verification, cancellation, rejected payments,
            and refunds. It applies only to payments that are actually made through the website.
            Registration for our internship programs is free, and this policy never implies a right
            to a refund that has not been decided by {COMPANY.name}.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Applicable Payments</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Where a payment applies to an internship, it is a certificate processing fee for the
            generation and delivery of an internship completion certificate. The applicable fee, if
            any, is shown to the intern inside their account dashboard at the appropriate stage. The
            internship program itself does not charge a registration fee. Payments made through the
            website are made using the payment method displayed in the account (UPI); {COMPANY.name}{" "}
            does not operate its own payment gateway and does not collect or store card or bank
            account details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Payment Verification</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            When you submit a payment, it is verified manually by the {COMPANY.name}
            team. Until verification is complete, the payment is marked as <em>pending</em>. Once
            the team confirms the transaction, the payment is marked as <em>paid</em>. If the
            transaction cannot be confirmed, the payment is marked as <em>rejected</em> with a
            reason, and you may resubmit with correct details. Certificate issuance is subject to
            the successful verification of payment where a payment requirement applies. Payment
            status is therefore always subject to verification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. UTR / Transaction Reference</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Verification relies on the UTR number or transaction reference you provide when
            submitting payment. You must enter the transaction or UTR ID exactly as it appears in
            your payment confirmation. An incorrect, incomplete, or unverifiable reference may delay
            verification or result in the payment being marked as rejected for further correction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Payment Screenshot, if applicable</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Where a payment screenshot is requested, you may upload a screenshot of the payment
            confirmation. The screenshot is used only to help the team confirm that the payment was
            completed. It must match the transaction reference you provide. Screenshots that are
            unclear, edited, or do not match the reference may not be accepted for verification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Duplicate Payments</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you submit the same payment more than once and the duplicate is confirmed,
            {COMPANY.name} will review the duplicate amount with you. Any duplicate that is
            confirmed as an overpayment may be eligible for refund after verification. Contact us
            with the relevant transaction references so both payments can be matched.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Failed Payments</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If a payment attempt fails or is not completed, your account will not show a confirmed
            payment, and no certificate will be issued. Failed or declined attempts are not charged
            to you. You may retry the payment. Because payment is manual, please confirm the
            transaction actually completed in your payment app before submitting your reference.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Rejected Payments</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If our team cannot verify a payment — for example, because the reference cannot be
            matched or the screenshot is unclear — the payment is marked as <em>rejected</em> with
            the reason. This does not automatically entitle you to a refund; it means the submitted
            details need correction. You can resubmit your payment details with the correct
            information. If a payment was actually debited but cannot be matched, we will help you
            trace it, and any confirmed duplicate or mistaken debit will be handled under section 6
            above.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Cancellation</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Internship participation can be cancelled by the intern at any time by contacting us.
            Partial completion does not entitle anyone to a certificate or to a refund of a
            certificate fee. Because certificate payments are collected only after task completion
            and verification, cancellation of an internship before that stage normally means no
            certificate fee has been paid. A confirmed, verified payment that is not eligible under
            these terms is not refundable merely because the internship is later discontinued.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Refund Eligibility</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Refunds are considered on a case-by-case basis and are granted at the sole discretion of{" "}
            {COMPANY.name}. Situations that may be considered for refund, after verification:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>A confirmed duplicate payment for the same certificate.</li>
            <li>Payment made but the certificate was not issued due to an error on our side.</li>
            <li>Technical failure on our side preventing certificate production or delivery.</li>
            <li>
              An incorrect certificate issued due to our mistake, which we will reissue or correct
              at no additional cost.
            </li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            This list is not a promise that any refund will be granted. Each request is verified and
            reviewed before any decision is made.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Non-Refundable Situations</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            Refunds are generally not available in situations such as:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
            <li>Change of mind after a verified payment and successful certificate issuance.</li>
            <li>Dissatisfaction with the internship program after completion.</li>
            <li>
              Account suspension or termination due to violation of our Terms & Conditions (for
              example, plagiarism or false information).
            </li>
            <li>Failure to complete internship tasks within the selected duration.</li>
            <li>
              Submission details that cannot be verified (such as an incorrect UTR reference).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. Refund Processing</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If a refund is approved, it is returned to the same payment account or method used for
            the original transaction, after the original payment is confirmed. Refund processing is
            initiated after verification, and the actual time taken depends on your bank or payment
            provider. {COMPANY.name} does not state a fixed refund period and does not guarantee any
            refund.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To request a refund, report a duplicate or failed payment, or ask questions about this
            policy, contact us via our{" "}
            <Link to="/contact" className="text-primary hover:underline">
              contact page
            </Link>{" "}
            or email us at{" "}
            <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
              {COMPANY.email}
            </a>{" "}
            with your registered name, internship ID, and, where relevant, the transaction or UTR
            reference.
          </p>
          <p className="text-sm text-muted-foreground mt-6">
            Related policies:{" "}
            <Link to="/terms-and-conditions" className="text-primary hover:underline">
              Terms & Conditions
            </Link>{" "}
            ·{" "}
            <Link to="/privacy-policy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </section>
      </div>
    </Section>
  );
}
