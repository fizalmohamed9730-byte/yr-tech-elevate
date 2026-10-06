import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import {
  Search,
  ClipboardList,
  Palette,
  Code2,
  Bug,
  Rocket,
  Wrench,
  Lightbulb,
  ShieldCheck,
  Eye,
  BookOpen,
  Users,
  UserPlus,
  FileText,
  Linkedin,
  Github,
  ClipboardCheck,
  Award,
  Lock,
  Scale,
  RotateCcw,
  ArrowRight,
  Building2,
  BadgeCheck,
  Mail,
  Monitor,
  Server,
  Database,
  Brain,
  Terminal,
  Telescope,
  Target,
} from "lucide-react";
import msmeLogo from "@/assets/msme-logo.png";
import { COMPANY } from "@/lib/company";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ads";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About YR NOVATECH - Software Development & Technology Company" },
      {
        name: "description",
        content:
          "YR NOVATECH is a software development and technology company focused on custom software, web and mobile applications, AI solutions, and hands-on project-based internship programs for aspiring engineers.",
      },
      { property: "og:title", content: "About YR NOVATECH" },
      {
        property: "og:description",
        content:
          "Software development and technology company focused on custom software, web and mobile applications, AI solutions, and project-based internship programs.",
      },
      { property: "og:url", content: "https://www.yrnovatech.in/about" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "YR NOVATECH",
          description:
            "Software development and technology company focused on custom software, web and mobile applications, AI solutions, and project-based internship programs.",
          url: "https://www.yrnovatech.in",
          email: COMPANY.email,
        }),
      },
    ],
  }),
  component: About,
});

const whatWeDo = [
  "Custom Software Development",
  "AI & Machine Learning Solutions",
  "Web & Mobile Application Development",
  "UI/UX Design & Product Strategy",
  "Project-Based Internship Programs",
];

const values = [
  {
    icon: Lightbulb,
    title: "Practical Innovation",
    text: "We turn ideas into working software that solves real problems.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Engineering",
    text: "We hold our work to high standards of correctness, security, and maintainability.",
  },
  {
    icon: Eye,
    title: "Transparency",
    text: "We communicate clearly about process, progress, and outcomes.",
  },
  {
    icon: BookOpen,
    title: "Continuous Learning",
    text: "We keep our skills current and share knowledge with interns and peers.",
  },
  {
    icon: Users,
    title: "User-Centered Development",
    text: "We build products around the people who will actually use them.",
  },
];

const approach = [
  {
    icon: Search,
    title: "Requirement Understanding",
    text: "We clarify goals, scope, and constraints before writing a line of code.",
  },
  {
    icon: ClipboardList,
    title: "Planning",
    text: "We define architecture, milestones, and deliverables so progress is measurable.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    text: "We design interfaces that are intuitive, accessible, and aligned with user needs.",
  },
  {
    icon: Code2,
    title: "Development",
    text: "We build clean, maintainable software using modern, proven technologies.",
  },
  {
    icon: Bug,
    title: "Testing",
    text: "We validate functionality thoroughly before anything reaches production.",
  },
  {
    icon: Rocket,
    title: "Deployment",
    text: "We ship releases carefully and monitor them in live environments.",
  },
  {
    icon: Wrench,
    title: "Maintenance & Improvement",
    text: "We support and improve products after launch based on real usage.",
  },
];

const technology = [
  { icon: Monitor, title: "Frontend", items: ["React", "TypeScript", "Tailwind CSS"] },
  { icon: Server, title: "Backend", items: ["Node.js", "Python", "FastAPI", "REST APIs"] },
  { icon: Database, title: "Data & Platform", items: ["PostgreSQL", "Supabase"] },
  {
    icon: Brain,
    title: "AI / ML",
    items: ["Python", "LangChain", "RAG", "LLM APIs", "Data Pipelines"],
  },
  { icon: Palette, title: "Design", items: ["Figma", "Design Systems"] },
  { icon: Terminal, title: "DevOps", items: ["Vercel", "Docker", "CI/CD", "Git"] },
];

