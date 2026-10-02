import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/company";
import {
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileCheck2,
  CreditCard,
  Clock,
  ArrowRight,
  AlertCircle,
  Mail,
} from "lucide-react";

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
      { property: "og:url", content: "https://www.yrnovatech.in/refund-policy" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/refund-policy" }],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "Free Registration",
      desc: "Internship enrolment is 100% free with zero upfront charges.",
    },
    {
      icon: CreditCard,
      title: "Manual Verification",
      desc: "UPI payments verified through UTR & transaction records.",
    },
    {
      icon: RotateCcw,
      title: "Duplicate Safeguards",
      desc: "Accidental double debits are reviewed & refunded upon audit.",
    },
    {
      icon: Clock,
      title: "Transparent Review",
      desc: "Clear reasons provided if reference details require correction.",
    },
  ];

  return (
    <Section className="py-12 md:py-20">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
          <FileCheck2 className="h-3.5 w-3.5 text-primary" />
          <span>Legal & Compliance</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Clear, transparent guidelines regarding payment verification, certificate processing, duplicate safeguards, and refund eligibility.
        </p>
        <div className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs font-normal border-border">
            Last updated: September 2026
          </Badge>
          <span>•</span>
          <span>Version 2.1</span>
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
              Overview
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This Refund &amp; Cancellation Policy explains how payments made through the {COMPANY.name}{" "}
              website are handled, including payment verification, cancellation, rejected payments,
              and refunds. It applies only to payments that are actually made through the website.
              Registration for our internship programs is free, and this policy never implies a right
              to a refund that has not been decided by {COMPANY.name}.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
              Applicable Payments
            </h2>
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

          <hr className="border-border" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
              Payment Verification
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you submit a payment, it is verified manually by the {COMPANY.name}{" "}
              team. Until verification is complete, the payment is marked as <em className="font-semibold text-foreground">pending</em>. Once
              the team confirms the transaction, the payment is marked as <em className="font-semibold text-foreground">paid</em>. If the
              transaction cannot be confirmed, the payment is marked as <em className="font-semibold text-foreground">rejected</em> with a
              reason, and you may resubmit with correct details. Certificate issuance is subject to
              the successful verification of payment where a payment requirement applies. Payment
              status is therefore always subject to verification.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">4</span>
              UTR / Transaction Reference
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Verification relies on the UTR number or transaction reference you provide when
              submitting payment. You must enter the transaction or UTR ID exactly as it appears in
              your payment confirmation. An incorrect, incomplete, or unverifiable reference may delay
              verification or result in the payment being marked as rejected for further correction.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">5</span>
              Payment Screenshot, if applicable
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Where a payment screenshot is requested, you may upload a screenshot of the payment
              confirmation. The screenshot is used only to help the team confirm that the payment was
              completed. It must match the transaction reference you provide. Screenshots that are
              unclear, edited, or do not match the reference may not be accepted for verification.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">6</span>
              Duplicate Payments
            </h2>
            <div className="p-4 rounded-xl bg-accent/40 border border-border/80">
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you submit the same payment more than once and the duplicate is confirmed,{" "}
                <strong className="text-foreground">{COMPANY.name}</strong> will review the duplicate amount with you. Any duplicate that is
                confirmed as an overpayment may be eligible for refund after verification. Contact us
                with the relevant transaction references so both payments can be matched.
              </p>
            </div>
          </section>

          <hr className="border-border" />

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">7</span>
              Failed Payments
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If a payment attempt fails or is not completed, your account will not show a confirmed
              payment, and no certificate will be issued. Failed or declined attempts are not charged
              to you. You may retry the payment. Because payment is manual, please confirm the
              transaction actually completed in your payment app before submitting your reference.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">8</span>
              Rejected Payments
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If our team cannot verify a payment — for example, because the reference cannot be
              matched or the screenshot is unclear — the payment is marked as <em className="font-semibold text-foreground">rejected</em> with
              the reason. This does not automatically entitle you to a refund; it means the submitted
              details need correction. You can resubmit your payment details with the correct
              information. If a payment was actually debited but cannot be matched, we will help you
              trace it, and any confirmed duplicate or mistaken debit will be handled under section 6
              above.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 9 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">9</span>
              Cancellation
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Internship participation can be cancelled by the intern at any time by contacting us.
              Partial completion does not entitle anyone to a certificate or to a refund of a
              certificate fee. Because certificate payments are collected only after task completion
              and verification, cancellation of an internship before that stage normally means no
              certificate fee has been paid. A confirmed, verified payment that is not eligible under
              these terms is not refundable merely because the internship is later discontinued.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 10 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">10</span>
              Refund Eligibility
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Refunds are considered on a case-by-case basis and are granted at the sole discretion of{" "}
              <strong className="text-foreground">{COMPANY.name}</strong>. Situations that may be considered for refund, after verification:
            </p>
            <div className="grid gap-2.5 pt-2">
              {[
                "A confirmed duplicate payment for the same certificate.",
                "Payment made but the certificate was not issued due to an error on our side.",
                "Technical failure on our side preventing certificate production or delivery.",
                "An incorrect certificate issued due to our mistake, which we will reissue or correct at no additional cost.",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground/90">{item}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground italic pt-2">
              Note: This list is not a promise that any refund will be granted. Each request is verified and reviewed before any decision is made.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 11 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">11</span>
              Non-Refundable Situations
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Refunds are generally not available in situations such as:
            </p>
            <div className="grid gap-2.5 pt-2">
              {[
                "Change of mind after a verified payment and successful certificate issuance.",
                "Dissatisfaction with the internship program after completion.",
                "Account suspension or termination due to violation of our Terms & Conditions (e.g., plagiarism or false information).",
                "Failure to complete internship tasks within the selected duration.",
                "Submission details that cannot be verified (such as an incorrect UTR reference).",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground/90">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <hr className="border-border" />

          {/* Section 12 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">12</span>
              Refund Processing
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If a refund is approved, it is returned to the same payment account or method used for
              the original transaction, after the original payment is confirmed. Refund processing is
              initiated after verification, and the actual time taken depends on your bank or payment
              provider. {COMPANY.name} does not state a fixed refund period and does not guarantee any
              refund.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 13 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">13</span>
              Contact Information
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To request a refund, report a duplicate or failed payment, or ask questions about this
              policy, contact us with your registered name, internship ID, and transaction reference:
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <HelpCircle className="h-4 w-4" />
                Contact Support Desk
              </Link>
              <a
                href={`mailto:${COMPANY.email}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-card hover:bg-accent text-foreground font-medium text-sm transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                {COMPANY.email}
              </a>
            </div>

            <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Related documentation:</span>
              <div className="flex items-center gap-4">
                <Link to="/terms-and-conditions" className="text-primary hover:underline flex items-center gap-1">
                  Terms &amp; Conditions <ArrowRight className="h-3 w-3" />
                </Link>
                <Link to="/privacy-policy" className="text-primary hover:underline flex items-center gap-1">
                  Privacy Policy <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>
        </Card>
      </div>
    </Section>
  );
}
