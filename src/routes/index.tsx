import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Code2,
  Palette,
  Brain,
  Rocket,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Layers,
  Globe,
  Star,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";
import skyrovixLogo from "@/assets/skyrovix-logo.png";
import vinixLogo from "@/assets/vinix-logo.png";

export const Route = createFileRoute("/")({
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
    ],
  }),
  component: Index,
});

const services = [
  {
    icon: Code2,
    title: "Software Development",
    desc: "Robust, scalable custom software engineered for your business.",
  },
  {
    icon: Brain,
    title: "AI Solutions",
    desc: "LLM applications, automation, and intelligent decision systems.",
  },
  {
    icon: Layers,
    title: "Web Development",
    desc: "High-performance, modern websites and web applications.",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Cross-platform mobile experiences built to scale.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    desc: "Beautiful, intuitive product design that converts.",
  },
  {
    icon: Rocket,
    title: "Internship Programs",
    desc: "Project-based internships to launch your engineering career.",
  },
];

const domains = [
  "Full Stack Development",
  "UI/UX Design",
  "C++ Programming",
  "Python Programming",
  "Artificial Intelligence",
];

const whyUs = [
  { icon: Award, title: "Industry Mentors", desc: "Learn directly from experienced engineers." },
  { icon: Users, title: "Project-Based", desc: "Real work, not theory - ship a portfolio." },
  { icon: CheckCircle2, title: "Verified Certificates", desc: "QR-code verifiable on completion." },
  { icon: Rocket, title: "Career Ready", desc: "GitHub, LinkedIn, and interview support." },
];

function Index() {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("feedback")
          .select("id, rating, message, created_at, user_id")
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(12);
        if (cancelled || error || !data || data.length === 0) return;

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

        const enriched = data.map((f: any) => ({
          ...f,
          student_name: profileMap[f.user_id]?.full_name ?? null,
        }));

        if (!cancelled) setTestimonials(enriched);
      } catch {
        // Silently ignore — testimonials are non-critical
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroBg}
            alt=""
            className="h-full w-full object-cover opacity-30 dark:opacity-50"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="container mx-auto px-4 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/80 backdrop-blur text-xs font-medium mb-6 animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Now open for Summer 2026 internships
          </div>
          <h1
            className="text-4xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            Innovate. <span className="text-gradient">Develop.</span> Deliver
          </h1>
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            YR NOVATECH is a premium software company. We design, engineer, and ship world-class
            digital products and train the next generation of engineers through project-based
            internships.
          </p>
          <div
            className="flex flex-wrap justify-center gap-3 animate-fade-up"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-elegant"
            >
              <Link to="/services">
                Explore Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/internship">Apply for Internship</Link>
            </Button>
          </div>
          <div
            className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 md:grid-cols-4 animate-fade-up"
            style={{ animationDelay: "0.4s" }}
          >
            {[
              { k: "5+", v: "Service Lines" },
              { k: "5", v: "Internship Domains" },
              { k: "24h", v: "Response Time" },
              { k: "100%", v: "Hands-on Projects" },
            ].map((s) => (
              <div
                key={s.v}
                className="rounded-xl border border-border bg-card/80 backdrop-blur px-4 py-3 text-center"
              >
                <div className="text-2xl font-bold text-gradient">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section>
        <SectionHeading
          eyebrow="What we do"
          title="Services built for impact"
          description="From design to deployment, we partner with you across the product lifecycle."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Card
              key={s.title}
              className="p-6 border border-border hover:shadow-elegant transition-all hover:-translate-y-1 group animate-fade-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 shadow-elegant group-hover:scale-110 transition-transform">
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/30 rounded-3xl">
        <SectionHeading
          eyebrow="Internship Program"
          title="Learn by building real products"
          description="Project-based internships across five high-demand domains."
        />
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {domains.map((d) => (
            <span
              key={d}
              className="px-4 py-2 rounded-full bg-card border border-border text-sm font-medium hover:border-primary transition-colors"
            >
              {d}
            </span>
          ))}
        </div>
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-primary text-primary-foreground shadow-elegant"
          >
            <Link to="/internship">
              View Program Details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Why YR NOVATECH" title="Built on trust, designed for growth" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w, i) => (
            <div
              key={w.title}
              className="text-center animate-fade-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <w.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{w.title}</h3>
              <p className="text-sm text-muted-foreground">{w.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-secondary/30 rounded-3xl">
        <SectionHeading
          eyebrow="Our Partners"
          title="Trusted by industry leaders"
          description="We collaborate with forward-thinking companies to deliver exceptional opportunities."
        />
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
          <a
            href="https://www.skyrovix.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 transition-all hover:scale-105"
          >
            <img
              src={skyrovixLogo}
              alt="Skyrovix"
              className="h-14 md:h-18 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-sm text-muted-foreground font-medium">www.skyrovix.online</span>
          </a>
          <a
            href="https://www.vinix.online"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-3 transition-all hover:scale-105"
          >
            <img
              src={vinixLogo}
              alt="Vinix Technologies"
              className="h-14 md:h-18 w-auto object-contain opacity-70 group-hover:opacity-100 transition-opacity"
            />
            <span className="text-sm text-muted-foreground font-medium">www.vinix.online</span>
          </a>
        </div>
      </Section>

      {testimonials.length > 0 && (
        <Section>
          <SectionHeading
            eyebrow="Testimonials"
            title="Student Experiences"
            description="Real experiences from students and interns who learned, built, and grew with YR NOVATECH."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Card
                key={t.id}
                className="p-6 border border-border bg-card/80 backdrop-blur hover:shadow-elegant transition-all animate-fade-up flex flex-col"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Quote className="h-8 w-8 text-primary/20 mb-3" />
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">{t.message}</p>
                <div className="flex items-center gap-0.5 mb-3">
                  {[0, 1, 2, 3, 4].map((si) => (
                    <Star
                      key={si}
                      className={`h-3.5 w-3.5 ${si < t.rating ? "fill-blue-500 text-blue-500" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
                    {t.student_name ? t.student_name.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.student_name ?? "Student"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Section>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-center">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover" }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to build something great?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Whether you're hiring a team or starting your career - we'd love to talk.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/contact">Get in touch</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link to="/apply">Apply for Internship</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section id="cta" className="py-16 md:py-24 bg-gradient-hero text-white">
        <div className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center">
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover" }}
          />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Ready to build something great?
            </h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              Whether you're hiring a team or starting your career - we'd love to talk.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/contact">Get in touch</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
              >
                <Link to="/apply">Apply for Internship</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