const internshipFlow = [
  { icon: UserPlus, title: "Register", text: "Create an account and choose your domain." },
  { icon: FileText, title: "Offer Letter", text: "Receive an official offer letter on approval." },
  {
    icon: Linkedin,
    title: "Connect",
    text: "Share your internship announcement with your network.",
  },
  { icon: Code2, title: "Build", text: "Complete real project tasks guided by the program." },
  { icon: Github, title: "Submit", text: "Submit your work for review." },
  {
    icon: ClipboardCheck,
    title: "Get Reviewed",
    text: "Receive feedback and approval on your tasks.",
  },
  {
    icon: Award,
    title: "Certificate",
    text: "Earn a verifiable certificate on successful completion.",
  },
];

const legalCards = [
  {
    icon: Lock,
    title: "Privacy Policy",
    description:
      "Learn how YR NOVATECH handles account, registration, enquiry, internship, submission, and related information.",
    to: "/privacy-policy",
  },
  {
    icon: Scale,
    title: "Terms & Conditions",
    description:
      "Review the rules governing use of the website, accounts, services, internship participation, submissions, certificates, and payments.",
    to: "/terms-and-conditions",
  },
  {
    icon: RotateCcw,
    title: "Refund & Cancellation Policy",
    description:
      "Review the applicable rules for payments, cancellation, verification, rejection, and refunds.",
    to: "/refund-policy",
  },
];

