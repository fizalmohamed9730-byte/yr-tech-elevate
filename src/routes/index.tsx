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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import heroTech from "@/assets/hero-tech.jpg";
import skyrovixLogo from "@/assets/skyrovix-logo.png";
import vinixLogo from "@/assets/vinix-logo.png";
import msmeLogo from "@/assets/msme-logo.png";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/")(
  {
  head: () => ({
    meta: [
      { title: "YR NOVATECH - Innovate. Develop. Deliver." },
      {
        name: "description",
        content:
          "Premium software development and project-based internships in Full Stack, UI/UX, AI, Python, and C++.",
      },
      { property: "og:title", content: "YR NOVATECH - Innovate. Develop. Deliver." },
      {
        property: "og:description",
        content:
          "YR NOVATECH - premium software development, AI, web, mobile, and UI/UX services plus project-based internships.",
      },
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
    desc: "Modern, scalable, and responsive web applications.",
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    desc: "Android & iOS applications with great UX.",
  },
  {
    icon: Brain,
    title: "AI & Data Analytics",
    desc: "Data-driven insights for smarter decisions.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "Beautiful and user-friendly digital experiences.",
  },
  {
    icon: Settings,
    title: "Custom Software",
    desc: "Tailored solutions for your business needs.",
  },
];

/* ─── Why Choose Us cards ─── */
const whyUsCards = [
  {
    icon: Target,
    title: "Mission",
    desc: "Empower businesses and aspiring engineers through high-quality software and immersive training.",
  },
  {
    icon: Eye,
    title: "Vision",
    desc: "Become India's most trusted partner for software craftsmanship and ed-tech excellence.",
  },
  {
    icon: Rocket,
    title: "Future Goals",
    desc: "Train 10,000+ engineers and launch our own SaaS products by 2027.",
  },
];

function Index() {
  const [stats, setStats] = useState<{
    total: number;
    active: number;
    pending: number;
    completed: number;
  } | null>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Single batch fetch for both stats and testimonials
    (async () => {
      try {
        // Stats: Fetch counts from internships table
        const [{ count: total }, { count: active }, { count: pending }, { count: completed }] =
          await Promise.all([
            supabase.from("internships").select("id", { count: "exact", head: true }),
            supabase
              .from("internships")
              .select("id", { count: "exact", head: true })
              .eq("status", "active"),
            supabase
              .from("internships")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending"),
            supabase
              .from("internships")
              .select("id", { count: "exact", head: true })
              .eq("status", "completed"),
          ]);
        setStats({
          total: total ?? 0,
          active: active ?? 0,
          pending: pending ?? 0,
          completed: completed ?? 0,
        });
      } catch {
        // Silently ignore — stats are non-critical for page render
      }

      try {
        const { data, error } = await (supabase as any)
          .from("feedback")
          .select("id, rating, message, created_at, user_id")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(12);
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
        {/* Subtle geometric background pattern */}
        <div
          className="absolute inset-0 -z-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        {/* Decorative gradient orb */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] -z-0" />

        <div className="container mx-auto px-4 lg:px-6 py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left content */}
            <Reveal className="order-2 md:order-1">
              <p className="text-primary font-semibold text-xs md:text-sm tracking-[0.15em] uppercase mb-4">
                BUILDING A SMARTER TOMORROW
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
                Innovate. <span className="text-gradient">Develop.</span>
                <br />
                Deliver.
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-lg">
                YR NOVATECH is a premium software company. We design, engineer and ship world-class
                digital products and train the next generation of engineers through project-based
                internships.
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
                  <Link to="/internship">Apply for Internship</Link>
                </Button>
              </div>
            </Reveal>

            {/* Right illustration */}
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

      {/* ═══════════════════ STATISTICS STRIP ═══════════════════ */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 lg:px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Briefcase, value: "5+", label: "Service Lines" },
              { icon: GraduationCap, value: "5", label: "Internship Domains" },
              { icon: Clock, value: "24h", label: "Response Time" },
              { icon: Users, value: "100%", label: "Hands-on Projects" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 md:gap-4">
                <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
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
              <p className="text-muted-foreground text-sm mt-1">
                Tailored solutions for your digital growth.
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
                  className="w-8 h-8 rounded-full border border-border text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  aria-label={`Learn more about ${s.title}`}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════ OUR IMPACT — STATS ═══════════════════ */}
      <section className="bg-surface">
        <div className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
              {/* Left heading */}
              <div className="md:max-w-xs shrink-0">
                <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-primary/20 text-primary mb-4">
                  Our Impact
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                  Growing Together
                  <br />
                  Building Better Futures
                </h2>
                <p className="text-muted-foreground text-sm mt-3">
                  A quick look at the numbers that define our journey.
                </p>
              </div>

              {/* Right stat cards */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Users, value: stats?.total ?? "—", label: "Total Interns" },
                  { icon: UserCheck, value: stats?.active ?? "—", label: "Active Interns" },
                  { icon: FileText, value: stats?.pending ?? "—", label: "Pending Applications" },
                  { icon: CheckCircle, value: stats?.completed ?? "—", label: "Completed" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-card rounded-2xl border border-border p-5 text-center shadow-card"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════ IMPACT CTA PANEL ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-8">
        <Reveal>
          <div className="rounded-2xl border border-border bg-accent/30 p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border border-primary/20 text-primary mb-3">
                Our Impact
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
                Growing Together
                <br />
                Building Better Futures
              </h2>
              <p className="text-muted-foreground text-sm mt-2">
                A quick look at the numbers that define our journey.
              </p>
            </div>
            <Link
              to="/about"
              className="text-primary text-sm font-medium hover:text-primary/80 flex items-center gap-1 shrink-0 transition-colors"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
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
                We work with trusted partners to deliver the best technology solutions.
              </p>
            </div>
            <Link
              to="/about"
              className="text-primary text-sm font-medium hover:text-primary/80 flex items-center gap-1 shrink-0 transition-colors"
            >
              View All <ArrowRight className="h-4 w-4" />
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
          {/* Left heading */}
          <Reveal className="md:col-span-3">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
              Why Choose Us?
            </h2>
            <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
              We focus on quality, innovation and long-term growth for every learner and client.
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

          {/* Right cards grid */}
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

            {/* MSME Certified Card */}
            <Reveal delay={240}>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card hover:shadow-card-hover transition-all h-full">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
                  <img src={msmeLogo} alt="MSME" className="h-6 w-6 object-contain" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-2">MsME Certified</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Registered under the Ministry of Micro, Small & Medium Enterprises, Government of
                  India.
                </p>
                <p className="text-[10px] font-mono text-primary mt-2 font-semibold">
                  {COMPANY.udyam}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

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
                  Real experiences from students and interns who learned, built, and grew with YR
                  NOVATECH.
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

      {/* ═══════════════════ CTA SECTION ═══════════════════ */}
      <section className="container mx-auto px-4 lg:px-6 py-16 md:py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-center">
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to build something great?
              </h2>
              <p className="text-white/70 max-w-xl mx-auto mb-8">
                Whether you're hiring a team or starting your career — we'd love to talk.
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
                  <Link to="/apply">Apply for Internship</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
