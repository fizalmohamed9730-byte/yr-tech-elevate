import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/company";
import {
  Briefcase,
  ArrowRight,
  Code2,
  Brain,
  Palette,
  GraduationCap,
  Users,
  Lightbulb,
  Mail,
  ShieldCheck,
  ClipboardList,
  MessageSquare,
  Terminal,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: `Careers at ${COMPANY.name} | Openings & How We Hire` },
      {
        name: "description",
        content: `Current hiring status at ${COMPANY.name}, the engineering profiles we consider, how our recruitment process works, and how to send an expression of interest.`,
      },
      { property: "og:title", content: `Careers — ${COMPANY.name}` },
      {
        property: "og:description",
        content: `Whether we are hiring right now, what we look for, and how to apply to ${COMPANY.name}.`,
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.yrnovatech.in/careers" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/careers" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Careers at ${COMPANY.name}`,
          url: "https://www.yrnovatech.in/careers",
          description:
            "Hiring status, engineering profiles considered, recruitment process and application instructions.",
          publisher: { "@type": "Organization", name: COMPANY.name, url: "https://www.yrnovatech.in" },
        }),
      },
    ],
  }),
  component: Careers,
});

const howWeWork = [
  {
    icon: Lightbulb,
    title: "Learning is part of the job",
    desc: "Engineering moves quickly. We expect people to keep testing their assumptions, share what they have learned, and be willing to change an approach when the evidence changes.",
  },
  {
    icon: Code2,
    title: "Reviewed, typed, documented code",
    desc: "Work goes through review before it ships. We prefer explicit types, tests where they earn their keep, and documentation that a new team member can actually follow.",
  },
  {
    icon: Users,
    title: "Feedback is given directly",
    desc: "Reviews are specific rather than polite. The goal is to improve the work, and people are expected to both give and receive that comfortably.",
  },
  {
    icon: ShieldCheck,
    title: "Ownership through delivery",
    desc: "Engineers stay with their work from scoping to release rather than handing it off midway, which means being accountable for what happens in production.",
  },
];

const profiles = [
  {
    icon: Code2,
    title: "Full stack engineering",
    body: "Building web applications end to end: interface, API, data model, authentication and deployment. Typical work involves React and TypeScript on the front, Node.js or Python behind it, and PostgreSQL underneath.",
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
  },
  {
    icon: Brain,
    title: "Applied AI & data",
    body: "Taking a concrete business question and deciding whether a model actually helps — then building, evaluating and maintaining it. Includes document retrieval, forecasting and analytics pipelines.",
    tags: ["Python", "scikit-learn", "RAG", "pandas"],
  },
  {
    icon: Palette,
    title: "Product & interface design",
    body: "Turning a workflow into an interface people can use without training: information architecture, prototypes, design systems and accessibility review.",
    tags: ["Figma", "Design systems", "Accessibility"],
  },
  {
    icon: GraduationCap,
    title: "Technical mentoring",
    body: "Reviewing internship submissions against a defined task standard and giving written feedback that helps someone improve rather than just pass.",
    tags: ["Code review", "Written feedback", "Mentoring"],
  },
];

const hiringProcess = [
  {
    step: "01",
    icon: ClipboardList,
    title: "We read what you send",
    body: "Applications are reviewed against the work described in them. Links to code, live projects or a portfolio matter more than a long list of technologies.",
  },
  {
    step: "02",
    icon: MessageSquare,
    title: "A conversation",
    body: "If there is a plausible fit, we talk about what you have built, what went wrong along the way, and what you are looking for next.",
  },
  {
    step: "03",
    icon: Terminal,
    title: "A practical discussion",
    body: "We walk through a piece of technical work — usually your own — covering the decisions behind it rather than testing trivia under time pressure.",
  },
  {
    step: "04",
    icon: CheckCircle2,
    title: "A clear decision",
    body: "You hear back either way. If we proceed, scope, expectations and compensation are discussed openly before anything is agreed.",
  },
];

const applyChecklist = [
  "A short note on the kind of work you want to do",
  "Links to code, a live product, or a portfolio you contributed to",
  "A note on your availability — full-time, part-time or contract",
  "Anything you have built here that you would point us at first",
];

function Careers() {
  return (
    <>
      {/* Hero */}
      <Section className="py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            <span>Careers</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
            Careers at {COMPANY.name}
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            This page tells you exactly where our hiring stands, the engineering work we take on,
            how our recruitment process runs, and how to register your interest — without
            advertising roles that do not exist.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border/80 px-4 py-2 rounded-full">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>
              Registered MSME: {COMPANY.udyam} • Headquartered in Tamil Nadu, India
            </span>
          </div>
        </div>
      </Section>

      {/* Honest hiring status */}
      <Section className="!pt-0">
        <Card className="max-w-4xl mx-auto p-6 md:p-8 border border-border bg-card rounded-2xl text-left">
          <div className="flex items-start gap-3 mb-4">
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold">
              !
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-foreground">No current openings</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                We are not recruiting for any specific role at the moment, so this page does not
                list job titles, salaries or closing dates. When a position genuinely opens, it
                will be published here with its own description and a real closing date, and it
                will appear in our sitemap as an indexable listing.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                We do keep an open register of interest. If your work lines up with the areas
                below, you can send it now and we will come back to you when there is something
                concrete to offer — rather than leaving an application sitting against a role that
                was never funded.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              size="sm"
              className="bg-gradient-primary text-primary-foreground shadow-elegant"
            >
              <a href={`mailto:${COMPANY.email}?subject=Expression of Interest — ${COMPANY.name}`}>
                <Mail className="mr-1.5 h-3.5 w-3.5" /> Register your interest
              </a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/contact">Use the contact form</Link>
            </Button>
          </div>
        </Card>
      </Section>

      {/* How we work */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Culture"
          title="How we work"
          description="How engineering actually happens here, so you can judge whether it suits you before applying."
        />
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {howWeWork.map((v) => (
            <Card key={v.title} className="p-6 border border-border bg-card rounded-2xl">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base mb-2 text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Profiles we consider */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="What we look for"
          title="Engineering work we bring people in for"
          description="These are areas we engage people in when there is work for them. They are not current vacancies."
        />
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {profiles.map((role) => (
            <Card
              key={role.title}
              className="flex flex-col p-6 border border-border bg-card hover:shadow-elegant transition-all rounded-2xl"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant mb-4">
                <role.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">{role.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{role.body}</p>
              <div className="flex flex-wrap gap-1.5">
                {role.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Recruitment process */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Process"
          title="How we hire"
          description="What happens after you send something, so you are never left guessing."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {hiringProcess.map((s) => (
            <Card key={s.step} className="p-5 border border-border bg-card rounded-2xl h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <s.icon className="h-4 w-4" />
                </div>
                <span className="text-2xl font-bold text-primary/25">{s.step}</span>
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-2">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* What to send */}
      <Section className="!pt-0">
        <div className="grid md:grid-cols-12 gap-6 max-w-5xl mx-auto items-start">
          <Card className="md:col-span-7 p-6 md:p-8 border border-border bg-card rounded-2xl">
            <h2 className="text-lg font-bold text-foreground mb-3">What to include</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              An expression of interest is short. The parts that matter are evidence of work you
              have actually done and an honest account of your availability.
            </p>
            <ul className="space-y-2.5">
              {applyChecklist.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="md:col-span-5 p-6 md:p-8 border border-border bg-card rounded-2xl">
            <h2 className="text-lg font-bold text-foreground mb-3">Where to send it</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Email is the fastest route. If you would rather describe the situation first, the
              contact form reaches the same inbox.
            </p>
            <p className="text-sm font-medium text-foreground mb-4 break-all">{COMPANY.email}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                size="sm"
                className="bg-gradient-primary text-primary-foreground shadow-elegant"
              >
                <a href={`mailto:${COMPANY.email}?subject=Expression of Interest — ${COMPANY.name}`}>
                  Send an email <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/contact">Contact form</Link>
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* Technology */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Technology"
          title="Technology we work with"
          description="The areas you would realistically be working in, described without overstating our stack."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {[
            { icon: Code2, area: "Frontend", tools: "React, TypeScript, Tailwind CSS, TanStack" },
            { icon: Terminal, area: "Backend", tools: "Node.js, Python, REST APIs" },
            { icon: Brain, area: "Data & AI", tools: "PostgreSQL, pandas, scikit-learn, LLM retrieval" },
            { icon: Palette, area: "Design", tools: "Figma, component libraries, accessibility review" },
            { icon: Users, area: "Collaboration", tools: "Git, code review, issue tracking" },
            { icon: GraduationCap, area: "Delivery", tools: "Cloud hosting, CI/CD, documented releases" },
          ].map((t) => (
            <Card key={t.area} className="p-5 border border-border bg-card rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <t.icon className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t.area}
                </span>
              </div>
              <p className="text-sm text-foreground/90">{t.tools}</p>
            </Card>
          ))}
        </div>
        <div className="max-w-5xl mx-auto mt-5 flex flex-wrap gap-3">
          <Button asChild size="sm" variant="outline">
            <Link to="/services">See how we use this in client work</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/resources">Read our technical guides</Link>
          </Button>
        </div>
      </Section>

      {/* Closing */}
      <Section className="!pt-0">
        <Card className="max-w-3xl mx-auto p-8 md:p-12 border border-border bg-gradient-to-br from-card to-accent/20 text-center rounded-3xl shadow-elegant">
          <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elegant">
            <Mail className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Not hiring right now — but still worth saying hello
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-lg mx-auto">
            Small teams hire in bursts. If your experience lines up with the work described above,
            send it once and we will keep it on file for when something opens.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary text-primary-foreground shadow-elegant"
            >
              <a href={`mailto:${COMPANY.email}?subject=Expression of Interest — ${COMPANY.name}`}>
                Email your details <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent text-foreground">
              <Link to="/internship">Looking for an internship instead?</Link>
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}
