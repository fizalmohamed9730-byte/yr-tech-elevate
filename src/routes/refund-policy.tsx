import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/company";
import {
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  FileCheck2,
  ArrowRight,
  Mail,
} from "lucide-react";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: `Refund & Cancellation Policy | ${COMPANY.name}` },
      {
        name: "description",
        content:
          "Refund and Cancellation Policy for YR NOVATECH — the internship program is completely free, no payments are collected, and no refunds apply.",
      },
      { property: "og:title", content: `Refund Policy — ${COMPANY.name}` },
      {
        property: "og:description",
        content:
          "The internship program at YR NOVATECH is free. No fees are charged, so no payment, refund, or cancellation charges apply.",
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
      title: "No Fees",
      desc: "Registration, participation and certification are completely free.",
    },
    {
      icon: CheckCircle2,
      title: "No Payment",
      desc: "No payment step, UPI ID or transaction reference is ever required.",
    },
    {
      icon: FileCheck2,
      title: "No Refunds Needed",
      desc: "Because nothing is charged, there is nothing to refund.",
    },
    {
      icon: HelpCircle,
      title: "Clear Answers",
      desc: "Questions about this policy are always welcome by email or contact form.",
    },
  ];

  return (
    <Section className="py-12 md:py-20">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
          <FileCheck2 className="h-3.5 w-3.5 text-primary" />
          <span>Legal &amp; Compliance</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          YR NOVATECH does not charge for its internship program, so no payments are collected and no
          refunds or cancellation charges apply.
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
        <Card className="p-6 md:p-10 border border-border bg-card/90 shadow-sm rounded-2xl space-y-10">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">1</span>
              Overview
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This Refund &amp; Cancellation Policy explains how the {COMPANY.name} internship program
              is priced and why no refunds are applicable. The internship program is free of charge:
              there is no registration fee, no participation fee and no certificate fee. Because{" "}
              {COMPANY.name} does not collect any payment for the program, there is no payment to
              verify, cancel, reject or refund.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">2</span>
              Pricing
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Registration, participation and certificate issuance are completely free. Interns are
              never asked to pay a fee, transfer money through UPI, provide a transaction ID / UTR, or
              upload a payment screenshot. Any request for such a payment that claims to come from{" "}
              <strong className="text-foreground">{COMPANY.name}</strong> is not authorised by us.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">3</span>
              Cancellation
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An intern may stop participating at any time. Since no fee is charged, cancelling
              participation does not create any charge, deduction or amount owed, and no refund is
              necessary.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">4</span>
              Certificate Issuance
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Certificates are issued free of charge once all required tasks for the selected duration
              are approved and an admin releases the certificate. Issuance is based on the completeness
              and quality of submitted work, not on any payment.
            </p>
          </section>

          <hr className="border-border" />

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold">5</span>
              Contact Information
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you have any question about this policy, or believe you have been asked for a payment
              connected to our program, contact us:
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
