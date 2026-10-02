import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Section } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/company";
import {
  HelpCircle,
  Mail,
  Search,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

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

type FAQCategory = "All" | "Internship" | "Certificates" | "Payments" | "General";

interface FAQItem {
  q: string;
  a: string;
  category: "Internship" | "Certificates" | "Payments" | "General";
}

const faqs: FAQItem[] = [
  {
    q: "What is YR NOVATECH?",
    a: "YR NOVATECH is a registered MSME software development and technology company. We build custom software, web and mobile applications, and AI-powered solutions, alongside running structured, project-based internship programs for students and aspiring engineers.",
    category: "General",
  },
  {
    q: "Is the internship a job?",
    a: "No. Our internship program is a project-based learning experience, not employment. Participating interns are not employees of YR NOVATECH, and the program does not guarantee employment, placement, or any specific career outcome.",
    category: "Internship",
  },
  {
    q: "Which internship domains are available?",
    a: "Internship domains include Full Stack Development, UI/UX Design, C++ Programming, Python Programming, and Artificial Intelligence. You choose your preferred domain at registration.",
    category: "Internship",
  },
  {
    q: "What are the internship durations?",
    a: "You can select a duration of 1 month, 2 months, or 3 months at the time of registration, based on your academic calendar and schedule.",
    category: "Internship",
  },
  {
    q: "Is registration free?",
    a: "Yes. Registration for the internship program is completely free, and there is no fee to apply or participate. A certificate processing fee may apply in certain flows and is transparently shown in your account before payment.",
    category: "Payments",
  },
  {
    q: "How does the internship program work?",
    a: "The program follows 7 clear steps: register and pick a domain, receive your offer letter on approval, share your internship announcement, complete project tasks, submit your work for review, receive feedback and approval, and earn a verifiable certificate on successful completion.",
    category: "Internship",
  },
  {
    q: "Will I definitely receive a certificate?",
    a: "Certificates are issued to interns who complete all required tasks for their selected duration and receive approval for those tasks. Where a certificate payment requirement applies, the payment must also be made and verified. Issuance is based on the completeness and quality of your submitted work.",
    category: "Certificates",
  },
  {
    q: "How are tasks submitted and reviewed?",
    a: "After registration, you receive project tasks inside your account dashboard. You submit your completed work (for example, a GitHub repository, project link, or other required deliverable) from the dashboard. Our team reviews submissions and either approves them or returns them with feedback for revision.",
    category: "Internship",
  },
  {
    q: "Are certificates verifiable?",
    a: "Yes. Issued certificates include a unique verification code, and certificates can be checked publicly anytime using the Internship Verification tool on our website.",
    category: "Certificates",
  },
  {
    q: "What payments are involved?",
    a: "Where a certificate processing fee applies, the amount is shown in your account before payment. Payment is made using the payment method displayed in your account (UPI), and you provide the transaction or UTR reference for verification. Payments are verified manually, so payment status is always subject to verification. See our Refund & Cancellation Policy for details.",
    category: "Payments",
  },
  {
    q: "Can fees be refunded?",
    a: "Refunds are considered on a case-by-case basis, at our discretion and after verification. They are not guaranteed and are generally not available after a verified payment and successful certificate issuance. See our Refund & Cancellation Policy for the full details.",
    category: "Payments",
  },
  {
    q: "How can I contact YR NOVATECH?",
    a: "You can reach us through our contact page or by emailing our support desk directly at support@yrnovatech.in. We respond to inquiries within 24 business hours.",
    category: "General",
  },
];

const categories: FAQCategory[] = ["All", "Internship", "Certificates", "Payments", "General"];

function Faq() {
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (q: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [q]: !prev[q],
    }));
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.category === selectedCategory;
      const qLower = faq.q.toLowerCase();
      const aLower = faq.a.toLowerCase();
      const queryLower = searchQuery.toLowerCase().trim();
      const matchesSearch =
        queryLower === "" || qLower.includes(queryLower) || aLower.includes(queryLower);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <Section className="py-12 md:py-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
          <HelpCircle className="h-3.5 w-3.5 text-primary" />
          <span>Knowledge &amp; Support</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
          Frequently Asked Questions
        </h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about our software solutions, technical internship programs, task evaluations, and certifications.
        </p>

        {/* Search Bar */}
        <div className="mt-8 max-w-lg mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords (e.g. certificates, UPI, domains)..."
            className="pl-11 pr-4 py-3 h-12 text-sm rounded-xl border-border bg-card shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-semibold text-base text-foreground mb-1">No matching questions found</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Try a different keyword or browse by category.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="text-xs text-primary font-medium hover:underline"
            >
              Clear search &amp; filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openItems[faq.q] ?? true;
            return (
              <Card
                key={faq.q}
                className="overflow-hidden border border-border bg-card/90 transition-all rounded-xl"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(faq.q)}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div>
                      <h3 className="font-semibold text-base text-foreground leading-snug">
                        {faq.q}
                      </h3>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-[10px] px-2 py-0 border-border/70 text-muted-foreground">
                          {faq.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground mt-1 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-border/40 pl-10">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Still Have Questions Box */}
      <div className="max-w-3xl mx-auto mt-12">
        <Card className="p-6 md:p-8 border border-border bg-card/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-base text-foreground">Still have questions?</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Our support team is happy to assist you with any questions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="bg-primary text-primary-foreground">
              <Link to="/contact">
                Contact Us <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <a
              href={`mailto:${COMPANY.email}`}
              className="text-xs text-muted-foreground hover:text-foreground font-medium underline"
            >
              Email Support
            </a>
          </div>
        </Card>
      </div>
    </Section>
  );
}
