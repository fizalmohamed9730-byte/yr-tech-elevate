import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, SectionHeading } from "@/components/Section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMPANY } from "@/lib/company";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Code2,
  Brain,
  Palette,
  GraduationCap,
  Heart,
  Zap,
  Users,
  Lightbulb,
  Mail,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Laptop,
} from "lucide-react";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: `Careers at ${COMPANY.name} — Join Our Team` },
      {
        name: "description",
        content: `Explore career opportunities at ${COMPANY.name}. We're building a team of engineers, designers, and AI developers who are passionate about creating impactful software.`,
      },
      { property: "og:title", content: `Careers — ${COMPANY.name}` },
      {
        property: "og:description",
        content: `Join the ${COMPANY.name} team. We're looking for talented engineers, designers, and AI developers.`,
      },
      { property: "og:url", content: "https://www.yrnovatech.in/careers" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/careers" }],
  }),
  component: Careers,
});

const cultureValues = [
  {
    icon: Lightbulb,
    title: "Learning-First Culture",
    desc: "We invest in continuous learning. Team members regularly explore new technologies, share knowledge, and grow their skills through real production deliverables.",
  },
  {
    icon: Code2,
    title: "Engineering Excellence",
    desc: "We write clean, strictly-typed code. We value thoughtful architecture, thorough automated testing, and solid documentation over shortcuts.",
  },
  {
    icon: Users,
    title: "Mentorship & Collaboration",
    desc: "Senior engineers actively mentor juniors. We believe great engineering teams are built through knowledge sharing and collaborative problem-solving.",
  },
  {
    icon: Zap,
    title: "Ownership & Direct Impact",
    desc: "Every team member owns their work from concept to deployment. We value initiative, independent thinking, and taking responsibility for outcomes.",
  },
];

const perks = [
  {
    icon: Laptop,
    title: "Remote-Friendly Setup",
    desc: "Work comfortably with flexible hours and asynchronous communication practices.",
  },
  {
    icon: Sparkles,
    title: "Cutting-Edge Tooling",
    desc: "Access modern AI assistants, cloud sandboxes, and modern developer tooling.",
  },
  {
    icon: GraduationCap,
    title: "Continuous Learning",
    desc: "Dedicated time and sponsorship for technical courses, books, and certifications.",
  },
  {
    icon: Heart,
    title: "Healthy Work Balance",
    desc: "Realistic sprint commitments that respect personal wellness and sustainable momentum.",
  },
];

const hiringAreas = [
  {
    icon: Code2,
    title: "Full Stack Engineer",
    type: "Remote / Hybrid",
    level: "Mid - Senior",
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    desc: "Architect and build end-to-end web applications, internal SaaS platforms, and secure APIs for our client engagements.",
  },
  {
    icon: Brain,
    title: "AI / ML Solutions Engineer",
    type: "Remote",
    level: "Junior - Mid",
    tags: ["Python", "LangChain", "RAG", "LLM APIs"],
    desc: "Develop production-ready LLM pipelines, context retrieval vector systems, and automated data ingestion agents.",
  },
  {
    icon: Palette,
    title: "Product & UI/UX Designer",
    type: "Contract / Project",
    level: "Mid",
    tags: ["Figma", "Design Systems", "Prototyping", "WCAG"],
    desc: "Create responsive web designs, intuitive user journeys, interactive high-fidelity prototypes, and component design tokens.",
  },
  {
    icon: GraduationCap,
    title: "Technical Program Mentor",
    type: "Part-time / Flexible",
    level: "Fellow - Senior",
    tags: ["Code Review", "Mentorship", "Full Stack", "Python"],
    desc: "Review student code submissions, provide constructive engineering feedback, and guide aspiring interns through real milestones.",
  },
];

