import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Brain,
  Layers,
  Smartphone,
  Palette,
  GraduationCap,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Workflow,
  Cpu,
  Rocket,
  Headphones,
  Check,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services - Web, Full Stack, AI & More | YR NOVATECH" },
      {
        name: "description",
        content:
          "Software development, AI solutions, web & mobile apps, UI/UX design, and internship programs from YR NOVATECH.",
      },
      { property: "og:title", content: "YR NOVATECH Services" },
      { property: "og:description", content: "End-to-end product engineering and AI solutions." },
      { property: "og:url", content: "https://www.yrnovatech.in/services" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/services" }],
  }),
  component: Services,
});

const services = [
  {
    icon: Code2,
    title: "Software Development",
    tagline: "Custom Architecture",
    desc: "Robust, scalable enterprise software engineered for long-term reliability — from microservices and internal business tooling to high-throughput platforms.",
    features: ["Custom Web & SaaS Builds", "REST & GraphQL APIs", "Business Process Automation", "Cloud Infrastructure on AWS/Vercel"],
    tech: ["TypeScript", "Node.js", "Python", "PostgreSQL", "Docker"],
  },
  {
    icon: Brain,
    title: "AI & Intelligent Systems",
    tagline: "Next-Gen Capabilities",
    desc: "Domain-specific LLM implementations, context-aware RAG pipelines, autonomous agents, and predictive algorithms seamlessly integrated into existing products.",
    features: ["Custom Chatbots & Assistants", "RAG & Vector Knowledge Bases", "Autonomous Workflow Agents", "Data Extraction & OCR Pipelines"],
    tech: ["LangChain", "OpenAI / Claude APIs", "FastAPI", "Pinecone", "PyTorch"],
  },
  {
    icon: Layers,
    title: "Web Application Engineering",
    tagline: "Lightning-Fast Performance",
    desc: "Modern, responsive, and search-optimized web applications with sub-second page loads, intuitive user flows, and high conversion rates.",
    features: ["Single Page & SSR Applications", "Enterprise Dashboards", "E-commerce & Subscription Portals", "Headless CMS Integrations"],
    tech: ["React", "Next.js", "Tailwind CSS", "TanStack", "Supabase"],
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    tagline: "Cross-Platform Precision",
    desc: "Fluid, native-feeling mobile applications built for both iOS and Android from a unified codebase, cutting time-to-market without compromising UX.",
    features: ["iOS & Android Cross-Platform Apps", "Offline-First Architectures", "Biometrics & Push Notifications", "App Store & Play Store Submissions"],
    tech: ["React Native", "Expo", "Flutter", "Firebase", "SQLite"],
  },
  {
    icon: Palette,
    title: "UI/UX & Product Design",
    tagline: "Human-Centered Design",
    desc: "Comprehensive product design that balances visual beauty with functional ergonomics. High-fidelity prototypes, design systems, and user testing.",
    features: ["User Journey Mapping & Wireframes", "Interactive Figma Prototypes", "Scalable Design Token Systems", "Usability Testing & Accessibility Audits"],
    tech: ["Figma", "Design Systems", "Prototyping", "WCAG 2.1 AAA"],
  },
  {
    icon: GraduationCap,
    title: "Internship & Learning Programs",
    tagline: "Hands-On Engineering",
    desc: "Structured, real-world project internships in high-demand technical domains. Students and career switchers gain practical engineering competence.",
    features: ["6 Specialized Technical Domains", "Real Production Project Tasks", "Code Reviews & Mentor Feedback", "Publicly Verifiable QR Certificates"],
    tech: ["Full Stack", "AI/ML", "Python", "UI/UX", "C++"],
  },
];

const lifecycleSteps = [
  {
    step: "01",
    title: "Discovery & Scope",
    desc: "We analyze technical goals, business objectives, edge cases, and define clear deliverables with accurate timeline estimations.",
    icon: Workflow,
  },
  {
    step: "02",
    title: "Architecture & UX",
    desc: "We engineer resilient database schemas, API contracts, interactive component prototypes, and security boundaries.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Iterative Build & QA",
    desc: "Sprint-driven development with frequent code reviews, end-to-end automated testing, and transparent milestone progress demos.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Deploy & Scale",
    desc: "Zero-downtime CI/CD deployment pipelines, automated telemetry monitoring, performance optimization, and proactive maintenance.",
    icon: Rocket,
  },
];