function About() {
  return (
    <>
      <Section>
          <SectionHeading eyebrow="About YR NOVATECH" title="Who We Are" asH1 />
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            YR NOVATECH is a software development and technology company. We design, build, and
            maintain custom software — from web and mobile applications to AI-powered tools and
            complete digital products. Alongside our client work, we run structured, project-based
            internship programs that help students and aspiring engineers bridge the gap between
            academic learning and industry requirements through hands-on experience, guided
            projects, and professional feedback.
          </p>
        </div>
      </Section>

      <Section className="!pt-0">
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <Reveal>
            <Card className="p-8 border border-border bg-card shadow-elegant h-full flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-5 shadow-elegant">
                <Telescope className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">Vision</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To become a trusted technology company that builds innovative, reliable, and
                accessible digital solutions while creating meaningful opportunities for students,
                developers, and businesses to grow through technology.
              </p>
            </Card>
          </Reveal>
          <Reveal delay={80}>
            <Card className="p-8 border border-border bg-card shadow-elegant h-full flex flex-col">
              <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-5 shadow-elegant">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold mb-2">Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To develop practical software solutions using modern technologies, deliver quality
                digital services, and provide hands-on technology learning and internship
                opportunities that help students and aspiring developers build real-world skills.
              </p>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Section className="!pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Services"
            title="What We Do"
            description="The core services YR NOVATECH delivers for businesses, startups, and individual learners."
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {whatWeDo.map((item) => (
            <Reveal key={item} delay={80}>
              <Card className="p-6 border border-border h-full">
                <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Values"
            title="Our Values"
            description="The principles that guide how we build software, run our internship program, and work with clients and interns."
          />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 80}>
              <Card className="p-5 border border-border flex items-start gap-4 h-full">
                <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                  <v.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{v.title}</h3>
                  <p className="text-sm text-muted-foreground">{v.text}</p>
                </div>
              </Card>
            </Reveal>
          ))}

          <Reveal delay={400}>
            <Card className="p-5 border border-border flex items-start gap-4 h-full bg-gradient-to-br from-accent/40 to-transparent">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">Hands-On, Not Theory</h3>
                <p className="text-sm text-muted-foreground">
                  Both our products and our internships are built around real, practical work.
                </p>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      <Section className="!pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Technology Focus"
            title="Technology Focus"
            description="Technologies we use and support across our software and internship programs."
          />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {technology.map((t, i) => (
            <Reveal key={t.title} delay={i * 60}>
              <Card className="p-6 border border-border h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <t.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm">{t.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {t.items.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full bg-secondary border border-border px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Engineering Approach"
            title="How We Engineer Software"
            description="A structured, end-to-end approach from first conversation to long-term support."
          />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {approach.map((a, i) => (
            <Reveal key={a.title} delay={i * 60}>
              <Card className="p-6 border border-border hover:shadow-elegant hover:-translate-y-1 transition-all h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
                    <a.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-bold text-primary/70 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-semibold text-base mb-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="!pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Internship & Technology Learning"
            title="Learning by Building"
            description="Our internship program teaches through real project tasks, structured review, and verifiable outcomes."
          />
        </Reveal>
        <div className="max-w-3xl mx-auto text-center mb-10">
          <p className="text-sm text-muted-foreground leading-relaxed">
            YR NOVATECH internship programs are task-based learning experiences. Interns register,
            choose a domain, receive an offer letter on approval, and work through guided project
            tasks. Completed work is submitted for review, and approved submissions build toward a
            verifiable certificate. The program is about practical skill development — pay attention
            to task requirements, deadlines, and review feedback throughout.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {internshipFlow.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <Card className="p-5 border border-border text-center h-full">
                <div className="h-11 w-11 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-3 shadow-elegant">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.text}</p>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="max-w-3xl mx-auto text-center mt-10">
          <Button
            asChild
            size="lg"
            className="bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            <Link to="/internship">
              Explore the Internship Program <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      <Section className="!pt-0">
        <Reveal>
          <Card className="max-w-4xl mx-auto p-8 border border-border bg-card shadow-elegant">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="shrink-0">
                <img
                  src={msmeLogo}
                  alt="MSME Registered Company"
                  className="h-24 sm:h-28 w-auto object-contain"
                  width={120}
                  height={120}
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl sm:text-2xl font-bold mb-2">Business Information</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-foreground">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold">{COMPANY.name}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                    <BadgeCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      MSME/Udyam Registration:{" "}
                      <span className="font-mono font-semibold text-foreground">
                        {COMPANY.udyam}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      Official Email:{" "}
                      <a href={`mailto:${COMPANY.email}`} className="text-primary hover:underline">
                        {COMPANY.email}
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Reveal>
      </Section>

      <Section className="!pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Policies & Legal Information"
            title="Policies & Legal Information"
            description="Key policies that govern the use of our website, services, internship program, and payments."
          />
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {legalCards.map((c) => (
            <Reveal key={c.title} delay={80}>
              <Card className="p-6 border border-border h-full flex flex-col">
                <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 shadow-elegant">
                  <c.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-base mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">
                  {c.description}
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={c.to}>
                    Read {c.title} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <AdSlot slot={AD_SLOTS.contentInline} className="py-2" />

      {/* Explore the site */}
      <Section className="!pt-0">
        <Reveal>
          <SectionHeading
            eyebrow="Explore"
            title="Where to go next"
            description="The rest of the site, grouped by what you are probably trying to find out."
          />
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {[
            {
              to: "/services" as const,
              title: "What we build",
              body: "Each service explained: the problems it solves, our approach, deliverables and who it suits.",
            },
            {
              to: "/internship" as const,
              title: "Internship program",
              body: "Domains, durations, the task and review process, certificates and how to apply.",
            },
            {
              to: "/projects" as const,
              title: "Projects & case studies",
              body: "What we publish as engineering work, and when selected case studies become available.",
            },
            {
              to: "/resources" as const,
              title: "Technology resources",
              body: "Practical guides on full stack development, applied AI, data analytics and UI/UX.",
            },
            {
              to: "/faq" as const,
              title: "Frequently asked questions",
              body: "Straight answers on services, certificates, payments, durations and company information.",
            },
            {
              to: "/careers" as const,
              title: "Careers",
              body: "Our current hiring status, the work we bring people in for, and how we recruit.",
            },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <Card className="p-6 border border-border h-full flex flex-col">
                <h3 className="font-semibold text-base mb-2">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-5">{c.body}</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={c.to}>
                    {c.title} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </Reveal>
          ))}
        </div>
        <div className="max-w-5xl mx-auto mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="sm" variant="ghost">
            <Link to="/contact">Contact YR NOVATECH</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to="/privacy-policy">Privacy Policy</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link to="/refund-policy">Refund Policy</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