const techStack = [
  { area: "Frontend", tools: "React 19, Next.js, TypeScript, TailwindCSS, TanStack" },
  { area: "Backend", tools: "Node.js, Python, FastAPI, Express, REST APIs" },
  { area: "Database", tools: "PostgreSQL, Supabase, Redis, Pinecone" },
  { area: "AI / ML", tools: "Python, LangChain, RAG, OpenAI/Claude APIs, Embeddings" },
  { area: "Design", tools: "Figma, Adobe Suite, Scalable Design Systems" },
  { area: "DevOps", tools: "Vercel, Docker, CI/CD, Git, GitHub Actions" },
];

function Careers() {
  return (
    <>
      {/* Hero */}
      <Section className="py-12 md:py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            <span>Join Our Team</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
            Build Meaningful Software <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              With Engineers Who Care
            </span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
            We are a focused technology company building custom digital products and training the next generation of engineers through hands-on craft.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border/80 px-4 py-2 rounded-full">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Registered MSME Enterprise: {COMPANY.udyam} • Headquartered in Tamil Nadu, India</span>
          </div>
        </div>
      </Section>

      {/* Culture & Values */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Culture"
          title="How We Work &amp; Think"
          description="Our values shape how we build products, collaborate with clients, and mentor fellows."
        />
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {cultureValues.map((v) => (
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

      {/* Perks Strip */}
      <Section className="!pt-0">
        <div className="max-w-5xl mx-auto p-8 md:p-10 rounded-3xl bg-secondary/30 border border-border/70">
          <SectionHeading
            eyebrow="Benefits"
            title="What We Offer"
            description="A supportive, no-bureaucracy environment where developers do their best work."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {perks.map((p) => (
              <div key={p.title} className="p-4 rounded-xl bg-card border border-border/70">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <p.icon className="h-4 w-4" />
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-1">{p.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Open Focus Areas / Opportunities */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Openings &amp; Focus Areas"
          title="Areas We Are Growing"
          description="We are always looking for passionate engineers and mentors. Explore our active tracks below."
        />
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          {hiringAreas.map((role) => (
            <Card
              key={role.title}
              className="flex flex-col justify-between p-6 border border-border bg-card hover:shadow-elegant hover:-translate-y-1 transition-all rounded-2xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant group-hover:scale-105 transition-transform">
                    <role.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[11px] font-medium border-border">
                      {role.type}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px] font-medium">
                      {role.level}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {role.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {role.desc}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {role.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] px-2.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Rolling reviews</span>
                <Button asChild size="sm" variant="ghost" className="text-xs text-primary font-semibold hover:bg-primary/10">
                  <a href={`mailto:${COMPANY.email}?subject=Application: ${role.title}`}>
                    Apply for Role <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Tech Stack */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Technology"
          title="Our Core Engineering Stack"
          description="The modern frameworks and services powering our applications and internship tracks."
        />
        <Card className="max-w-3xl mx-auto p-6 md:p-8 border border-border bg-card rounded-2xl shadow-sm">
          <div className="space-y-4">
            {techStack.map((t) => (
              <div key={t.area} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-md shrink-0 w-28 text-center">
                  {t.area}
                </span>
                <p className="text-sm text-foreground/90 font-mono text-xs sm:text-sm">{t.tools}</p>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* Direct Application CTA */}
      <Section className="!pt-0">
        <Card className="max-w-3xl mx-auto p-8 md:p-12 border border-border bg-gradient-to-br from-card to-accent/20 text-center rounded-3xl shadow-elegant">
          <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4 shadow-elegant">
            <Mail className="h-7 w-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Don't see your exact role?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-lg mx-auto">
            We are always interested in meeting exceptional self-starters, software architects, and tech enthusiasts. Send us your GitHub, portfolio, or resume.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary text-primary-foreground shadow-elegant"
            >
              <a href={`mailto:${COMPANY.email}?subject=Spontaneous Application — ${COMPANY.name}`}>
                Email Your Resume <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent text-foreground">
              <Link to="/contact">Use Contact Form</Link>
            </Button>
          </div>
        </Card>
      </Section>
    </>
  );
}
