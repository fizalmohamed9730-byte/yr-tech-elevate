import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Code2, Palette, Brain, Shield, Rocket, Award, Users, CheckCircle2, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/Section";
import heroBg from "@/assets/hero-bg.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YR NOVATECH — Innovate · Develop · Deliver" },
      { name: "description", content: "Premium software development and project-based internships in Full Stack, UI/UX, AI, Python, and Cyber Security." },
      { property: "og:title", content: "YR NOVATECH — Innovate · Develop · Deliver" },
      { property: "og:description", content: "Modern software studio and ed-tech platform." },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Code2, title: "Web Development", desc: "Modern, performant websites and web apps." },
  { icon: Rocket, title: "Full Stack Development", desc: "End-to-end product engineering." },
  { icon: Palette, title: "UI/UX Design", desc: "Beautiful, intuitive product design." },
  { icon: Brain, title: "AI Solutions", desc: "LLM apps, automation, and intelligent systems." },
  { icon: Shield, title: "Software Solutions", desc: "Custom software tailored to your business." },
  { icon: Sparkles, title: "Technical Consulting", desc: "Architecture, audits, and strategy." },
];

const domains = ["Full Stack Development", "UI/UX Design", "C++ Programming", "Python Programming", "Cyber Security"];

const whyUs = [
  { icon: Award, title: "Industry Mentors", desc: "Learn directly from experienced engineers." },
  { icon: Users, title: "Project-Based", desc: "Real work, not theory — ship a portfolio." },
  { icon: CheckCircle2, title: "Verified Certificates", desc: "QR-code verifiable on completion." },
  { icon: Rocket, title: "Career Ready", desc: "GitHub, LinkedIn, and interview support." },
];

const testimonials = [
  { name: "Aarav S.", role: "Full Stack Intern", text: "The mentor feedback was incredible. I shipped two real projects in 8 weeks." },
  { name: "Priya M.", role: "UI/UX Intern", text: "Best learning experience — the team genuinely cares about your growth." },
  { name: "Rohan K.", role: "Python Intern", text: "Got my first job offer thanks to the portfolio I built at YR NOVATECH." },
];

function Index() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroBg} alt="" className="h-full w-full object-cover opacity-30 dark:opacity-50" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>
        <div className="container mx-auto px-4 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-background/60 backdrop-blur text-xs font-medium mb-6 animate-fade-up">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Now open for Summer 2026 internships
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Building <span className="text-gradient">tomorrow's</span><br />
            technology, today.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            YR NOVATECH is a modern software studio and learning platform. We craft world-class digital products and train the next generation of engineers.
          </p>
          <div className="flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-elegant">
              <Link to="/internship">Start Internship <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <Section>
        <SectionHeading eyebrow="What we do" title="Services built for impact" description="From design to deployment, we partner with you across the product lifecycle." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Card key={s.title} className="p-6 hover:shadow-elegant transition-all hover:-translate-y-1 group animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 shadow-elegant group-hover:scale-110 transition-transform">
                <s.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* INTERNSHIPS */}
      <Section className="bg-secondary/30 rounded-3xl">
        <SectionHeading eyebrow="Internship Program" title="Learn by building real products" description="Project-based internships across five high-demand domains." />
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {domains.map((d) => (
            <span key={d} className="px-4 py-2 rounded-full bg-background border border-border text-sm font-medium hover:border-primary transition-colors">
              {d}
            </span>
          ))}
        </div>
        <div className="text-center">
          <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground shadow-elegant">
            <Link to="/internship">View Program Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </Section>

      {/* WHY US */}
      <Section>
        <SectionHeading eyebrow="Why YR NOVATECH" title="Built on trust, designed for growth" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {whyUs.map((w, i) => (
            <div key={w.title} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="h-14 w-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                <w.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{w.title}</h3>
              <p className="text-sm text-muted-foreground">{w.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section>
        <SectionHeading eyebrow="Testimonials" title="What our interns say" />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="p-6">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
              </div>
              <p className="text-sm mb-4 text-foreground/90">"{t.text}"</p>
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-10 md:p-16 text-center">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover" }} />
          <div className="relative">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to build something great?</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">Whether you're hiring a team or starting your career — we'd love to talk.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/contact">Get in touch</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                <Link to="/apply">Apply for Internship</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