const pillars = [
  {
    title: "Production-Grade Standards",
    desc: "We write clean, strictly-typed code with comprehensive error boundaries and automated checks. No untested shortcuts.",
  },
  {
    title: "Full Transparency",
    desc: "Direct communication with engineers, version-controlled deliverable milestones, and no hidden retainer surprises.",
  },
  {
    title: "Security & Privacy First",
    desc: "Data encryption in transit and at rest, role-based access controls, and strict compliance with modern privacy requirements.",
  },
  {
    title: "Continuous Support",
    desc: "Post-launch observability, timely dependency updates, and SLA-backed maintenance to keep your software performing at its peak.",
  },
];

function Services() {
  return (
    <>
      {/* Hero Section */}
      <Section className="pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/80 border border-border text-xs font-semibold uppercase tracking-wider text-accent-foreground mb-4">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Engineering Capabilities</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-foreground">
            Full-Stack Solutions for <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Ambitious Digital Products
            </span>
          </h1>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
            From modern web applications and autonomous AI systems to high-performance mobile apps and practical tech internships, we build what matters.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant">
              <Link to="/contact">
                Start a Conversation <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent">
              <Link to="/projects">
                Explore Portfolio
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Stat Counter Bar */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-card border border-border/80 shadow-sm">
          <div className="text-center p-2">
            <div className="text-2xl md:text-3xl font-bold text-foreground">6+</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Core Tech Domains</div>
          </div>
          <div className="text-center p-2 border-l border-border/60">
            <div className="text-2xl md:text-3xl font-bold text-primary">100%</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Modern Tech Stack</div>
          </div>
          <div className="text-center p-2 border-l border-border/60">
            <div className="text-2xl md:text-3xl font-bold text-foreground">MSME</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Certified Enterprise</div>
          </div>
          <div className="text-center p-2 border-l border-border/60">
            <div className="text-2xl md:text-3xl font-bold text-emerald-500">24/7</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-medium">Responsive Delivery</div>
          </div>
        </div>
      </Section>

      {/* Services Grid */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Specializations"
          title="What We Engineer"
          description="Modular, end-to-end development services tailored to product companies, growing startups, and aspiring developers."
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {services.map((s, i) => (
            <Card
              key={s.title}
              className="flex flex-col justify-between p-6 border border-border bg-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 rounded-2xl group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant group-hover:scale-105 transition-transform">
                    <s.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <Badge variant="outline" className="text-xs font-medium border-border/80 bg-accent/40">
                    {s.tagline}
                  </Badge>
                </div>

                <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                  {s.desc}
                </p>

                <div className="space-y-2 mb-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Key Deliverables</span>
                  <ul className="space-y-1.5">
                    {s.features.map((f) => (
                      <li key={f} className="text-xs text-foreground/90 flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div>
                <div className="pt-4 border-t border-border/60 flex flex-wrap gap-1.5">
                  {s.tech.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/60 text-[11px] font-medium text-muted-foreground border border-border/40"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Engineering Process */}
      <Section className="!pt-0">
        <div className="max-w-6xl mx-auto p-8 md:p-12 rounded-3xl bg-secondary/30 border border-border/70">
          <SectionHeading
            eyebrow="Our Process"
            title="How We Turn Ideas into Code"
            description="A disciplined, four-phase development lifecycle engineered for speed, predictability, and quality."
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {lifecycleSteps.map((st) => (
              <div key={st.step} className="p-5 rounded-2xl bg-card border border-border/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <st.icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-muted-foreground/30 font-mono">
                      {st.step}
                    </span>
                  </div>
                  <h4 className="font-semibold text-base mb-1.5 text-foreground">{st.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Pillars / Why Choose Us */}
      <Section className="!pt-0">
        <SectionHeading
          eyebrow="Quality Commitment"
          title="Why Work with YR NOVATECH"
          description="Every engagement is built around engineering integrity and transparent delivery."
        />

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {pillars.map((p) => (
            <Card key={p.title} className="p-6 border border-border bg-card rounded-2xl flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-base mb-1 text-foreground">{p.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Call to Action Banner */}
      <Section className="!pt-0">
        <div className="relative max-w-5xl mx-auto overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-accent/30 p-8 md:p-14 text-center shadow-elegant">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Headphones className="h-3.5 w-3.5" />
              <span>Available for New Projects &amp; Cohorts</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Build Your Next Product?
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-8 leading-relaxed">
              Whether you need end-to-end custom application engineering or want to enroll your students in our structured technical internship program, our team is ready.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant">
                <Link to="/contact">
                  Start a Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-border hover:bg-accent text-foreground">
                <Link to="/internship">
                  Explore Internships <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
