import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Code2,
  Smartphone,
  Brain,
  Palette,
  Settings,
  Briefcase,
  GraduationCap,
  Clock,
  Users,
  UserCheck,
  FileText,
  CheckCircle,
  Target,
  Eye,
  Rocket,
  ShieldCheck,
  Star,
  Quote,
  Layers,
  BookOpen,
  Cloud,
  Terminal,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import heroTech from "@/assets/hero-tech.jpg";
import skyrovixLogo from "@/assets/skyrovix-logo.png";
import vinixLogo from "@/assets/vinix-logo.png";
import msmeLogo from "@/assets/msme-logo.png";
import { COMPANY } from "@/lib/company";
import { AdSlot } from "@/components/AdSlot";
import { AD_SLOTS } from "@/lib/ads";

export const Route = createFileRoute("/")(
  {
  head: () => ({
    meta: [
      {
        title: "YR NOVATECH | Software Development, AI & Project-Based Internships",
      },
      {
        name: "description",
        content:
          "YR NOVATECH is an MSME-registered software company building web, mobile, AI and data products, and running project-based internships across Full Stack, UI/UX, AI/ML, Python, C++ and Cyber Security.",
      },
      { property: "og:title", content: "YR NOVATECH | Software Development & Engineering Internships" },
      {
        property: "og:description",
        content:
          "Software development capabilities, delivery approach, internship programs, technical resources and company information from YR NOVATECH.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.yrnovatech.in/" },
    ],
    links: [{ rel: "canonical", href: "https://www.yrnovatech.in/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "YR NOVATECH",
          url: "https://www.yrnovatech.in",
          publisher: {
            "@type": "Organization",
            name: "YR NOVATECH",
            url: "https://www.yrnovatech.in",
          },
        }),
      },
    ],
  }),
  component: Index,
});

/* ─── Service cards data ─── */
const services = [
  {
    icon: Code2,
    title: "Web Development",
    desc: "Marketing sites, dashboards and full-stack web applications built for speed, accessibility and long-term maintainability.",
    anchor: "#web-development",
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    desc: "Android and iOS applications designed around real usage patterns, with offline-aware data and clean release cycles.",
    anchor: "#mobile-app-development",
  },
  {
    icon: Brain,
    title: "AI & Data Analytics",
    desc: "Machine learning models, document retrieval systems, forecasting and analytics pipelines that answer specific business questions.",
    anchor: "#ai-ml",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "Interface design, design systems and accessibility reviews that make complex products easier to use.",
    anchor: "#ui-ux-design",
  },
  {
    icon: Settings,
    title: "Custom Software",
    desc: "Internal tools, workflow automation and integrations built around the way your team already works.",
    anchor: "#custom-software-development",
  },
];

/* ─── Why Choose Us cards ─── */
const whyUsCards = [
  {
    icon: Target,
    title: "Mission",
    desc: "Build dependable software for businesses, and give aspiring engineers a structured, project-based way to learn how real software is delivered.",
  },
  {
    icon: Eye,
    title: "Vision",
    desc: "Be a software engineering partner that clients trust with production systems, and a training ground that produces engineers who can contribute from day one.",
  },
  {
    icon: Rocket,
    title: "Where We Are Going",
    desc: "Grow a durable services practice, publish our engineering work openly, and keep expanding the internship program into new domains.",
  },
];

const deliverySteps = [
  {
    step: "01",
    title: "Scope the problem",
    body: "We start with the business problem rather than a technology choice: who uses it, what breaks today, what constraints apply, and what a good outcome looks like.",
  },
  {
    step: "02",
    title: "Design the approach",
    body: "Architecture, data model, interfaces and delivery stages are agreed before build work begins, so expectations and effort are visible up front.",
  },
  {
    step: "03",
    title: "Build in reviewable increments",
    body: "Work is delivered in reviewable stages rather than one large handover, so you can redirect early instead of paying to undo a finished system.",
  },
  {
    step: "04",
    title: "Test, launch and hand over",
    body: "Release includes verification against the agreed scope, deployment, documentation and a clear handover of what your team needs to operate it.",
  },
];

const capabilities = [
  {
    icon: Layers,
    title: "Product & web engineering",
    body: "Front-end interfaces, REST APIs, authentication, role-based access, dashboards and admin tooling — the parts that turn an idea into something people can actually use.",
  },
  {
    icon: Database,
    title: "Data & analytics",
    body: "Data pipelines, cleaning, exploratory analysis, reporting and visualisation that turn raw operational data into decisions you can defend.",
  },
  {
    icon: Brain,
    title: "Applied AI & machine learning",
    body: "Classification, forecasting, document search with retrieval-augmented generation, and model integration into existing products — chosen only where they genuinely help.",
  },
  {
    icon: Smartphone,
    title: "Mobile applications",
    body: "Cross-platform apps with sensible offline behaviour, clear navigation and release processes that keep updates predictable.",
  },
  {
    icon: Palette,
    title: "Interface & experience design",
    body: "Wireframes, prototypes, design systems and accessibility review, so the product is usable before a line of production code is written.",
  },
  {
    icon: Cloud,
    title: "Cloud, deployment & operations",
    body: "Environment setup, CI/CD, hosting, monitoring and documentation — the operational layer that keeps a launch from becoming a maintenance problem.",
  },
];

const techGroups = [
  { icon: Terminal, label: "Languages", items: "TypeScript, JavaScript, Python, C/C++, SQL" },
  { icon: Code2, label: "Web frameworks", items: "React, Next.js, Node.js, REST APIs" },
  { icon: Database, label: "Data", items: "PostgreSQL, Supabase, pandas, analytics workflows" },
  { icon: Brain, label: "AI & ML", items: "Scikit-learn, LLM integration, retrieval-augmented generation" },
  { icon: Cloud, label: "Platform", items: "Cloud hosting, CI/CD, version control, code review" },
  { icon: Smartphone, label: "Mobile & design", items: "Cross-platform mobile UI, Figma-based design systems" },
];

const audiences = [
  {
    title: "Startups and small businesses",
    body: "Teams that need a working product without hiring a full engineering department first.",
  },
  {
    title: "Established businesses",
    body: "Organisations replacing spreadsheets, manual processes or aging internal tools with something maintainable.",
  },
  {
    title: "Students and early-career engineers",
    body: "Learners who want structured, reviewed project work rather than tutorial-following, through our internship program.",
  },
];

const homeFaqs = [
  {
    q: "What does YR NOVATECH actually build?",
    a: "Web applications, mobile apps, internal tools, data and analytics pipelines, and AI-assisted features. Engagements usually start with a scoping conversation about the problem, not a fixed package.",
    to: "/services" as const,
    label: "See all services",
  },
  {
    q: "How do projects get delivered?",
    a: "In reviewable stages: scope, design the approach, build and review incrementally, then test, launch and hand over documentation. You see progress as it happens rather than at the end.",
    to: "/projects" as const,
    label: "Read about case studies",
  },
  {
    q: "Is the internship really project-based?",
    a: "Yes. Interns work through structured tasks, submit work for review, receive written feedback, and only qualify for a certificate once their required tasks are approved.",
    to: "/internship" as const,
    label: "Internship details",
  },
  {
    q: "Is the internship free?",
    a: "Yes. Registration, participation and certificate issuance are completely free. There are no payment steps, no processing fees and no hidden charges at any stage.",
    to: "/faq" as const,
    label: "Read the full FAQ",
  },
];

function Index() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("feedback")
          .select("id, rating, message, created_at, user_id")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(6);
        if (error || !data || data.length === 0) return;

        const userIds = [...new Set(data.map((f: any) => f.user_id).filter(Boolean))] as string[];
        let profileMap: Record<string, any> = {};
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);
          if (profiles) {
            for (const p of profiles) profileMap[p.id] = p;
          }
        }

        setTestimonials(
          data.map((f: any) => ({
            ...f,
            student_name: profileMap[f.user_id]?.full_name ?? null,
          })),
        );
      } catch {
        // Silently ignore — testimonials are non-critical
      }
    })();
  }, []);

  return (
    <div className="bg-background">
      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-accent/40 via-background to-accent/20">
        <div
          className="absolute inset-0 -z-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] -z-0" />

        <div className="container mx-auto px-4 lg:px-6 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <Reveal className="order-2 md:order-1">
              <p className="text-primary font-semibold text-xs md:text-sm tracking-[0.15em] uppercase mb-4">
                Software Development &amp; Engineering Training
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
                Innovate. <span className="text-gradient">Develop.</span>
                <br />
                Deliver.
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                YR NOVATECH is an MSME-registered software company based in Tamil Nadu. We design
                and engineer web, mobile, data and AI products for businesses, and we train the next
                generation of engineers through a structured, project-based internship program.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-lg">
                If you are evaluating us as a development partner, the pages below explain what we
                build, how we deliver it, and what previous work we are able to publish. If you are
                a student, the internship page explains the domains, tasks, review process and
                certificate requirements in full.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-elegant hover:shadow-glow transition-all"
                >
                  <Link to="/services">
                    Explore Our Services <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-full px-6 border-border text-foreground hover:bg-accent hover:border-primary/20"
                >
                  <Link to="/internship">Internship Program</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="rounded-full px-6 text-foreground hover:bg-accent"
                >
                  <Link to="/contact">Talk to us</Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={150} className="order-1 md:order-2 flex justify-center">
              <img
                src={heroTech}
                alt="Software development technology illustration"
                className="w-full max-w-lg md:max-w-xl object-contain drop-shadow-2xl rounded-2xl"
                width={600}
                height={450}
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FACTS STRIP ═══════════════════ */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Briefcase, value: "6", label: "Internship domains" },
              { icon: Clock, value: "1–3 months", label: "Internship durations" },
              { icon: GraduationCap, value: "Online", label: "Remote, project-based" },
              { icon: ShieldCheck, value: COMPANY.udyam, label: "MSME / Udyam registered" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 md:gap-4">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg md:text-xl font-bold text-foreground break-words">
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ WHO WE ARE ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          <Reveal className="md:col-span-5">
            <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-primary/20 text-primary mb-4">
              Who We Are
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4">
              A software company that ships products, and teaches how they are shipped
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              YR NOVATECH works on two connected problems. The first is that many businesses know
              what they need but lack the engineering capacity to build and maintain it. The second
              is that many students finish a course without ever having built something that was
              reviewed, criticised and improved by someone else.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              We address both through the same practice: real engineering work, done in reviewable
              increments, with written feedback at every stage — whether the person on the other
              side is a client or an intern.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              <Button asChild size="sm" variant="outline">
                <Link to="/about">About the company</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/services">What we build</Link>
              </Button>
            </div>
          </Reveal>

          <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
            {capabilities.map((c, i) => (
              <Reveal key={c.title} delay={i * 60}>
                <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">{c.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ OUR SERVICES ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Services</h2>
              <p className="text-muted-foreground text-sm mt-1 max-w-2xl">
                Each service line below has a dedicated page covering the problems it solves, what
                we build, the approach we follow and who it suits.
              </p>
            </div>
            <Link
              to="/services"
              className="text-primary text-sm font-medium hover:text-primary/80 flex items-center gap-1 shrink-0 transition-colors"
            >
              View All Services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 60}>
              <div className="group rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1.5">{s.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-1">{s.desc}</p>
                <Link
                  to="/services"
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                >
                  Learn more <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════ HOW WE DELIVER ═══════════════════ */}
      <section className="bg-surface">
        <div className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
          <Reveal>
            <div className="max-w-3xl mb-10">
              <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-primary/20 text-primary mb-4">
                Delivery Approach
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
                How a project moves from idea to release
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The same four-stage approach applies to client builds and to internship capstones.
                It exists to keep scope honest and progress visible — not to add process for its own
                sake.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {deliverySteps.map((s, i) => (
              <Reveal key={s.step} delay={i * 80}>
                <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                  <div className="text-3xl font-bold text-primary/25 mb-3">{s.step}</div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline">
              <Link to="/projects">Our publication policy for case studies</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/internship">How interns follow the same workflow</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════ TECHNOLOGY FOCUS ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
        <Reveal>
          <div className="max-w-3xl mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Technology we work with
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We choose technology to fit the problem and the team who will maintain it. These are
              the categories we work in day to day — described honestly, without claiming
              certifications or platforms we do not use.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {techGroups.map((t, i) => (
            <Reveal key={t.label} delay={i * 60}>
              <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                <div className="flex items-center gap-2.5 mb-2">
                  <t.icon className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground">{t.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.items}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6">
          <Link
            to="/resources"
            className="text-primary text-sm font-medium hover:text-primary/80 inline-flex items-center gap-1"
          >
            Read our technical guides and learning resources <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════ WHO WE WORK WITH ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          <Reveal className="md:col-span-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
              Who our services are for
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              We are usually most useful when there is a real problem to solve and a person who
              owns the outcome. If that is not the case yet, we will say so rather than sell you a
              build you do not need.
            </p>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
              <Link to="/contact">
                Describe your problem <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </Reveal>

          <div className="md:col-span-8 grid sm:grid-cols-3 gap-4">
            {audiences.map((a, i) => (
              <Reveal key={a.title} delay={i * 80}>
                <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h3 className="font-semibold text-foreground text-sm mb-2">{a.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TRUSTED COLLABORATIONS ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-12 md:py-16">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Trusted Collaborations
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                We work alongside these technology partners on delivery and infrastructure.
              </p>
            </div>
            <Link
              to="/about"
              className="text-primary text-sm font-medium hover:text-primary/80 flex items-center gap-1 shrink-0 transition-colors"
            >
              More about us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 py-8">
          <a
            href="https://www.skyrovix.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 transition-all hover:scale-105"
          >
            <img
              src={skyrovixLogo}
              alt="Skyrovix"
              className="h-10 md:h-14 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </a>
          <div className="w-px h-14 bg-border hidden md:block" />
          <a
            href="https://www.vinix.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 transition-all hover:scale-105"
          >
            <img
              src={vinixLogo}
              alt="Vinix Partner"
              className="h-10 md:h-14 w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </section>

      {/* ═══════════════════ WHY CHOOSE US ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          <Reveal className="md:col-span-3">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Why Choose Us?
            </h2>
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
              We would rather explain how we work than ask you to take our word for it.
            </p>
            <Button
              asChild
              className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 shadow-elegant"
            >
              <Link to="/about">
                Explore More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </Reveal>

          <div className="md:col-span-9 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {whyUsCards.map((w, i) => (
              <Reveal key={w.title} delay={i * 80}>
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
                    <w.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">{w.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
                </div>
              </Reveal>
            ))}

            <Reveal delay={240}>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all h-full">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
                  <img src={msmeLogo} alt="MSME" className="h-6 w-6 object-contain" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-2">MSME Registered</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Registered with the Ministry of Micro, Small &amp; Medium Enterprises, Government
                  of India.
                </p>
                <p className="text-[10px] font-mono text-primary mt-2 font-semibold">
                  {COMPANY.udyam}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════ INTERNSHIP ═══════════════════ */}
      <section className="bg-surface">
        <div className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
          <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
            <Reveal className="md:col-span-5">
              <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-primary/20 text-primary mb-4">
                Internship Program
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-4">
                Learn by building, with every submission reviewed
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                Our internship runs online across six domains: Full Stack Development, UI/UX Design,
                Python, C++, Cyber Security, and Artificial Intelligence &amp; Machine Learning.
                Durations are one, two or three months.
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                Instead of video lessons, interns work through a defined task list. Each task is
                submitted with links or files, reviewed, and either approved or returned with
                written feedback. A certificate is only issued once the required tasks for the
                chosen duration are approved.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link to="/internship">
                    Internship details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/faq">Internship FAQ</Link>
                </Button>
              </div>
            </Reveal>

            <div className="md:col-span-7 grid sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Users,
                  title: "Six real domains",
                  body: "Each domain has its own task list, capstone expectation and review criteria rather than a shared generic syllabus.",
                },
                {
                  icon: FileText,
                  title: "Submission & review",
                  body: "Work is submitted through the platform, checked against the task, and returned with feedback if it does not yet meet the bar.",
                },
                {
                  icon: UserCheck,
                  title: "Admin verification",
                  body: "Approvals are recorded against each task, so progress and eligibility are auditable rather than self-reported.",
                },
                {
                  icon: CheckCircle,
                  title: "Verified certificates",
                  body: "Certificates carry a verifiable code, and anyone can confirm one through the public verification tool.",
                },
              ].map((b, i) => (
                <Reveal key={b.title} delay={i * 60}>
                  <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
                      <b.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-2">{b.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.body}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ RESOURCES ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
        <Reveal>
          <div className="max-w-3xl mb-8">
            <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-primary/20 text-primary mb-4">
              Resources
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
              Technical guides written from our own engineering work
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our resource library covers full stack development, applied AI, Python, data
              analytics, UI/UX and internship preparation. Each guide exists to solve a specific
              problem developers actually hit — not to fill space.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, title: "Web & full stack", body: "API design, authentication, database choices and the debugging habits that keep a codebase healthy." },
            { icon: Brain, title: "AI & machine learning", body: "Retrieval-augmented generation, model selection, evaluation and shipping AI features that hold up." },
            { icon: Database, title: "Data analytics", body: "Profiling, cleaning, exploratory analysis and reporting that survives contact with messy real data." },
            { icon: GraduationCap, title: "Internship preparation", body: "How to structure a submission, handle review feedback, and build work worth showing." },
          ].map((r, i) => (
            <Reveal key={r.title} delay={i * 60}>
              <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
                  <r.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-2">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-6">
          <Button asChild size="sm" variant="outline">
            <Link to="/resources">
              Browse all resources <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ═══════════════════ FAQ PREVIEW ═══════════════════ */}
      <section className="bg-surface">
        <div className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
          <Reveal>
            <div className="max-w-3xl mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                Common questions
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Answers that match how this site and our programs actually behave. The full FAQ
                covers certificates, domains, duration and company information.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2">
            {homeFaqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 60}>
                <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card">
                  <h3 className="font-semibold text-foreground text-sm mb-2">{f.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{f.a}</p>
                  <Link
                    to={f.to}
                    className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    {f.label} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline">
              <Link to="/faq">Read all frequently asked questions</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/careers">Careers at YR NOVATECH</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/projects">Projects &amp; case studies</Link>
            </Button>
          </div>
        </div>
      </section>

      <AdSlot slot={AD_SLOTS.homeInline} className="py-2" />

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      {testimonials.length > 0 && (
        <section className="bg-surface py-16 md:py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <Reveal>
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-primary/20 text-primary mb-4">
                  Testimonials
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Student Experiences</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto">
                  Feedback submitted through the platform and approved for public display.
                </p>
              </div>
            </Reveal>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={t.id} delay={i * 60}>
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col h-full">
                    <Quote className="h-7 w-7 text-primary/20 mb-3" />
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{t.message}</p>
                    <div className="flex items-center gap-0.5 mb-3">
                      {[0, 1, 2, 3, 4].map((si) => (
                        <Star
                          key={si}
                          className={`h-3.5 w-3.5 ${si < t.rating ? "fill-primary text-primary" : "text-border"}`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-border">
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                        {t.student_name ? t.student_name.charAt(0).toUpperCase() : "S"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {t.student_name ?? "Student"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════ TRUST & POLICIES ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-12">
        <Reveal>
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-foreground mb-2">Company information &amp; policies</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-3xl">
              Everything about how we handle your data, the terms of using this site, and our
              internship policies is published in plain language. Nothing below is hidden behind
              marketing copy.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/privacy-policy">Privacy Policy</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/refund-policy">Refund Policy</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/contact">Contact</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/about">About YR NOVATECH</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-center">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to build something great?
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8">
                Whether you have a product to build, a system to replace, or a course to complement
                with real engineering practice — tell us what you are trying to do.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 rounded-full px-6 shadow-lg"
                >
                  <Link to="/contact">Get in touch</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 rounded-full px-6"
                >
                  <Link to="/internship">Apply for Internship</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
